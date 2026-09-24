import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyGeniusPayTransaction } from '@/lib/geniuspay';
import { confirmOrderPaid, markOrderNotPaid } from '@/lib/payment-confirmation';
import { SecurityLogger } from '@/lib/security';
import { rateLimiter, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { handleCORSOptions, applyCORS } from '@/lib/cors';

export async function POST(req: NextRequest) {
  // Gestion CORS preflight
  const corsResponse = handleCORSOptions(req);
  if (corsResponse) return corsResponse;

  let orderId: string | null = null;
  let reference: string | null = null;

  try {
    // Rate limiting
    const ip = getClientIP(req);
    const rateLimit = rateLimiter.check(ip, RATE_LIMITS.confirmPayment.limit, RATE_LIMITS.confirmPayment.windowMs);
    
    if (!rateLimit.allowed) {
      SecurityLogger.logSuspiciousActivity('rate_limit_exceeded', ip, { endpoint: 'confirm-payment' });
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    orderId = body.orderId;
    reference = body.reference || null;

    if (!orderId) {
      return NextResponse.json({ error: 'Paramètre manquant (orderId).' }, { status: 400 });
    }

    // Validation basique des IDs pour éviter l'injection
    if (typeof orderId !== 'string' || orderId.length > 50) {
      return NextResponse.json({ error: 'ID de commande invalide.' }, { status: 400 });
    }

    if (reference !== null && (typeof reference !== 'string' || reference.length > 100)) {
      return NextResponse.json({ error: 'Référence GeniusPay invalide.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from('tyla_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }

    // Si le callback n'a pas transmis de référence (selon comment GeniusPay
    // gère le retour), on se rabat sur celle enregistrée en base au moment
    // de l'initiation du paiement (voir /api/geniuspay/initiate).
    if (!reference) {
      reference = order.payment_transaction_id;
    }

    if (!reference) {
      return NextResponse.json({ error: 'Référence de paiement introuvable pour cette commande.' }, { status: 400 });
    }

    // Commande déjà confirmée (évite les doubles générations de billets)
    if (order.status === 'paid') {
      const { data: existingTickets } = await supabase
        .from('tyla_tickets')
        .select('*')
        .eq('order_id', orderId);
      return NextResponse.json({ tickets: existingTickets ?? [] });
    }

    // Vérification auprès de GeniusPay via la référence
    let verification;
    try {
      verification = await verifyGeniusPayTransaction(reference);
    } catch {
      return NextResponse.json({ error: 'Vérification du paiement impossible pour le moment.' }, { status: 502 });
    }

    // Vérification du statut du paiement
    // Status peut être: 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
    if (verification.data?.status !== 'completed') {
      await markOrderNotPaid(supabase, orderId, 'failed', reference, verification, 'callback');
      return NextResponse.json({ error: 'Le paiement n\'a pas été confirmé.' }, { status: 402 });
    }

    // Vérification du montant pour éviter les fraudes
    if (verification.data?.amount && verification.data.amount !== order.total_amount) {
      SecurityLogger.logSuspiciousActivity('amount_mismatch', ip, { 
        orderId, 
        expectedAmount: order.total_amount,
        receivedAmount: verification.data.amount 
      });
      return NextResponse.json({ error: 'Montant de paiement incohérent.' }, { status: 402 });
    }

    // Paiement confirmé : logique unique de confirmation partagée avec le
    // webhook et le réconciliateur (voir lib/payment-confirmation.ts)
    const result = await confirmOrderPaid(supabase, orderId, reference, verification, 'callback');

    if (result.outcome === 'error') {
      return NextResponse.json(
        { error: `${result.error} Contactez benin@tylafrica.com.` },
        { status: 500 }
      );
    }

    SecurityLogger.logApiCall('confirm-payment', 'POST', ip, true);

    const response = NextResponse.json({ tickets: result.tickets ?? [] });
    return applyCORS(response);
  } catch (err) {
    SecurityLogger.log('confirm_payment_error', { 
      error: err instanceof Error ? err.message : 'Unknown error',
      orderId: orderId || 'unknown'
    });
    const response = NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    return applyCORS(response);
  }
}
