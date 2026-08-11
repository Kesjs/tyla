import { createClient } from '@/lib/supabase/server';
import { Reveal } from '@/components/Reveal';
import { TicketSelectorBoundary } from '@/components/billetterie/TicketSelectorBoundary';
import type { TicketCategory } from '@/lib/tickets';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function BilletteriePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  let categories: TicketCategory[] = [];
  let error: string | null = null;

  try {
    const supabase = createClient();
    const { data, error: supabaseError } = await supabase
      .from('tyla_ticket_categories')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (supabaseError) {
      console.error('[Billetterie] Supabase error:', supabaseError);
      error = `Erreur Supabase: ${supabaseError.message}`;
    } else if (!data) {
      console.warn('[Billetterie] No data returned from Supabase');
      error = 'Les données des billets ne sont pas disponibles';
    } else {
      categories = data as TicketCategory[];
      if (categories.length === 0) {
        console.warn('[Billetterie] No active categories found');
        error = 'Aucune catégorie de billet active trouvée';
      }
    }
  } catch (err) {
    console.error('[Billetterie] Exception during fetch:', err);
    error = err instanceof Error ? `Erreur: ${err.message}` : 'Une erreur est survenue lors du chargement';
  }

  const paymentCancelled = searchParams.payment === 'cancelled';

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
          <a
            href="/billetterie/retrouver"
            className="mt-4 inline-block font-body text-xs uppercase tracking-[0.2em] text-or/80 underline-offset-4 hover:text-or hover:underline"
          >
            Déjà payé ? Retrouver mes billets
          </a>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 max-w-5xl px-6 md:px-10">
        {error ? (
          <Reveal className="mx-auto max-w-lg border-l-2 border-porto bg-porto/5 pl-4 py-3">
            <p className="font-body text-sm text-porto-light">
              {error}
            </p>
            <p className="mt-3 font-body text-xs text-ivoire/50">
              Contactez-nous à benin@tylafrica.com si le problème persiste.
            </p>
          </Reveal>
        ) : categories.length === 0 ? (
          <Reveal className="mx-auto max-w-lg border-l-2 border-or bg-or/5 pl-4 py-3">
            <p className="font-body text-sm text-or/80">
              La billetterie n'est pas encore disponible. Revenez bientôt !
            </p>
          </Reveal>
        ) : !categories || categories.length === 0 ? (
          <Reveal className="mx-auto max-w-lg border-l-2 border-or bg-or/5 pl-4 py-3">
            <p className="font-body text-sm text-or/80">
              La billetterie n'est pas encore disponible. Revenez bientôt !
            </p>
          </Reveal>
        ) : (
          <TicketSelectorBoundary categories={categories} paymentCancelled={paymentCancelled} />
        )}
      </div>
    </section>
  );
}
