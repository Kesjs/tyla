import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import { GoldFrame } from '@/components/GoldFrame';
import { NavLink } from '@/components/NavLink';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "L'Association | T.Y.L.A - The Young Leadership Africa",
  description: "Découvrez notre histoire, nos valeurs et nos missions pour révéler l'excellence créative africaine.",
};

const TIMELINE = [
  { year: '2020', text: 'Commencement et initiative du projet.' },
  { year: '2022', text: "Formation au HUB entrepreneuriat et innovation de l'UNIL. Participation à UCREATE." },
  { year: 'Juin 2024', text: "Soirée d'inauguration réunissant une trentaine d'afroprenneurs triés sur le volet." },
  { year: 'Janvier 2026', text: "Ouverture de la branche T.Y.L.A Bénin." },
];

const VALUES = [
  'Innovation', 'Excellence', 'Responsabilité', 'Indépendance',
  'Solidarité', 'Empowerment', 'Engagement communautaire', 'Unité',
];



export default function AssociationPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[70vh] min-h-[440px] items-end overflow-hidden bg-noir">
        <div className="absolute inset-0">
          <Image src="/images/atelier-02.jpg" alt="L'équipe T.Y.L.A" fill className="object-cover opacity-50" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/60 to-noir/40" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 md:px-10">
          <Reveal>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-or">L&apos;Association</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-ivoire sm:text-6xl">
              Soyons les leaders d&apos;aujourd&apos;hui<br className="hidden sm:block" /> pour la génération de demain.
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Qui sommes-nous */}
      <section className="bg-ivoire py-24 text-noir md:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2 md:px-10">
          <Reveal>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-porto">Qui sommes-nous</p>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Une association suisse au service de la jeunesse africaine.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="space-y-5 font-body text-[15px] leading-relaxed text-taupe">
              <p>
                Nous sommes de jeunes entrepreneurs dont le cœur bat pour l&apos;Afrique. Depuis 2020, nous avons décidé
                d&apos;apporter nous aussi notre pierre à l&apos;édifice afin de participer au développement du continent.
              </p>
              <p>
                Face au manque de liens entre les afroprenneurs suisses et sur le continent, et au regard de la forte
                croissance du marché africain, nous avons décidé de monter The Young Leadership Africa (ci-après T.Y.L.A)
                afin de développer un réseau d&apos;entrepreneurs qualitatif et ambitieux.
              </p>
              <p>
                T.Y.L.A se définit juridiquement comme une association à but non lucratif conformément aux articles 60 ss
                du code civil suisse. L&apos;association a pour but d&apos;unir, agir et bâtir en faveur de la diaspora et de la communauté africaine.
              </p>
              <p>
                Pour atteindre ce but, l&apos;association développe notamment : des formations, des événements, des
                partenariats, une plateforme d&apos;échange et un carnet d&apos;adresses. Nous créons des opportunités, favorisons
                l&apos;entrepreneuriat et connectons les talents.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-noir py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6 md:px-10">
          <Reveal className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-or">Notre histoire</p>
            <h2 className="mt-5 font-display text-3xl font-semibold text-ivoire sm:text-4xl">Quelques dates</h2>
          </Reveal>
          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.12}>
                <div className="border-l border-or/50 pl-6">
                  <p className="font-display text-2xl font-semibold text-or">{t.year}</p>
                  <p className="mt-3 font-body text-sm leading-relaxed text-ivoire/60">{t.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="bg-ivoire py-24 text-noir md:py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <Reveal className="max-w-2xl">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-porto">Nos valeurs</p>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Les valeurs qui guident notre projet.
            </h2>
            <p className="mt-5 font-body text-[15px] leading-relaxed text-taupe">
              T.Y.L.A se distingue par des valeurs fortes qui orientent chaque
              action et initiative de notre association de l&apos;innovation à
              l&apos;engagement communautaire, en passant par l&apos;excellence et la
              solidarité entre jeunes Africains.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-12 flex flex-wrap gap-3">
              {VALUES.map((v) => (
                <span
                  key={v}
                  className="border border-porto/30 px-5 py-2.5 font-body text-xs uppercase tracking-[0.15em] text-porto"
                >
                  {v}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Soutenir */}
      <section className="bg-porto py-24 text-ivoire md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
          <Reveal>
            <p className="font-display text-2xl italic sm:text-3xl">
              &laquo; Engagez-vous pour le succès commun. &raquo;
            </p>
            <p className="mt-6 font-body text-sm leading-relaxed text-ivoire/75">
              Adhésion, dons, sponsoring, partenariats, bénévolat ou simple
              partage, chaque geste contribue à faire exister cette scène et à
              ouvrir la voie aux générations suivantes.
            </p>
            <a
              href="https://form.jotform.com/202665208324350"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex border border-ivoire px-8 py-3.5 font-body text-xs uppercase tracking-[0.25em] transition-opacity hover:opacity-70"
            >
              Formulaire d&apos;inscription
            </a>
          </Reveal>
        </div>
      </section>

      {/* Nous soutenir bannière */}
      <section className="bg-or py-24 text-noir md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Nous soutenir
            </h2>
            <p className="mt-6 font-body text-[15px] leading-relaxed text-noir/80">
              T.Y.L.A avance grâce au soutien de ses partenaires et de sa communauté.
              Votre don nous aide à monter nos événements et nos projets entre la Suisse et le continent africain.
            </p>
            <a
              href="https://donate.raisenow.io/vhbbq"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex border border-noir px-8 py-3.5 font-body text-xs uppercase tracking-[0.25em] transition-opacity hover:bg-noir hover:text-ivoire"
            >
              Faire un don
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
