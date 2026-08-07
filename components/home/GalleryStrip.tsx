'use client';

import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import { motion, useAnimationControls } from 'framer-motion';
import { useState } from 'react';

const GALLERY = [
  { src: '/images/backstage-01.jpg', alt: 'Backstage T.Y.L.A' },
  { src: '/images/podium-yawoto.jpg', alt: 'Podium Yawoto' },
  { src: '/images/backstage-02.jpg', alt: 'Coulisses défilé' },
  { src: '/images/podium-maison-ipso.jpg', alt: 'Podium Maison Ipso' },
  { src: '/images/committee-award.jpg', alt: 'Remerciements équipe T.Y.L.A' },
  { src: '/images/DSCF1413-1-.jpg', alt: 'Coulisses T.Y.L.A' },
  { src: '/images/DSC_7618.jpg', alt: 'Préparation défilé' },
  { src: '/images/DSC_7913-1-.jpg', alt: 'Moments défilé' },
  { src: '/images/img-2522.jpg', alt: 'Événement T.Y.L.A' },
  { src: '/images/img-2532.jpg', alt: 'Scène T.Y.L.A' },
];

// Dupliquée pour la boucle infinie (2 copies pour un défilement continu sans coupure)
const INFINITE_GALLERY = [...GALLERY, ...GALLERY];

export function GalleryStrip() {
  const cardWidth = 200;
  const gap = 16;
  const controls = useAnimationControls();
  const [started, setStarted] = useState(false);

  function startLoop() {
    controls.start({
      x: [0, -((cardWidth + gap) * GALLERY.length)],
      transition: { x: { repeat: Infinity, repeatType: 'loop', duration: 50, ease: 'linear' } },
    });
  }

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

      {/* Piste de défilement : anime seulement quand visible, en pause au survol */}
      <motion.div
        className="overflow-hidden py-4"
        viewport={{ once: false, amount: 0.1 }}
        onViewportEnter={() => {
          setStarted(true);
          startLoop();
        }}
        onViewportLeave={() => controls.stop()}
        onMouseEnter={() => controls.stop()}
        onMouseLeave={() => started && startLoop()}
      >
        <motion.div className="flex gap-4" animate={controls} initial={{ x: 0 }}>
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
                loading={i < 2 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
