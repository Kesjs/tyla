import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SecurityLogger } from '@/lib/security';
import { rateLimiter, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { handleCORSOptions, applyCORS } from '@/lib/cors';

export async function POST(req: NextRequest) {
  // Gestion CORS preflight
  const corsResponse = handleCORSOptions(req);
  if (corsResponse) return corsResponse;

  // Rate limiting
  const ip = getClientIP(req);
  const rateLimit = rateLimiter.check(ip, RATE_LIMITS.checkin.limit, RATE_LIMITS.checkin.windowMs);
  
  if (!rateLimit.allowed) {
    SecurityLogger.logSuspiciousActivity('rate_limit_exceeded', ip, { endpoint: 'checkin' });
    const response = NextResponse.json(
      { error: 'Trop de tentatives. Réessayez plus tard.' },
      { status: 429 }
    );
    return applyCORS(response);
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    SecurityLogger.log('checkin_unauthorized', { ip });
    const response = NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    return applyCORS(response);
  }

  const { ticketCode } = await req.json();
  if (!ticketCode) {
    const response = NextResponse.json({ error: 'Code billet manquant.' }, { status: 400 });
    return applyCORS(response);
  }

  // Validation du format du code
  if (typeof ticketCode !== 'string' || ticketCode.length > 50) {
    const response = NextResponse.json({ error: 'Code billet invalide.' }, { status: 400 });
    return applyCORS(response);
  }

  const { data: ticket, error } = await supabase
    .from('tyla_tickets')
    .select('*, tyla_ticket_categories(name)')
    .eq('ticket_code', ticketCode.trim().toUpperCase())
    .single();

  if (error || !ticket) {
    SecurityLogger.log('checkin_not_found', { ticketCode: ticketCode.trim(), userId: user.id, ip });
    const response = NextResponse.json({ error: 'Billet introuvable.' }, { status: 404 });
    return applyCORS(response);
  }

  if (ticket.checked_in) {
    SecurityLogger.log('checkin_duplicate', { ticketCode: ticketCode.trim(), userId: user.id, ip });
    const response = NextResponse.json({ warning: 'Ce billet a déjà été scanné.', ticket }, { status: 200 });
    return applyCORS(response);
  }

  const { data: updated } = await supabase
    .from('tyla_tickets')
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('id', ticket.id)
    .select('*, tyla_ticket_categories(name)')
    .single();

  SecurityLogger.log('checkin_success', { ticketCode: ticketCode.trim(), userId: user.id, ip });
  const response = NextResponse.json({ ticket: updated });
  return applyCORS(response);
}
