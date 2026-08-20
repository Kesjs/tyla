import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import { Download, FileText, Mail } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Espace Presse | T.Y.L.A - The Young Leadership Africa",
  description: "Ressources, communiqués et kit média officiels pour les journalistes et médias.",
};

const RELEASES = [
  { date: '15 Août 2026', title: 'Lancement de la billetterie J\'AFFIRME Fashion Week 2026', link: '#' },
  { date: '10 Juin 2026', title: 'Annonce officielle de la programmation de J\'AFFIRME', link: '#' },
  { date: '05 Janvier 2026', title: 'Ouverture de la branche T.Y.L.A Bénin à Cotonou', link: '#' },
];

export default function PressePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[70vh] min-h-[440px] items-end overflow-hidden bg-noir">
        <div className="absolute inset-0">
          <Image 
            src="/J'Affirme/TYLA-090.jpg" 
            alt="Espace Presse T.Y.L.A" 
            fill 
            className="object-cover opacity-50" 
            loading="lazy" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/60 to-noir/40" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 md:px-10">
          <Reveal>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-or">Médias</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-ivoire sm:text-6xl">
              Espace Presse.
            </h1>
            <p className="mt-4 max-w-xl font-body text-sm text-ivoire/60">
              Ressources et informations officielles pour les professionnels des médias.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Kit Média */}
      <section className="bg-ivoire py-24 text-noir md:py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <Reveal>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-porto">Téléchargements</p>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Kit Média Officiel
            </h2>
          </Reveal>
          
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <Reveal delay={0.1}>
              <a href="#" className="group flex h-full flex-col border border-taupe/20 bg-noir-soft p-8 transition-colors hover:border-or/50">
                <FileText className="text-or mb-6" size={28} />
                <h3 className="font-display text-xl font-semibold text-ivoire">Dossier de Presse</h3>
                <p className="mt-2 flex-1 font-body text-sm text-ivoire/60">Présentation complète de l&apos;association, de nos missions et de l&apos;événement J&apos;AFFIRME.</p>
                <span className="mt-6 inline-flex font-body text-xs uppercase tracking-wider text-or group-hover:underline">Télécharger (PDF)</span>
              </a>
            </Reveal>

            <Reveal delay={0.2}>
              <a href="#" className="group flex h-full flex-col border border-taupe/20 bg-noir-soft p-8 transition-colors hover:border-or/50">
                <Download className="text-or mb-6" size={28} />
                <h3 className="font-display text-xl font-semibold text-ivoire">Photos Officielles</h3>
                <p className="mt-2 flex-1 font-body text-sm text-ivoire/60">Sélection d&apos;images haute définition libres de droits pour vos articles.</p>
                <span className="mt-6 inline-flex font-body text-xs uppercase tracking-wider text-or group-hover:underline">Accéder à la galerie</span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Communiqués de Presse */}
      <section className="bg-noir py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6 md:px-10">
          <Reveal>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-or">Actualités</p>
            <h2 className="mt-5 font-display text-3xl font-semibold text-ivoire sm:text-4xl">
              Communiqués de Presse
            </h2>
          </Reveal>
          
          <div className="mt-14 space-y-px border-t border-taupe/30">
            {RELEASES.map((release, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <a href={release.link} className="group flex flex-col justify-between border-b border-taupe/30 py-6 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-body text-sm text-or">{release.date}</p>
                    <p className="mt-1 font-display text-xl font-semibold text-ivoire transition-colors group-hover:text-or">
                      {release.title}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-2 font-body text-xs uppercase tracking-wider text-ivoire/70 transition-colors group-hover:text-or sm:mt-0">
                    <FileText size={14} /> Lire le communiqué
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Presse */}
      <section className="bg-porto py-24 text-ivoire md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Contact Presse
            </h2>
            <p className="mt-6 font-body text-[15px] leading-relaxed text-ivoire/80">
              Pour toute demande d&apos;interview, accréditation ou information complémentaire,
              n&apos;hésitez pas à contacter notre responsable média, Julia Lavenette.
            </p>
            <a
              href="mailto:info@tylafrica.com"
              className="mt-8 inline-flex items-center gap-3 border border-ivoire px-8 py-3.5 font-body text-xs uppercase tracking-[0.25em] transition-opacity hover:opacity-70"
            >
              <Mail size={16} /> info@tylafrica.com
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
