import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyKkiapayTransaction, generateTicketCode } from '@/lib/kkiapay';

export async function POST(req: NextRequest) {
  try {
    const { orderId, transactionId } = await req.json();
    if (!orderId || !transactionId) {
      return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 });
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

    // Vérification réelle auprès de Kkiapay
    let verification;
    try {
      verification = await verifyKkiapayTransaction(transactionId);
    } catch {
      return NextResponse.json({ error: 'Vérification du paiement impossible pour le moment.' }, { status: 502 });
    }

    if (verification.status !== 'SUCCESS') {
      await supabase
        .from('tyla_orders')
        .update({ status: 'failed', payment_transaction_id: transactionId, payment_raw_response: verification })
        .eq('id', orderId);
      return NextResponse.json({ error: 'Le paiement n\'a pas été confirmé.' }, { status: 402 });
    }

    // Paiement confirmé : on marque la commande payée
    await supabase
      .from('tyla_orders')
      .update({
        status: 'paid',
        payment_transaction_id: transactionId,
        payment_raw_response: verification,
      })
      .eq('id', orderId);

    // Génération d'un billet (avec code unique) par place achetée
    const ticketsToInsert = Array.from({ length: order.quantity }).map(() => ({
      order_id: order.id,
      category_id: order.category_id,
      ticket_code: generateTicketCode(),
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
    }));

    const { data: tickets, error: ticketsError } = await supabase
      .from('tyla_tickets')
      .insert(ticketsToInsert)
      .select();

    if (ticketsError) {
      return NextResponse.json({ error: 'Paiement confirmé mais erreur lors de la génération des billets — contactez benin@tylafrica.com.' }, { status: 500 });
    }

    // Incrémente le compteur de billets vendus sur la catégorie
    const { data: cat } = await supabase
      .from('tyla_ticket_categories')
      .select('sold_count')
      .eq('id', order.category_id)
      .single();

    if (cat) {
      await supabase
        .from('tyla_ticket_categories')
        .update({ sold_count: cat.sold_count + order.quantity })
        .eq('id', order.category_id);
    }

    return NextResponse.json({ tickets });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
