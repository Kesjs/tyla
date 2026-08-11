/**
 * Endpoint de test sandbox uniquement
 * Simule un webhook GeniusPay complet avec signature HMAC valide
 * 
 * POST /api/test/simulate-geniuspay-webhook
 * Body: { orderId: string }
 * 
 * Cette route:
 * 1. Récupère la commande depuis Supabase
 * 2. Crée un payload webhook GeniusPay simulé
 * 3. Calcule une signature HMAC valide avec GENIUSPAY_API_SECRET
 * 4. Envoie le webhook à /api/webhook/geniuspay
 * 5. Le webhook traite le paiement et marque la commande comme payée
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  // Vérifier qu'on est bien en sandbox
  const isSandbox = process.env.GENIUSPAY_API_KEY?.includes('sandbox');
  const isDev = process.env.NODE_ENV === 'development';

  if (!isSandbox && !isDev) {
    return NextResponse.json(
      { error: 'Cette route n\'est disponible qu\'en sandbox/développement' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { orderId } = body as { orderId: string };

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

    // Récupérer les tickets pour compter
    const { data: tickets, error: ticketsError } = await supabase
      .from('tyla_tickets')
      .select('*')
      .eq('order_id', orderId);

    if (ticketsError || !tickets || tickets.length === 0) {
      return NextResponse.json({ error: 'Aucun billet trouvé pour cette commande' }, { status: 404 });
    }

    // Créer le payload du webhook simulé (structure GeniusPay)
    const reference = `SANDBOX-TEST-${Date.now()}`;
    const webhookPayload = {
      event: 'payment.success',
      data: {
        transaction: {
          id: Math.floor(Math.random() * 1000000),
          reference,
          amount: order.total_amount,
          fees: Math.floor(order.total_amount * 0.03),
          status: 'completed',
          currency: 'XOF',
          metadata: {
            order_id: orderId,
          },
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        },
      },
    };

    // Convertir en JSON string
    const webhookBodyString = JSON.stringify(webhookPayload);

    // Calculer la signature HMAC-SHA256
    const apiSecret = process.env.GENIUSPAY_API_SECRET;
    if (!apiSecret) {
      return NextResponse.json({ error: 'GENIUSPAY_API_SECRET non configuré' }, { status: 500 });
    }

    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(webhookBodyString)
      .digest('hex');

    console.log('[Test Sandbox] Simulation webhook:', {
      orderId,
      reference,
      ticketsCount: tickets.length,
      signature: signature.substring(0, 20) + '...',
    });

    // Appeler le webhook endpoint avec la signature valide
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhook/geniuspay`;
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-geniuspay-signature': signature,
      },
      body: webhookBodyString,
    });

    if (!webhookResponse.ok) {
      const webhookError = await webhookResponse.text();
      console.error('[Test Sandbox] Webhook call failed:', webhookError);
      return NextResponse.json(
        { error: 'Erreur lors du traitement du webhook', details: webhookError },
        { status: 500 }
      );
    }

    const webhookResult = await webhookResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Webhook GeniusPay simulé avec succès',
      orderId,
      reference,
      ticketsCount: tickets.length,
      confirmationUrl: `/billetterie/confirmation?order=${orderId}`,
      debug: {
        webhookUrl,
        signatureValid: true,
      },
    });
  } catch (error) {
    console.error('[Test Sandbox] Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
