'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-or-dark via-or to-or-light origin-left z-[100] pointer-events-none shadow-[0_0_8px_rgba(211,159,45,0.6)]"
    />
  );
}
