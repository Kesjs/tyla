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

  const { code } = await req.json();
  if (!code) {
    const response = NextResponse.json({ error: 'Code billet manquant.' }, { status: 400 });
    return applyCORS(response);
  }

  // Validation du format du code (qr_secret ~32 car., ticket_code plus court)
  if (typeof code !== 'string' || code.length > 64) {
    const response = NextResponse.json({ error: 'Code billet invalide.' }, { status: 400 });
    return applyCORS(response);
  }

  const trimmed = code.trim();

  // 1) Chemin fort : le QR scanné encode le qr_secret (aléatoire, non
  //    devinable) — c'est la source de vérité pour une entrée validée.
  let { data: ticket, error } = await supabase
    .from('tyla_tickets')
    .select('*, tyla_ticket_categories(name)')
    .eq('qr_secret', trimmed)
    .maybeSingle();

  let verifiedBy: 'qr' | 'manual' = 'qr';

  // 2) Chemin de secours : saisie manuelle du ticket_code lisible (ex :
  //    caméra en panne). Ce code seul ne prouve pas l'authenticité —
  //    la réponse est marquée "manual" pour forcer un contrôle de pièce
  //    d'identité côté staff.
  if (!ticket && !error) {
    const fallback = await supabase
      .from('tyla_tickets')
      .select('*, tyla_ticket_categories(name)')
      .eq('ticket_code', trimmed.toUpperCase())
      .maybeSingle();
    ticket = fallback.data;
    error = fallback.error;
    verifiedBy = 'manual';
  }

  if (error || !ticket) {
    SecurityLogger.log('checkin_not_found', { userId: user.id, ip });
    const response = NextResponse.json({ error: 'Billet introuvable.' }, { status: 404 });
    return applyCORS(response);
  }

  if (ticket.checked_in) {
    SecurityLogger.log('checkin_duplicate', { ticketCode: ticket.ticket_code, userId: user.id, ip });
    const response = NextResponse.json(
      { warning: 'Ce billet a déjà été scanné.', ticket, verifiedBy },
      { status: 200 }
    );
    return applyCORS(response);
  }

  const { data: updated } = await supabase
    .from('tyla_tickets')
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('id', ticket.id)
    .select('*, tyla_ticket_categories(name)')
    .single();

  SecurityLogger.log('checkin_success', { ticketCode: ticket.ticket_code, userId: user.id, ip, verifiedBy });
  const response = NextResponse.json({ ticket: updated, verifiedBy });
  return applyCORS(response);
}
