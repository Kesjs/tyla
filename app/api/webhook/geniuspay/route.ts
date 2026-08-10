import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateGeniusPayWebhook, handleGeniusPayWebhook } from '@/lib/geniuspay';
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
    // Récupère la signature du webhook depuis les headers
    const signature = req.headers.get('x-geniuspay-signature');
    if (!signature) {
      SecurityLogger.logSuspiciousActivity('webhook_missing_signature', ip, { endpoint: 'geniuspay' });
      return NextResponse.json({ error: 'Signature manquante' }, { status: 401 });
    }

    // Récupère le body brut pour la validation de signature
    const rawBody = await req.text();
    
    // Valide la signature du webhook
    const isValid = validateGeniusPayWebhook(rawBody, signature);
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
        .select('id, status')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.warn('[Webhook] Order not found:', { orderId });
        SecurityLogger.log('webhook_order_not_found', { orderId, reference });
      } else if (order && order.status !== 'paid') {
        // Mettre à jour le statut de la commande
        await supabase
          .from('tyla_orders')
          .update({ 
            status: 'paid',
            payment_reference: reference,
            payment_raw_response: payload,
          })
          .eq('id', order.id);

        SecurityLogger.log('webhook_payment_confirmed', { 
          orderId: order.id, 
          reference, 
          amount 
        });
        console.log('[Webhook] Payment confirmed and order updated:', { orderId });
      }
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
            status: 'cancelled',
            payment_reference: reference,
            payment_raw_response: payload,
          })
          .eq('id', order.id);

        SecurityLogger.log('webhook_payment_failed', { orderId, reference });
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
