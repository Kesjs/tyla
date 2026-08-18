import { Reveal } from '@/components/Reveal';

const VALUES = [
  {
    title: 'UNIR',
    text: 'Construire un réseau international actif entre l\u2019Afrique, sa diaspora et l\u2019Europe.',
  },
  {
    title: 'AGIR',
    text: 'Organiser des événements, formations et opportunités concrètes qui font avancer la communauté,',
  },
  {
    title: 'BÂTIR',
    text: 'Un réseau d\u2019entrepreneurs de qualité afin de créer des synergies et faire circuler les opportunités.',
  },
];

export function ValuesTeaser() {
  return (
    <section className="bg-ivoire py-24 text-noir md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <Reveal className="text-center">
          <p className="font-body text-xs uppercase tracking-[0.35em] text-porto">
            Nos fondations
          </p>
          <h2 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">
            Soyons les leaders d&apos;aujourd&apos;hui pour la génération de demain.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden border border-taupe/20 sm:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.12}>
              <div className="h-full bg-ivoire p-10 transition-colors duration-300 hover:bg-noir hover:text-ivoire group">
                <span className="font-display text-sm text-or">0{i + 1}</span>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-wide">
                  {v.title}
                </h3>
                <p className="mt-4 font-body text-sm leading-relaxed text-taupe transition-colors group-hover:text-ivoire/70">
                  {v.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
