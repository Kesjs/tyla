/**
 * Intégration GeniusPay pour le système de paiement
 * Documentation: https://onboarding.geniuspay.ci/
 * 
 * GeniusPay est une plateforme de paiement pour l'Afrique de l'Ouest
 * Supports: Mobile Money, Carte bancaire, Portefeuille numérique
 */

interface GeniusPayInitiateResponse {
  success: boolean;
  data?: {
    id: number;
    reference: string;
    amount: number;
    fees: number;
    net_amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    payment_url?: string;
    checkout_url?: string;
    gateway?: string;
    environment: 'sandbox' | 'production';
    [key: string]: unknown;
  };
  error?: string;
  message?: string;
}

interface GeniusPayVerifyResponse {
  success: boolean;
  data?: {
    id: number;
    reference: string;
    amount: number;
    fees: number;
    net_amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    payment_method?: string;
    customer?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    metadata?: Record<string, unknown>;
    created_at: string;
    completed_at?: string;
    [key: string]: unknown;
  };
  error?: string;
  message?: string;
}

/**
 * Initialise un paiement avec GeniusPay (Checkout hebergé)
 * Retourne l'URL du checkout GeniusPay où le client choisira son moyen de paiement
 * 
 * Documentation: https://geniuspay.ci/docs/api
 */
export async function initiateGeniusPayPayment(params: {
  amount: number;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, unknown>;
}): Promise<GeniusPayInitiateResponse> {
  const {
    amount,
    description = 'Achat de billets TYLA',
    customerName,
    customerEmail,
    customerPhone,
    metadata,
  } = params;

  const apiKey = process.env.GENIUSPAY_API_KEY;
  const apiSecret = process.env.GENIUSPAY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('GeniusPay credentials are not configured');
  }

  // Sandbox mode - generate mock checkout URL
  if (apiKey.includes('sandbox')) {
    console.log('[GeniusPay] 📦 Sandbox mode - generating mock checkout URL');
    return {
      success: true,
      data: {
        id: Math.floor(Math.random() * 1000000),
        reference: `TYLA-${Date.now()}`,
        amount,
        fees: Math.floor(amount * 0.03),
        net_amount: Math.floor(amount * 0.97),
        status: 'pending',
        checkout_url: `https://sandbox.geniuspay.ci/checkout/TYLA-${Date.now()}`,
        environment: 'sandbox',
      },
    };
  }

  // Construire le payload pour l'API GeniusPay
  const payload: Record<string, unknown> = {
    amount,
    description,
    currency: 'XOF',
    // Omettez payment_method pour afficher la page de checkout GeniusPay
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/billetterie/geniuspay-callback?status=success&reference=`,
    error_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/billetterie/geniuspay-callback?status=error`,
  };

  // Ajouter les infos client si disponibles
  if (customerName || customerEmail || customerPhone) {
    payload.customer = {
      ...(customerName && { name: customerName }),
      ...(customerEmail && { email: customerEmail }),
      ...(customerPhone && { phone: customerPhone }),
    };
  }

  // Ajouter les données personnalisées
  if (metadata) {
    payload.metadata = metadata;
  }

  try {
    const url = 'https://geniuspay.ci/api/v1/merchant/payments';
    console.log('[GeniusPay] Initiating payment:', {
      url,
      amount,
      reference: metadata?.order_id,
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    console.log('[GeniusPay] Response status:', res.status);

    if (!res.ok) {
      console.error('[GeniusPay] Error response:', responseText.substring(0, 500));
      throw new Error(`GeniusPay initiation failed with status ${res.status}`);
    }

    const data = JSON.parse(responseText);
    console.log('[GeniusPay] Full payment response:', JSON.stringify(data, null, 2));
    console.log('[GeniusPay] Data keys:', Object.keys(data.data || {}));
    console.log('[GeniusPay] Payment initiated:', {
      success: data.success,
      reference: data.data?.reference,
      checkout_url: data.data?.checkout_url,
      payment_url: data.data?.payment_url,
      paymentUrl: data.data?.paymentUrl,
      all_data_keys: Object.keys(data.data || {}),
    });
    
    return data as GeniusPayInitiateResponse;
  } catch (error) {
    console.error('[GeniusPay] Initiation error:', error);
    throw error;
  }
}

/**
 * Récupère les détails d'une transaction GeniusPay
 * Utilise la référence retournée par GeniusPay après paiement
 */
export async function verifyGeniusPayTransaction(
  reference: string
): Promise<GeniusPayVerifyResponse> {
  const apiKey = process.env.GENIUSPAY_API_KEY;
  const apiSecret = process.env.GENIUSPAY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('GeniusPay credentials are not configured');
  }

  try {
    const url = `https://geniuspay.ci/api/v1/merchant/payments/${reference}`;
    console.log('[GeniusPay] Verifying payment:', { reference });

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
      },
    });

    if (!res.ok) {
      throw new Error(`GeniusPay verification failed with status ${res.status}`);
    }

    const data = await res.json();
    console.log('[GeniusPay] Payment verified:', {
      reference: data.data?.reference,
      status: data.data?.status,
    });

    return data as GeniusPayVerifyResponse;
  } catch (error) {
    console.error('[GeniusPay] Verification error:', error);
    throw error;
  }
}

/**
 * Valide que le webhook GeniusPay est authentique
 * Utilise la signature HMAC-SHA256 dans X-GeniusPay-Signature
 */
export function validateGeniusPayWebhook(
  payload: string,
  signature: string
): boolean {
  const apiSecret = process.env.GENIUSPAY_API_SECRET;
  if (!apiSecret) {
    throw new Error('GENIUSPAY_API_SECRET is not configured');
  }

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', apiSecret)
    .update(payload)
    .digest('hex');

  const isValid = expectedSignature === signature;
  console.log('[GeniusPay Webhook] Signature validation:', isValid ? '✓ Valid' : '✗ Invalid');
  
  return isValid;
}

/**
 * Traite un webhook de notification de paiement GeniusPay
 * Événements: payment.initiated, payment.success, payment.failed, payment.cancelled, payment.refunded
 */
export async function handleGeniusPayWebhook(
  payload: Record<string, unknown>
): Promise<{
  success: boolean;
  reference?: string;
  status?: string;
  amount?: number;
  orderId?: string;
}> {
  try {
    const event = payload.event as string;
    const data = payload.data as Record<string, unknown>;
    const transaction = data?.transaction as Record<string, unknown>;

    if (!transaction) {
      throw new Error('Missing transaction in webhook payload');
    }

    const reference = transaction.reference as string;
    const status = transaction.status as string;
    const amount = transaction.amount as number;
    const metadata = transaction.metadata as Record<string, unknown>;
    const orderId = metadata?.order_id as string;

    console.log('[GeniusPay Webhook] Event received:', {
      event,
      reference,
      status,
      amount,
      orderId,
    });

    return {
      success: true,
      reference,
      status,
      amount,
      orderId,
    };
  } catch (error) {
    console.error('[GeniusPay Webhook] Error:', error);
    return {
      success: false,
    };
  }
}

/**
 * Formate le code d'un billet à partir du préfixe de la catégorie et de son
 * numéro séquentiel dans le segment qui lui est réservé.
 * Ex: catégorie "VIP" (préfixe) + numéro 7 → "JAF-VIP-0007"
 */
export function formatTicketCode(prefix: string, ticketNumber: number): string {
  const padded = String(ticketNumber).padStart(4, '0');
  return `JAF-${prefix}-${padded}`;
}
