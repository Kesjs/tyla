import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateGeniusPayWebhook, handleGeniusPayWebhook } from '@/lib/geniuspay';
import { confirmOrderPaid, markOrderNotPaid } from '@/lib/payment-confirmation';
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

    const { reference, status, orderId } = webhookResult;
    const supabase = createAdminClient();

    console.log('[Webhook] GeniusPay event:', { reference, status, orderId });

    // Logique unique de confirmation, partagée avec /api/confirm-payment et
    // le réconciliateur planifié (voir lib/payment-confirmation.ts). Fixe
    // au passage un bug : cette route ne générait pas de qr_secret pour les
    // billets, ce qui cassait le scan QR pour toute commande confirmée par
    // webhook (fallback manuel uniquement).
    if (status === 'completed' && orderId) {
      const result = await confirmOrderPaid(supabase, orderId, reference, payload, 'webhook');

      if (result.outcome === 'error') {
        SecurityLogger.log('webhook_confirmation_failed', { orderId, reference, error: result.error });
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      console.log(
        result.outcome === 'already_paid'
          ? '[Webhook] Order already paid, skipping:'
          : '[Webhook] Payment confirmed and tickets created:',
        { orderId }
      );
    } else if ((status === 'failed' || status === 'cancelled') && orderId) {
      await markOrderNotPaid(supabase, orderId, status, reference, payload, 'webhook');
      SecurityLogger.log(`webhook_payment_${status}`, { orderId, reference });
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
