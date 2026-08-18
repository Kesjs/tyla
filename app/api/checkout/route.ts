import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { effectivePrice, placesRemaining, type TicketCategory } from '@/lib/tickets';
import { 
  isValidEmail, 
  validateAndSanitizeName, 
  validateInternationalPhone,
  SecurityLogger 
} from '@/lib/security';
import { rateLimiter, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { handleCORSOptions, applyCORS } from '@/lib/cors';

export async function POST(req: NextRequest) {
  // Gestion CORS preflight
  const corsResponse = handleCORSOptions(req);
  if (corsResponse) return corsResponse;
  try {
    // Rate limiting
    const ip = getClientIP(req);
    const rateLimit = rateLimiter.check(ip, RATE_LIMITS.checkout.limit, RATE_LIMITS.checkout.windowMs);
    
    if (!rateLimit.allowed) {
      SecurityLogger.logSuspiciousActivity('rate_limit_exceeded', ip, { endpoint: 'checkout' });
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { categoryId, quantity, buyerName, buyerPhone, buyerEmail } = body;

    // Validation des champs obligatoires
    if (!categoryId || !quantity || !buyerName || !buyerPhone || !buyerEmail) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
    }

    // Validation quantité
    if (quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: 'Quantité invalide (max 10 par commande).' }, { status: 400 });
    }

    // Validation et sanitization de l'email
    if (!isValidEmail(buyerEmail)) {
      return NextResponse.json({ error: 'Format d\'email invalide.' }, { status: 400 });
    }

    // Validation et sanitization du nom
    const nameValidation = validateAndSanitizeName(buyerName);
    if (!nameValidation.valid) {
      return NextResponse.json({ error: 'Nom invalide. Utilisez uniquement des lettres, espaces, tirets et apostrophes.' }, { status: 400 });
    }

    // Validation du téléphone
    const phoneValidation = validateInternationalPhone(buyerPhone.replace(/\D/g, ''));
    if (!phoneValidation.valid) {
      return NextResponse.json({ error: phoneValidation.error }, { status: 400 });
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
        buyer_name: nameValidation.sanitized,
        buyer_phone: buyerPhone,
        buyer_email: buyerEmail.trim().toLowerCase(),
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      SecurityLogger.log('order_creation_failed', { 
        error: orderError?.message, 
        categoryId, 
        email: buyerEmail 
      });
      return NextResponse.json({ error: "Impossible de créer la commande." }, { status: 500 });
    }

    SecurityLogger.logApiCall('checkout', 'POST', ip, true);

    const response = NextResponse.json({
      orderId: order.id,
      amount: totalAmount,
      categoryName: cat.name,
    });
    return applyCORS(response);
  } catch (err) {
    SecurityLogger.log('checkout_error', { error: err instanceof Error ? err.message : 'Unknown error' });
    const response = NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    return applyCORS(response);
  }
}
