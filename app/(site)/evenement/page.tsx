import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import { GoldFrame } from '@/components/GoldFrame';
import { MapPin, Calendar, Users, Mail } from 'lucide-react';

const PROGRAM = [
  { day: '20 — 23 Oct', title: 'Semaine J\u2019AFFIRME', text: 'Ateliers, répétitions et coaching des 36 mannequins et 5 designers formés pour l\u2019édition.' },
  { day: '24 Oct', title: 'Le Défilé', text: 'Family Beach, Cotonou — 300 invités, podium, presse et partenaires internationaux.' },
];

const PRACTICAL = [
  { icon: Calendar, label: 'Date', value: 'Samedi 24 octobre 2026' },
  { icon: MapPin, label: 'Lieu', value: 'Family Beach, Cotonou, Bénin' },
  { icon: Users, label: 'Jauge', value: '300 places (public, invités, presse, partenaires)' },
  { icon: Mail, label: 'Contact', value: 'benin@tylafrica.com' },
];

export default function EvenementPage() {
  return (
    <>
      <section className="relative flex h-[70vh] min-h-[440px] items-end overflow-hidden bg-noir">
        <div className="absolute inset-0">
          <Image src="/images/backstage-01.jpg" alt="Backstage J'AFFIRME" fill className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/60 to-noir/40" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 md:px-10">
          <Reveal>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-or">L&apos;Événement</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-ivoire sm:text-6xl">
              J&apos;AFFIRME Fashion Week 2026
            </h1>
            <p className="mt-4 max-w-xl font-body text-sm text-ivoire/60">
              Cotonou, Bénin — semaine du 20 au 24 octobre 2026 · défilé le 24 octobre
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
                <Image src="/images/podium-yawoto.jpg" alt="Défilé Yawoto" fill className="object-cover" />
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
                Un contraste saisissant entre la profondeur des racines africaines
                et le minimalisme contemporain international — l&apos;axe Cotonou —
                Genève / Lausanne. Silhouettes fières, typographie impériale,
                captation axée sur le mouvement et l&apos;humain : la mode devient un
                manifeste culturel et un outil de leadership pour la jeunesse
                africaine.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mt-4 font-body text-[15px] leading-relaxed text-taupe">
                L&apos;approche narrative met en lumière la métamorphose des 36
                mannequins et 5 designers formés, passant des coulisses de
                l&apos;apprentissage à l&apos;éclat de la scène.
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
            <a
              href="/billetterie"
              className="inline-flex border border-porto px-9 py-3.5 font-body text-xs uppercase tracking-[0.25em] text-porto transition-colors hover:bg-porto hover:text-ivoire"
            >
              Réserver ma place
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
