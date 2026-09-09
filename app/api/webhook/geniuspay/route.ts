import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateGeniusPayWebhook, handleGeniusPayWebhook, formatTicketCode } from '@/lib/geniuspay';
import { SecurityLogger } from '@/lib/security';
import { getClientIP } from '@/lib/rate-limit';

/**
 * Webhook pour recevoir les notifications de paiement de GeniusPay
 * URL à configurer dans le dashboard GeniusPay: https://yourdomain.com/api/webhook/geniuspay
 * 
 * Événements traités:
 * - payment.initiated: Paiement initié
 * - payment.success: Paiement réussi (génère les billets)
 * - payment.failed: Paiement échoué
 * - payment.cancelled: Paiement annulé
 */
export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    // Récupère les headers du webhook
    const signature = req.headers.get('x-webhook-signature') || req.headers.get('x-geniuspay-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');
    const event = req.headers.get('x-webhook-event');
    
    if (!signature) {
      SecurityLogger.logSuspiciousActivity('webhook_missing_signature', ip, { endpoint: 'geniuspay' });
      return NextResponse.json({ error: 'Signature manquante' }, { status: 401 });
    }

    if (!timestamp) {
      SecurityLogger.logSuspiciousActivity('webhook_missing_timestamp', ip, { endpoint: 'geniuspay' });
      return NextResponse.json({ error: 'Timestamp manquant' }, { status: 401 });
    }

    // Récupère le body brut pour la validation de signature
    const rawBody = await req.text();
    
    // Valide la signature du webhook avec timestamp
    const timestampNum = parseInt(timestamp, 10);
    if (isNaN(timestampNum)) {
      SecurityLogger.logSuspiciousActivity('webhook_invalid_timestamp', ip, { endpoint: 'geniuspay' });
      return NextResponse.json({ error: 'Timestamp invalide' }, { status: 401 });
    }

    const isValid = validateGeniusPayWebhook(rawBody, signature, timestampNum);
    if (!isValid) {
      SecurityLogger.logSuspiciousActivity('webhook_invalid_signature', ip, { endpoint: 'geniuspay' });
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    // Parse le body JSON
    const payload = JSON.parse(rawBody) as Record<string, unknown>;

    // Traite le webhook
    const webhookResult = await handleGeniusPayWebhook(payload);
    if (!webhookResult.success) {
      console.log('[Webhook] Handle webhook failed:', webhookResult);
      return NextResponse.json({ error: 'Erreur lors du traitement du webhook' }, { status: 400 });
    }

    const { reference, status, amount, orderId } = webhookResult;
    const supabase = createAdminClient();

    console.log('[Webhook] GeniusPay event:', { reference, status, orderId });

    // Si c'est un événement de succès de paiement
    if (status === 'completed' && orderId) {
      // Recherche la commande par ID
      const { data: order, error: orderError } = await supabase
        .from('tyla_orders')
        .select('*, tyla_ticket_categories(name, code_prefix, sold_count)')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.warn('[Webhook] Order not found:', { orderId });
        SecurityLogger.log('webhook_order_not_found', { orderId, reference });
        return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
      }

      if (!order) {
        return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
      }

      // Vérifier si la commande n'a pas déjà été payée (idempotence)
      if (order.status === 'paid') {
        console.log('[Webhook] Order already paid, skipping:', { orderId });
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Réserve atomiquement un bloc de N numéros consécutifs dans le segment
      // de cette catégorie (même fonction que /api/confirm-payment, pour
      // éviter toute collision entre commandes simultanées)
      const prefix = (order.tyla_ticket_categories?.code_prefix as string) || 'JAF';
      const { data: startNumber, error: reserveError } = await supabase.rpc(
        'tyla_reserve_ticket_numbers',
        { p_category_id: order.category_id, p_count: order.quantity }
      );

      if (reserveError || startNumber === null) {
        console.error('[Webhook] Failed to reserve ticket numbers:', reserveError);
        SecurityLogger.log('webhook_tickets_creation_failed', { orderId, error: reserveError?.message });
        return NextResponse.json({ error: 'Erreur lors de la génération des billets' }, { status: 500 });
      }

      // Créer les billets pour cette commande (mêmes colonnes réelles que confirm-payment)
      const tickets = Array.from({ length: order.quantity }).map((_, i) => {
        const ticketNumber = (startNumber as number) + i;
        return {
          order_id: orderId,
          category_id: order.category_id,
          ticket_number: ticketNumber,
          ticket_code: formatTicketCode(prefix, ticketNumber),
          buyer_name: order.buyer_name,
          buyer_email: order.buyer_email,
        };
      });

      // Insérer les billets en base de données
      const { error: insertError } = await supabase
        .from('tyla_tickets')
        .insert(tickets);

      if (insertError) {
        console.error('[Webhook] Failed to create tickets:', insertError);
        SecurityLogger.log('webhook_tickets_creation_failed', { orderId, error: insertError.message });
        return NextResponse.json({ error: 'Erreur lors de la création des billets' }, { status: 500 });
      }

      // Incrémente le compteur de billets vendus sur la catégorie
      const currentSoldCount = (order.tyla_ticket_categories as { sold_count?: number })?.sold_count ?? 0;
      await supabase
        .from('tyla_ticket_categories')
        .update({ sold_count: currentSoldCount + order.quantity })
        .eq('id', order.category_id);

      console.log('[Webhook] Tickets created:', { orderId, ticketCount: tickets.length });

      // Mettre à jour le statut de la commande
      const { error: updateError } = await supabase
        .from('tyla_orders')
        .update({
          status: 'paid',
          payment_transaction_id: reference,
          payment_raw_response: payload,
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('[Webhook] Failed to update order:', updateError);
        SecurityLogger.log('webhook_order_update_failed', { orderId, error: updateError.message });
        return NextResponse.json({ error: 'Erreur lors de la mise à jour de la commande' }, { status: 500 });
      }

      SecurityLogger.log('webhook_payment_confirmed', { 
        orderId: order.id, 
        reference, 
        amount,
        ticketCount: tickets.length,
      });
      console.log('[Webhook] Payment confirmed and tickets created:', { orderId });
    } else if (status === 'failed' && orderId) {
      // Mettre à jour le statut en cas d'échec
      const { data: order } = await supabase
        .from('tyla_orders')
        .select('id')
        .eq('id', orderId)
        .single();

      if (order) {
        await supabase
          .from('tyla_orders')
          .update({ 
            status: 'failed',
            payment_transaction_id: reference,
            payment_raw_response: payload,
          })
          .eq('id', order.id);

        SecurityLogger.log('webhook_payment_failed', { orderId, reference });
      }
    } else if (status === 'cancelled' && orderId) {
      // Mettre à jour le statut en cas d'annulation
      const { data: order } = await supabase
        .from('tyla_orders')
        .select('id')
        .eq('id', orderId)
        .single();

      if (order) {
        await supabase
          .from('tyla_orders')
          .update({
            status: 'cancelled',
            payment_transaction_id: reference,
            payment_raw_response: payload,
          })
          .eq('id', order.id);

        SecurityLogger.log('webhook_payment_cancelled', { orderId, reference });
      }
    }

    // Retourne un 200 OK pour confirmer la réception du webhook
    SecurityLogger.logApiCall('webhook/geniuspay', 'POST', ip, true);
    return NextResponse.json({ success: true, reference });
  } catch (err) {
    SecurityLogger.log('webhook_geniuspay_error', { 
      error: err instanceof Error ? err.message : 'Unknown error',
      ip
    });
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
