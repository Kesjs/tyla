import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { effectivePrice, placesRemaining, type TicketCategory } from '@/lib/tickets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryId, quantity, buyerName, buyerPhone, buyerEmail } = body;

    if (!categoryId || !quantity || !buyerName || !buyerPhone || !buyerEmail) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
    }
    if (quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: 'Quantité invalide (max 10 par commande).' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: category, error: catError } = await supabase
      .from('tyla_ticket_categories')
      .select('*')
      .eq('id', categoryId)
      .eq('active', true)
      .single();

    if (catError || !category) {
      return NextResponse.json({ error: 'Catégorie de billet introuvable.' }, { status: 404 });
    }

    const cat = category as TicketCategory;
    const remaining = placesRemaining(cat);
    if (remaining < quantity) {
      return NextResponse.json(
        { error: `Il ne reste que ${remaining} place(s) pour cette catégorie.` },
        { status: 409 }
      );
    }

    const unitPrice = effectivePrice(cat);
    const totalAmount = unitPrice * quantity;

    const { data: order, error: orderError } = await supabase
      .from('tyla_orders')
      .insert({
        category_id: cat.id,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        buyer_email: buyerEmail,
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Impossible de créer la commande." }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      amount: totalAmount,
      categoryName: cat.name,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
