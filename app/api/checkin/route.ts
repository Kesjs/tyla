import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const { ticketCode } = await req.json();
  if (!ticketCode) {
    return NextResponse.json({ error: 'Code billet manquant.' }, { status: 400 });
  }

  const { data: ticket, error } = await supabase
    .from('tyla_tickets')
    .select('*, tyla_ticket_categories(name)')
    .eq('ticket_code', ticketCode.trim().toUpperCase())
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: 'Billet introuvable.' }, { status: 404 });
  }

  if (ticket.checked_in) {
    return NextResponse.json({ warning: 'Ce billet a déjà été scanné.', ticket }, { status: 200 });
  }

  const { data: updated } = await supabase
    .from('tyla_tickets')
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('id', ticket.id)
    .select('*, tyla_ticket_categories(name)')
    .single();

  return NextResponse.json({ ticket: updated });
}
