/**
 * Route de test pour sandbox - simule un paiement réussi
 * À utiliser UNIQUEMENT en développement/sandbox
 * 
 * Utilisation: POST /api/test/confirm-payment-sandbox?orderId=xxx
 * 
 * Cela marque la commande comme payée et permet de voir les billets
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  // Vérifier qu'on est bien en développement/sandbox
  const isDev = process.env.NODE_ENV === 'development';
  const isSandbox = process.env.GENIUSPAY_API_KEY?.includes('sandbox');

  if (!isDev && !isSandbox) {
    return NextResponse.json(
      { error: 'Cette route n\'est disponible qu\'en sandbox/développement' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId manquant' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Récupérer la commande
    const { data: order, error: orderError } = await supabase
      .from('tyla_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    // Marquer la commande comme payée
    const { error: updateError } = await supabase
      .from('tyla_orders')
      .update({
        status: 'paid',
        geniuspay_reference: `SANDBOX-TEST-${Date.now()}`,
        payment_method: 'sandbox',
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('[Test Sandbox] Update error:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    // Récupérer les tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('tyla_tickets')
      .select('*')
      .eq('order_id', orderId);

    if (ticketsError || !tickets) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des billets' },
        { status: 500 }
      );
    }

    console.log('[Test Sandbox] Paiement simulé - Commande:', orderId, 'Billets:', tickets.length);

    return NextResponse.json({
      success: true,
      message: 'Paiement simulé avec succès en sandbox',
      orderId,
      ticketsCount: tickets.length,
      confirmationUrl: `/billetterie/confirmation?order=${orderId}`,
    });
  } catch (error) {
    console.error('[Test Sandbox] Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
