import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import { GoldFrame } from '@/components/GoldFrame';
import { NavLink } from '@/components/NavLink';

export function ProofSection() {
  return (
    <section className="bg-ivoire py-24 text-noir md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 md:grid-cols-2 md:gap-20 md:px-10">
        <Reveal>
          <GoldFrame className="h-full" inset={14}>
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src="/images/podium-maison-ipso.jpg"
                alt="Défilé Maison Ipso — J'AFFIRME"
                fill
                className="object-cover"
                loading="lazy"
              />
            </div>
          </GoldFrame>
        </Reveal>

        <div className="flex flex-col justify-center">
          <Reveal>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-porto">
              Une preuve, pas seulement un événement
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              La preuve que la jeunesse africaine et sa diaspora peuvent créer,
              exiger et rayonner — à leurs propres conditions.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 font-body text-[15px] leading-relaxed text-taupe">
              Le 24 octobre 2026, sur les rives de Cotonou, de jeunes designers et
              mannequins béninois montent sur une scène internationale pour affirmer
              une conviction simple : l&apos;excellence créative africaine n&apos;a besoin
              de la permission de personne pour exister au sommet.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-4 font-body text-[15px] leading-relaxed text-taupe">
              Porté par T.Y.L.A — The Young Leadership Africa, association suisse
              fondée par quatre femmes engagées pour la jeunesse et
              l&apos;entrepreneuriat africains, J&apos;AFFIRME construit un pont concret
              entre la Suisse, le Bénin et la diaspora africaine dans le monde.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <NavLink
              href="/association"
              className="mt-8 inline-flex w-fit items-center gap-2 border-b border-porto pb-1 font-body text-xs uppercase tracking-[0.25em] text-porto transition-opacity hover:opacity-70"
            >
              Notre histoire
            </NavLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
