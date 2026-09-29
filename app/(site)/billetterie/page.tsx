import { createClient } from '@/lib/supabase/server';
import { Reveal } from '@/components/Reveal';
import { TicketSelectorBoundary } from '@/components/billetterie/TicketSelectorBoundary';
import type { TicketCategory } from '@/lib/tickets';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Billetterie | J'AFFIRME Fashion Week 2026",
  description: "Découvrez les billets et réservez votre place pour les rendez-vous J'AFFIRME T.Y.L.A Fashion Week 2026.",
};

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
            Retrouvez les billets du grand défilé J&apos;AFFIRME et les
            rendez-vous qui font vivre la semaine de la mode à Cotonou.
            Chaque bouton vous redirige vers la page officielle de réservation.
          </p>
          <a
            href="/billetterie/retrouver"
            className="mt-4 inline-block font-body text-xs uppercase tracking-[0.2em] text-or/80 underline-offset-4 hover:text-or hover:underline"
          >
            Déjà payé ? Retrouver mes billets
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 max-w-lg border border-or/30 bg-or/5 px-6 py-6">
            <p className="font-body text-sm text-ivoire/70">
              Vous souhaitez soutenir le mouvement T.Y.L.A sans acheter de billet ?
            </p>
            <a
              href="https://donate.raisenow.io/kcbgx?lng=fr"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block border border-or bg-or px-8 py-3 font-body text-xs uppercase tracking-[0.25em] text-noir transition-opacity hover:opacity-90"
            >
              Faire un don
            </a>
          </div>
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

        <Reveal delay={0.15} className="mx-auto mt-16 max-w-4xl border-t border-taupe/30 pt-10">
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-or">À vivre pendant la semaine</p>
            <h2 className="mt-4 font-display text-2xl font-semibold text-ivoire sm:text-3xl">
              Plus que le défilé, une programmation pour créer et transmettre.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-body text-sm leading-relaxed text-ivoire/55">
              Réservez directement chaque expérience sur YAP. Les informations
              pratiques et les modalités d&apos;inscription sont indiquées sur la page de l&apos;événement.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              { eyebrow: '21 octobre · Hôtel Mavilla', title: 'Table ronde Designer & Identité', description: 'Créer sans copier : affirmer son style en puisant dans son héritage.', href: 'https://my-yap.com/events/table-ronde-designer-identite-creer-sans' },
              { eyebrow: '20 octobre · Hôtel Mavilla', title: 'Workshop Mannequin', description: 'Transformer son héritage en force créative : carrière, terrain et stratégie.', href: 'https://my-yap.com/events/workshop-mannequin-transformer-son-herit' },
            ].map((event) => (
              <a key={event.href} href={event.href} target="_blank" rel="noopener noreferrer" className="group border border-taupe/40 p-6 text-left transition-colors hover:border-or">
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-or/80">{event.eyebrow}</p>
                <h3 className="mt-3 font-display text-xl font-semibold text-ivoire">{event.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-ivoire/55">{event.description}</p>
                <span className="mt-5 inline-block font-body text-xs uppercase tracking-[0.18em] text-or underline-offset-4 group-hover:underline">Voir l&apos;événement →</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
