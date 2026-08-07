import { Reveal } from '@/components/Reveal';

export function ManifestoQuote() {
  return (
    <section className="relative overflow-hidden bg-noir py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-or">Le Manifeste</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 text-balance font-display text-3xl italic leading-snug text-ivoire sm:text-4xl md:text-5xl">
            « L&apos;excellence créative africaine n&apos;a besoin de la permission de
            personne pour exister au sommet. »
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mx-auto mt-10 h-px w-16 bg-or" />
        </Reveal>
      </div>
    </section>
  );
}
