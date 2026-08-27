'use client';

import { motion, type TargetAndTransition } from 'framer-motion';
import { ReactNode } from 'react';

export type RevealVariant = 'blur' | 'fade-up' | 'scale' | 'fade-left' | 'fade-right';

export function Reveal({
  children,
  delay = 0,
  className = '',
  y = 24,
  variant = 'blur',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  variant?: RevealVariant;
}) {
  const getInitial = () => {
    switch (variant) {
      case 'blur':
        return { opacity: 0, y, filter: 'blur(8px)' };
      case 'scale':
        return { opacity: 0, scale: 0.94, y: 16 };
      case 'fade-left':
        return { opacity: 0, x: -30 };
      case 'fade-right':
        return { opacity: 0, x: 30 };
      case 'fade-up':
      default:
        return { opacity: 0, y };
    }
  };

  const getWhileInView = (): TargetAndTransition => {
    switch (variant) {
      case 'blur':
        return { opacity: 1, y: 0, filter: 'blur(0px)' };
      case 'scale':
        return { opacity: 1, scale: 1, y: 0 };
      case 'fade-left':
      case 'fade-right':
        return { opacity: 1, x: 0 };
      case 'fade-up':
      default:
        return { opacity: 1, y: 0 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={getInitial()}
      whileInView={getWhileInView()}
      viewport={{ once: true, margin: '-6% 0px' }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
