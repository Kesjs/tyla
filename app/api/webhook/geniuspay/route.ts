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
        .select('*, tyla_ticket_categories(name, ticket_code_prefix)')
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

      // Récupérer les prochains numéros de tickets pour cette catégorie
      const { data: lastTickets, error: lastError } = await supabase
        .from('tyla_tickets')
        .select('ticket_number')
        .eq('category_id', order.category_id)
        .order('ticket_number', { ascending: false })
        .limit(1);

      let nextTicketNumber = 1;
      if (!lastError && lastTickets && lastTickets.length > 0) {
        nextTicketNumber = (lastTickets[0].ticket_number as number) + 1;
      }

      // Créer les billets pour cette commande
      const tickets = [];
      const prefix = (order.tyla_ticket_categories?.ticket_code_prefix as string) || 'GEN';
      
      for (let i = 0; i < order.quantity; i++) {
        const ticketNumber = nextTicketNumber + i;
        const ticketCode = formatTicketCode(prefix, ticketNumber);
        
        tickets.push({
          order_id: orderId,
          category_id: order.category_id,
          ticket_code: ticketCode,
          ticket_number: ticketNumber,
          buyer_name: order.buyer_name,
          qr_code_data: ticketCode, // Le QR code contient le code du billet
          status: 'valid',
          checked_in: false,
        });
      }

      // Insérer les billets en base de données
      const { error: insertError } = await supabase
        .from('tyla_tickets')
        .insert(tickets);

      if (insertError) {
        console.error('[Webhook] Failed to create tickets:', insertError);
        SecurityLogger.log('webhook_tickets_creation_failed', { orderId, error: insertError.message });
        return NextResponse.json({ error: 'Erreur lors de la création des billets' }, { status: 500 });
      }

      console.log('[Webhook] Tickets created:', { orderId, ticketCount: tickets.length });

      // Mettre à jour le statut de la commande
      const { error: updateError } = await supabase
        .from('tyla_orders')
        .update({
          status: 'paid',
          payment_reference: reference,
          payment_raw_response: payload,
          paid_at: new Date().toISOString(),
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
            payment_reference: reference,
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
            payment_reference: reference,
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
