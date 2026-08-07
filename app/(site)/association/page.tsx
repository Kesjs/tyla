import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import { GoldFrame } from '@/components/GoldFrame';

const TIMELINE = [
  { year: '2020', text: 'Commencement et initiative du projet.' },
  { year: '2022', text: "Formation au HUB entrepreneuriat et innovation de l'UNIL. Participation à UCREATE." },
  { year: '28.06.2024', text: "Soirée d'inauguration réunissant une trentaine d'afroprenneurs triés sur le volet." },
];

const VALUES = [
  'Innovation', 'Excellence', 'Responsabilité', 'Indépendance',
  'Solidarité', 'Empowerment', 'Engagement communautaire', 'Unité',
];

const COMMITTEE = [
  { name: 'Tatiana Monteiro', role: 'Présidente' },
  { name: 'Myriam Tsumbu Nzanzala', role: 'Vice-Présidente' },
  { name: 'Ismael Kane', role: 'Trésorier' },
  { name: 'Eunice Tchibozo', role: 'Resp. Projet et Développement' },
  { name: 'Benedicte Okonda', role: 'Secrétaire Générale' },
  { name: 'Julia Lavenette', role: 'Responsable Média' },
];

export default function AssociationPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[70vh] min-h-[440px] items-end overflow-hidden bg-noir">
        <div className="absolute inset-0">
          <Image src="/images/atelier-02.jpg" alt="L'équipe T.Y.L.A" fill className="object-cover opacity-50" />
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
                T.Y.L.A se définit juridiquement comme une association à but non
                lucratif conformément aux articles 60 ss du code civil suisse.
                Notre siège se trouve à Lausanne, au cœur de la capitale
                olympique, ce qui nous permet de développer nos activités sur
                l&apos;ensemble du territoire.
              </p>
              <p>
                L&apos;association a pour but d&apos;unir, agir et bâtir en faveur de la
                diaspora et communauté africaine, à travers des formations, des
                événements, des partenariats, une plateforme d&apos;échange et un
                carnet d&apos;adresses. Elle n&apos;a pas de but économique et n&apos;est liée
                à aucun mouvement politique, ni à aucune confession.
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
          <div className="mt-16 grid gap-10 sm:grid-cols-3">
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
              action et initiative de notre association — de l&apos;innovation à
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

      {/* Comité */}
      <section className="bg-noir py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <Reveal className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-or">L&apos;équipe</p>
            <h2 className="mt-5 font-display text-3xl font-semibold text-ivoire sm:text-4xl">Le Comité</h2>
          </Reveal>
          <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {COMMITTEE.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.08}>
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-or/40 font-display text-lg text-or">
                    {m.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <p className="mt-4 font-display text-base font-semibold text-ivoire">{m.name}</p>
                  <p className="mt-1 font-body text-xs uppercase tracking-[0.15em] text-ivoire/50">{m.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
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
              partage — chaque geste contribue à faire exister cette scène et à
              ouvrir la voie aux générations suivantes.
            </p>
            <a
              href="/contact"
              className="mt-8 inline-flex border border-ivoire px-8 py-3.5 font-body text-xs uppercase tracking-[0.25em] transition-colors hover:bg-ivoire hover:text-porto"
            >
              Nous rejoindre
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
