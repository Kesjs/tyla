import { Reveal } from '@/components/Reveal';
import { NavLink } from '@/components/NavLink';

const CATS = [
  { name: 'VIP Prestige', price: 'dès 70 000 FCFA' },
  { name: 'VIP Gold', price: 'dès 35 000 FCFA' },
  { name: 'Standard', price: 'dès 10 000 FCFA' },
  { name: 'Étudiant', price: '5 000 FCFA' },
];

export function TicketPreview() {
  return (
    <section className="relative overflow-hidden bg-porto py-24 text-ivoire md:py-32">
      <div className="mx-auto max-w-5xl px-6 text-center md:px-10">
        <Reveal>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-ivoire/80">
            Billetterie
          </p>
          <h2 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">
            Un escalier de places, ouvert à toutes et tous.
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {CATS.map((c) => (
              <div key={c.name} className="border border-ivoire/25 px-4 py-6">
                <p className="font-display text-lg font-semibold">{c.name}</p>
                <p className="mt-2 font-body text-xs text-ivoire/70">{c.price}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <NavLink
            href="/billetterie"
            className="group relative mt-12 inline-flex overflow-hidden border border-ivoire px-10 py-4 font-body text-xs uppercase tracking-[0.25em]"
          >
            <span className="absolute inset-0 -translate-x-full bg-ivoire transition-transform duration-500 ease-out group-hover:translate-x-0" />
            <span className="relative transition-colors duration-500 group-hover:text-porto">
              Voir tous les tarifs &amp; réserver
            </span>
          </NavLink>

        </Reveal>
      </div>
    </section>
  );
}
