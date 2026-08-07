'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * GoldFrame — l'élément signature visuel de J'AFFIRME.
 * Inspiré des cadres dorés ultra-fins du moodboard officiel : un rectangle
 * qui se "dessine" au scroll pour encadrer une image, une citation ou un chiffre clé.
 */
export function GoldFrame({
  children,
  className = '',
  inset = 16,
}: {
  children: ReactNode;
  className?: string;
  inset?: number;
}) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute z-10 border border-or"
        style={{ inset: -inset }}
        initial={{ clipPath: 'inset(0 100% 100% 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0% 0)' }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      />
      {children}
    </div>
  );
}
