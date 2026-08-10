import { NextRequest, NextResponse } from 'next/server';
import { initiateGeniusPayPayment } from '@/lib/geniuspay';
import { SecurityLogger } from '@/lib/security';
import { rateLimiter, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { handleCORSOptions, applyCORS } from '@/lib/cors';

interface InitiatePaymentRequest {
  orderId: string;
  amount: number;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export async function POST(req: NextRequest) {
  // Gestion CORS preflight
  const corsResponse = handleCORSOptions(req);
  if (corsResponse) return corsResponse;

  try {
    // Rate limiting
    const ip = getClientIP(req);
    const rateLimit = rateLimiter.check(
      ip,
      RATE_LIMITS.checkout.limit,
      RATE_LIMITS.checkout.windowMs
    );

    if (!rateLimit.allowed) {
      SecurityLogger.logSuspiciousActivity('rate_limit_exceeded', ip, {
        endpoint: 'geniuspay/initiate',
      });
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    const body = await req.json() as InitiatePaymentRequest;
    const {
      orderId,
      amount,
      description = 'Achat de billets TYLA',
      customerName,
      customerEmail,
      customerPhone,
    } = body;

    // Validation basique
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Montant invalide.' }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'ID de commande manquant.' }, { status: 400 });
    }

    if (!customerName) {
      return NextResponse.json({ error: 'Nom du client manquant.' }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Email du client manquant.' }, { status: 400 });
    }

    // Appel à GeniusPay - Checkout hébergé (pas de payment_method)
    const geniuspayResponse = await initiateGeniusPayPayment({
      amount,
      description,
      customerName,
      customerEmail,
      customerPhone,
      metadata: {
        order_id: orderId, // Stored in metadata for webhook processing
      },
    });

    if (!geniuspayResponse.success) {
      console.error('[API] GeniusPay response failed:', geniuspayResponse);
      throw new Error(geniuspayResponse.error || 'GeniusPay payment initiation failed');
    }

    console.log('[API] GeniusPay success response:', {
      data_keys: Object.keys(geniuspayResponse.data || {}),
      checkout_url: geniuspayResponse.data?.checkout_url,
      payment_url: geniuspayResponse.data?.payment_url,
      reference: geniuspayResponse.data?.reference,
    });

    SecurityLogger.logApiCall('geniuspay/initiate', 'POST', ip, true);

    const checkoutUrl = geniuspayResponse.data?.checkout_url || geniuspayResponse.data?.payment_url;
    console.log('[API] Final checkout URL:', checkoutUrl);

    const response = NextResponse.json({
      success: true,
      checkoutUrl: checkoutUrl,
      reference: geniuspayResponse.data?.reference,
      amount: geniuspayResponse.data?.amount,
      fees: geniuspayResponse.data?.fees,
    });

    return applyCORS(response);
  } catch (err) {
    SecurityLogger.log('geniuspay_initiate_error', {
      error: err instanceof Error ? err.message : 'Unknown error',
    });
    const response = NextResponse.json(
      { error: 'Erreur lors de l\'initialisation du paiement.' },
      { status: 500 }
    );
    return applyCORS(response);
  }
}
