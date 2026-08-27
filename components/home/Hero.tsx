'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Countdown } from './Countdown';
import { AnimatedText } from '@/components/ui/animated-text';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.16, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax cinématique fluide synchronisé au scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.6, 0.15]);

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.7, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-noir pt-20 pb-8 sm:pt-24 sm:pb-10"
    >
      {/* Plan d'arrière-plan avec Parallax cinématique */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{
          y: backgroundY,
          scale: backgroundScale,
          opacity: backgroundOpacity,
        }}
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="/J'Affirme/TYLA_DÉFILÉ-02.jpg"
          alt="Défilé T.Y.L.A J'AFFIRME"
          fill
          priority
          className="object-cover object-[50%_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/75 to-noir/40" />
        <div className="absolute inset-0 bg-noir/20" />
      </motion.div>

      {/* Plan de contenu au premier plan (Parallax double plan) */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{
          y: contentY,
          opacity: contentOpacity,
        }}
        className="relative z-10 flex flex-col items-center px-4 sm:px-6 text-center max-w-4xl mx-auto will-change-transform"
      >
        {/* Encadrement doré intégrant le surtitre, le titre et la date sans coupure */}
        <motion.div
          variants={item}
          className="relative border border-or/70 bg-noir/25 backdrop-blur-[2px] px-6 py-4 sm:px-12 sm:py-6 md:px-16 md:py-7 max-w-3xl"
        >
          <p className="font-body text-[10px] sm:text-xs uppercase tracking-[0.35em] sm:tracking-[0.4em] text-or">
            TYLA Fashion Week 2026 · Cotonou
          </p>

          <AnimatedText
            text="J'AFFIRME !"
            as="h1"
            className="mt-2.5 sm:mt-3 font-display text-4xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-semibold leading-[0.95] tracking-tight text-ivoire"
            minWeight={400}
            maxWeight={900}
            animationDuration={2}
            delayMultiplier={0.15}
          />

          <p className="mt-2.5 sm:mt-3 font-display text-base sm:text-xl md:text-2xl tracking-[0.2em] text-ivoire">
            24.10.26
          </p>
        </motion.div>

        {/* Compte à rebours */}
        <motion.div variants={item} className="mt-5 sm:mt-6 w-full">
          <Countdown targetDate="2026-10-24T18:30:00" />
        </motion.div>

        {/* Citation manifeste */}
        <motion.p
          variants={item}
          className="mt-4 sm:mt-5 max-w-lg md:max-w-xl text-balance font-body text-xs sm:text-sm md:text-base leading-relaxed text-ivoire/75"
        >
          Créer sans copier. Influencer sans se renier. Transformer son héritage
          en force créative.
        </motion.p>

        {/* Boutons d'action (CTA) */}
        <motion.div
          variants={item}
          className="mt-5 sm:mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-5"
        >
          <a
            href="/billetterie"
            className="group relative overflow-hidden border border-or px-7 sm:px-9 py-2.5 sm:py-3 font-body text-xs uppercase tracking-[0.22em] sm:tracking-[0.25em] text-or transition-all duration-300 hover:shadow-[0_0_20px_rgba(200,169,126,0.3)]"
          >
            <span className="absolute inset-0 -translate-x-full bg-or transition-transform duration-500 ease-out group-hover:translate-x-0" />
            <span className="relative font-medium transition-colors duration-500 group-hover:text-noir">
              Réserver ma place
            </span>
          </a>
          <a
            href="/evenement"
            className="font-body text-xs uppercase tracking-[0.22em] sm:tracking-[0.25em] text-ivoire/75 transition-colors hover:text-ivoire py-2 px-3"
          >
            Découvrir l&apos;événement
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
