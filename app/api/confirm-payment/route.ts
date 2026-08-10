import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyGeniusPayTransaction, formatTicketCode } from '@/lib/geniuspay';
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
    reference = body.reference;

    if (!orderId || !reference) {
      return NextResponse.json({ error: 'Paramètres manquants (orderId, reference).' }, { status: 400 });
    }

    // Validation basique des IDs pour éviter l'injection
    if (typeof orderId !== 'string' || orderId.length > 50) {
      return NextResponse.json({ error: 'ID de commande invalide.' }, { status: 400 });
    }
    
    if (typeof reference !== 'string' || reference.length > 100) {
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
      await supabase
        .from('tyla_orders')
        .update({ 
          status: 'failed', 
          payment_reference: reference, 
          payment_raw_response: verification 
        })
        .eq('id', orderId);
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

    // Paiement confirmé : on marque la commande payée
    await supabase
      .from('tyla_orders')
      .update({
        status: 'paid',
        payment_reference: reference,
        payment_raw_response: verification,
      })
      .eq('id', orderId);

    // Récupère le préfixe de la catégorie pour formater les codes
    const { data: cat } = await supabase
      .from('tyla_ticket_categories')
      .select('code_prefix, sold_count')
      .eq('id', order.category_id)
      .single();

    if (!cat) {
      return NextResponse.json({ error: 'Catégorie de billet introuvable.' }, { status: 500 });
    }

    // Réserve atomiquement un bloc de N numéros consécutifs dans le segment
    // de cette catégorie (évite toute collision entre commandes simultanées)
    const { data: startNumber, error: reserveError } = await supabase.rpc(
      'tyla_reserve_ticket_numbers',
      { p_category_id: order.category_id, p_count: order.quantity }
    );

    if (reserveError || startNumber === null) {
      return NextResponse.json({ error: 'Paiement confirmé mais erreur lors de la génération des billets — contactez benin@tylafrica.com.' }, { status: 500 });
    }

    // Génération d'un billet par place achetée, avec numéro séquentiel dans le segment réservé
    const ticketsToInsert = Array.from({ length: order.quantity }).map((_, i) => {
      const ticketNumber = startNumber + i;
      return {
        order_id: order.id,
        category_id: order.category_id,
        ticket_number: ticketNumber,
        ticket_code: formatTicketCode(cat.code_prefix, ticketNumber),
        buyer_name: order.buyer_name,
        buyer_email: order.buyer_email,
      };
    });

    const { data: tickets, error: ticketsError } = await supabase
      .from('tyla_tickets')
      .insert(ticketsToInsert)
      .select();

    if (ticketsError) {
      return NextResponse.json({ error: 'Paiement confirmé mais erreur lors de la génération des billets — contactez benin@tylafrica.com.' }, { status: 500 });
    }

    // Incrémente le compteur de billets vendus sur la catégorie
    await supabase
      .from('tyla_ticket_categories')
      .update({ sold_count: cat.sold_count + order.quantity })
      .eq('id', order.category_id);

    SecurityLogger.logApiCall('confirm-payment', 'POST', ip, true);
    SecurityLogger.log('payment_confirmed', { orderId, reference, amount: order.total_amount });

    const response = NextResponse.json({ tickets });
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
