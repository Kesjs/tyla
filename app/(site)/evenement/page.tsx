import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import { GoldFrame } from '@/components/GoldFrame';
import { MapPin, Calendar, Users, Mail } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "L'Événement | J'AFFIRME Fashion Week 2026",
  description: "Découvrez le concept, le programme détaillé et les informations pratiques de la J'AFFIRME Fashion Week 2026 à Cotonou.",
};

const PROGRAM = [
  { day: 'Mardi 20 Oct', title: 'Workshop Mannequin', text: '18h30-20h' },
  { day: 'Mercredi 21 Oct', title: 'Workshop designer & identité', text: '18h30 – 20h' },
  { day: 'Jeudi 22 Oct', title: 'Workshop photo', text: 'toute la journée' },
  { day: '24 Oct', title: 'Le Défilé', text: '16h30 : ouverture des portes' },
];

const PRACTICAL = [
  { icon: Calendar, label: 'Date', value: 'Samedi 24 octobre 2026' },
  { icon: MapPin, label: 'Lieu', value: 'Cotonou, Bénin' },
  { icon: Users, label: 'Jauge', value: '200 places (public, invités, presse, partenaires)' },
  { icon: Mail, label: 'Contact', value: 'benin@tylafrica.com' },
];

export default function EvenementPage() {
  return (
    <>
      <section className="relative flex h-[70vh] min-h-[440px] items-end overflow-hidden bg-noir">
        <div className="absolute inset-0">
          <Image src="/J'Affirme/TYLA-090.jpg" alt="Backstage J'AFFIRME" fill className="object-cover opacity-60" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/60 to-noir/40" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 md:px-10">
          <Reveal>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-or">L&apos;Événement</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-ivoire sm:text-6xl">
              J&apos;AFFIRME T.Y.L.A Fashion Week 2026.
            </h1>
            <p className="mt-4 max-w-xl font-body text-sm text-ivoire/60">
              Cotonou, Bénin semaine du 20 au 24 octobre 2026 · défilé le 24 octobre
            </p>
          </Reveal>
        </div>
      </section>

      {/* Concept */}
      <section className="bg-ivoire py-24 text-noir md:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2 md:px-10">
          <Reveal>
            <GoldFrame inset={14}>
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src="/J'Affirme/TYLA-090.jpg" alt="Défilé J'AFFIRME" fill className="object-cover" loading="lazy" />
              </div>
            </GoldFrame>
          </Reveal>
          <div className="flex flex-col justify-center">
            <Reveal>
              <p className="font-body text-xs uppercase tracking-[0.35em] text-porto">Le concept</p>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                L&apos;affirmation brute, sans justification, sans complexe.
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 font-body text-[15px] leading-relaxed text-taupe">
                Un contraste saisissant entre la profondeur des racines africaines et le minimalisme contemporain international.
                « J&apos;AFFIRME ! » part d&apos;un constat simple : l&apos;Afrique et sa jeunesse créative n&apos;ont plus à se justifier, mais à s&apos;exprimer et
                assumer leur place. Longtemps jugée secondaire, la mode africaine a pourtant influencé la mode mondiale, du corporate au
                streetwear, de l’élégance classique aux esthétiques contemporaines. « J’AFFIRME ! » est une réponse à cette invisibilisation.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mt-4 font-body text-[15px] leading-relaxed text-taupe">
                Ce thème est un acte de reconnaissance et de projection : reconnaître ses racines, créer sans copier, influencer sans se renier. 
                Le concept affirme une Afrique authentique et audacieuse, qui avance avec confiance. Plus qu&apos;un événement, c’est un manifeste.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Programme */}
      <section className="bg-noir py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6 md:px-10">
          <Reveal className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-or">Programme</p>
            <h2 className="mt-5 font-display text-3xl font-semibold text-ivoire sm:text-4xl">
              Une semaine, un défilé
            </h2>
            <p className="mx-auto mt-6 max-w-2xl font-body text-[15px] leading-relaxed text-ivoire/70">
              Découvrez les 5 designers sélectionnés avec leur collection, à travers un programme détaillé
              du 20 au 24 octobre, incluant 3 workshops ouverts au public.
            </p>
          </Reveal>
          <div className="mt-16 space-y-px">
            {PROGRAM.map((p, i) => (
              <Reveal key={p.day} delay={i * 0.12}>
                <div className="grid gap-4 border-t border-taupe py-8 sm:grid-cols-[160px_1fr]">
                  <p className="font-display text-xl font-semibold text-or">{p.day}</p>
                  <div>
                    <p className="font-display text-lg font-semibold text-ivoire">{p.title}</p>
                    <p className="mt-2 font-body text-sm leading-relaxed text-ivoire/60">{p.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="border-t border-taupe" />
          </div>
        </div>
      </section>

      {/* Infos pratiques */}
      <section className="bg-ivoire py-24 text-noir md:py-32">
        <div className="mx-auto max-w-5xl px-6 md:px-10">
          <Reveal className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-porto">Infos pratiques</p>
          </Reveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PRACTICAL.map((p, i) => (
              <Reveal key={p.label} delay={i * 0.1}>
                <div className="border border-taupe/20 p-6">
                  <p.icon className="text-porto" size={22} />
                  <p className="mt-4 font-body text-xs uppercase tracking-[0.15em] text-taupe">{p.label}</p>
                  <p className="mt-1 font-display text-base font-semibold">{p.value}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3} className="mt-14 text-center">
            <NavLink
              href="/billetterie"
              className="inline-flex border border-porto px-9 py-3.5 font-body text-xs uppercase tracking-[0.25em] text-porto transition-opacity hover:opacity-70"
            >
              Réserver ma place
            </NavLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
