import { createClient } from '@/lib/supabase/server';
import { Reveal } from '@/components/Reveal';
import { TicketSelector } from '@/components/billetterie/TicketSelector';
import type { TicketCategory } from '@/lib/tickets';

export const revalidate = 0;

export default async function BilletteriePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('tyla_ticket_categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  const categories = (data ?? []) as TicketCategory[];

  return (
    <section className="min-h-screen bg-noir pb-32 pt-40 md:pt-48">
      <div className="mx-auto max-w-5xl px-6 text-center md:px-10">
        <Reveal>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-or">Billetterie</p>
          <h1 className="mt-5 font-display text-4xl font-semibold text-ivoire sm:text-5xl">
            Réservez votre place.
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-body text-sm leading-relaxed text-ivoire/60">
            24 octobre 2026 · Family Beach, Cotonou. Paiement sécurisé par
            Mobile Money ou carte. Votre billet (avec QR code) vous est
            présenté immédiatement après paiement.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 max-w-5xl px-6 md:px-10">
        <TicketSelector categories={categories} />
      </div>
    </section>
  );
}
