import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isValidEmail, SecurityLogger } from '@/lib/security';
import { rateLimiter, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Rate limiting plus strict pour lookup (protection contre énumération)
  const ip = getClientIP(req);
  const rateLimit = rateLimiter.check(ip, RATE_LIMITS.lookupTickets.limit, RATE_LIMITS.lookupTickets.windowMs);
  
  if (!rateLimit.allowed) {
    SecurityLogger.logSuspiciousActivity('rate_limit_exceeded', ip, { endpoint: 'lookup-tickets' });
    return NextResponse.json(
      { error: 'Trop de tentatives de recherche. Réessayez plus tard.' },
      { status: 429 }
    );
  }

  try {
    const { email, phone } = await req.json();
    if (!email || !phone) {
      return NextResponse.json({ error: 'Email et téléphone requis.' }, { status: 400 });
    }

    // Validation email
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Format d\'email invalide.' }, { status: 400 });
    }

    const phoneDigits = String(phone).replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      return NextResponse.json({ error: 'Numéro de téléphone invalide.' }, { status: 400 });
    }
    // On compare uniquement les 8 derniers chiffres (le numéro local), peu
    // importe comment l'indicatif a été saisi lors de l'achat.
    const last8 = phoneDigits.slice(-8);

    const supabase = createAdminClient();

    const { data: orders } = await supabase
      .from('tyla_orders')
      .select('id, buyer_phone')
      .ilike('buyer_email', email.trim())
      .eq('status', 'paid');

    const matchingOrderIds = (orders ?? [])
      .filter((o) => (o.buyer_phone ?? '').replace(/\D/g, '').endsWith(last8))
      .map((o) => o.id);

    if (matchingOrderIds.length === 0) {
      SecurityLogger.log('ticket_lookup_not_found', { email: email.trim(), ip });
      return NextResponse.json({ error: 'Aucun billet trouvé avec ces informations. Vérifiez l\'email et le téléphone utilisés lors de l\'achat.' }, { status: 404 });
    }

    const { data: tickets } = await supabase
      .from('tyla_tickets')
      .select('*, tyla_ticket_categories(name)')
      .in('order_id', matchingOrderIds)
      .order('ticket_number', { ascending: true });

    SecurityLogger.logApiCall('lookup-tickets', 'POST', ip, true);
    SecurityLogger.log('ticket_lookup_success', { email: email.trim, ticketCount: tickets?.length || 0, ip });

    return NextResponse.json({
      tickets: (tickets ?? []).map((t: any) => ({
        ticketCode: t.ticket_code,
        categoryName: t.tyla_ticket_categories?.name ?? '',
        buyerName: t.buyer_name,
      })),
    });
  } catch (err) {
    SecurityLogger.log('lookup_tickets_error', { 
      error: err instanceof Error ? err.message : 'Unknown error',
      ip 
    });
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
