import Image from 'next/image';
import { Reveal } from '@/components/Reveal';

const STATS = [
  { value: '24 Oct 2026', label: 'Date du défilé' },
  { value: 'Family Beach', label: 'Cotonou, Bénin' },
  { value: '300', label: 'Places disponibles' },
  { value: '5 designers · 36 mannequins', label: 'Formés pour l\u2019édition' },
];

export function BridgeSection() {
  return (
    <section className="relative overflow-hidden bg-noir py-24 md:py-32">
      <div className="absolute inset-0 opacity-40">
        <Image
          src="/images/atelier-01.jpg"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-noir/85" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center md:px-10">
        <Reveal>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-or">
            Un pont entre deux rives
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-ivoire sm:text-4xl">
            Après deux éditions suisses saluées à Genève et Lausanne,
            J&apos;AFFIRME pose pour la première fois sa scène au Bénin.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-2xl font-body text-[15px] leading-relaxed text-ivoire/60">
            Là où le tourisme mémoriel raconte l&apos;histoire, J&apos;AFFIRME raconte le
            présent et l&apos;avenir : une Afrique et une diaspora qui créent,
            entreprennent et rayonnent ensemble, à travers la mode.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-16 grid grid-cols-2 gap-8 border-t border-taupe pt-10 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-xl font-semibold text-or sm:text-2xl">
                  {s.value}
                </p>
                <p className="mt-2 font-body text-[11px] uppercase tracking-[0.15em] text-ivoire/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
