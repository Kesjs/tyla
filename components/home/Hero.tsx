'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Countdown } from './Countdown';

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
  return (
    <section className="relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden bg-noir">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.12, opacity: 0 }}
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
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/70 to-noir/30" />
        <div className="absolute inset-0 bg-noir/20" />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <motion.div variants={item} className="flex items-center gap-3">
          <Image
            src="/logo/tyla-logo-blanc.png"
            alt="T.Y.L.A"
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
          />
          <div className="text-left leading-none">
            <p className="font-display text-sm tracking-[0.35em] text-ivoire">T.Y.L.A</p>
            <p className="mt-1 font-body text-[10px] tracking-[0.25em] text-or">
              THE YOUNG LEADERSHIP AFRICA
            </p>
          </div>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-8 font-body text-xs uppercase tracking-[0.4em] text-or"
        >
          Fashion Week 2026 · Cotonou
        </motion.p>

        <motion.div variants={item} className="relative mt-6">
          <span className="pointer-events-none absolute -inset-x-8 -inset-y-6 border border-or/70 sm:-inset-x-14 sm:-inset-y-10" />
          <h1 className="font-display text-[3.2rem] font-semibold leading-[0.95] tracking-tight text-ivoire sm:text-8xl md:text-9xl">
            J&apos;AFFIRME !
          </h1>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-6 font-display text-xl sm:text-2xl tracking-[0.2em] text-ivoire"
        >
          24.10.26
        </motion.p>

        <motion.div variants={item} className="mt-8 w-full">
          <Countdown targetDate="2026-10-24T18:30:00" />
        </motion.div>

        <motion.p
          variants={item}
          className="mt-10 max-w-xl text-balance font-body text-sm leading-relaxed text-ivoire/70 sm:text-base"
        >
          Créer sans copier. Influencer sans se renier. Transformer son héritage
          en force créative.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="/billetterie"
            className="group relative overflow-hidden border border-or px-9 py-3.5 font-body text-xs uppercase tracking-[0.25em] text-or"
          >
            <span className="absolute inset-0 -translate-x-full bg-or transition-transform duration-500 ease-out group-hover:translate-x-0" />
            <span className="relative transition-colors duration-500 group-hover:text-noir">
              Réserver ma place
            </span>
          </a>
          <a
            href="/evenement"
            className="font-body text-xs uppercase tracking-[0.25em] text-ivoire/70 transition-colors hover:text-ivoire"
          >
            Découvrir l&apos;événement
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="text-or/70" size={22} />
        </motion.div>
      </motion.div>
    </section>
  );
}
