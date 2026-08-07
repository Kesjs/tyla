import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import { motion } from 'framer-motion';

const GALLERY = [
  { src: '/images/backstage-01.jpg', alt: 'Backstage T.Y.L.A' },
  { src: '/images/podium-yawoto.jpg', alt: 'Podium Yawoto' },
  { src: '/images/backstage-02.jpg', alt: 'Coulisses défilé' },
  { src: '/images/podium-maison-ipso.jpg', alt: 'Podium Maison Ipso' },
  { src: '/images/committee-award.jpg', alt: 'Remerciements équipe T.Y.L.A' },
  { src: '/images/DSCF1413 (1).jpg', alt: 'Coulisses T.Y.L.A' },
  { src: '/images/DSC_7618.jpg', alt: 'Préparation défilé' },
  { src: '/images/DSC_7657.jpg', alt: 'Backstage moments' },
  { src: '/images/DSC_7659.jpg', alt: 'Équipe T.Y.L.A' },
  { src: '/images/DSC_7690.jpg', alt: 'Coulisses créatives' },
  { src: '/images/DSC_7913 (1).jpg', alt: 'Moments défilé' },
  { src: '/images/DSC_7913 (2).jpg', alt: 'Fashion week backstage' },
  { src: '/images/DSC_7977.jpg', alt: 'Création T.Y.L.A' },
  { src: '/images/IMG_2522.JPEG', alt: 'Événement T.Y.L.A' },
  { src: '/images/IMG_2532.JPEG', alt: 'Scène T.Y.L.A' },
];

// Dupliquer la galerie pour le défilement infini (2 copies pour boucle fluide)
const INFINITE_GALLERY = [...GALLERY, ...GALLERY];

export function GalleryStrip() {
  const cardWidth = 200; // Largeur de base
  const cardWidthMd = 260; // Largeur sur desktop
  const gap = 16; // gap-4 = 16px

  return (
    <section className="bg-noir py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-or">Backstage</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ivoire sm:text-3xl">
              L&apos;émotion brute des éditions précédentes
            </h2>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.15}>
        <div className="overflow-hidden py-4">
          <motion.div
            className="flex gap-4"
            animate={{
              x: [0, -((cardWidth + gap) * GALLERY.length)],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 50,
                ease: "linear",
              },
            }}
          >
            {INFINITE_GALLERY.map((img, i) => (
              <div
                key={`${img.src}-${i}`}
                className="relative h-[280px] w-[200px] flex-shrink-0 overflow-hidden md:w-[260px]"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 200px, 260px"
                  priority={i < 4} // Priorité aux premières images
                />
              </div>
            ))}
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}
