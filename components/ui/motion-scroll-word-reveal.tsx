'use client';

import { Fragment, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';

const REST_OPACITY = 0.18;
const REVEAL_SPAN = 0.85;
const WORD_WINDOW = 0.2;

function getWordRange(index: number, count: number) {
  const start = count <= 1 ? 0 : (index / (count - 1)) * REVEAL_SPAN;
  return { start, end: Math.min(1, start + WORD_WINDOW) };
}

export function getWordOpacity(
  progress: number,
  { start, end }: { start: number; end: number },
  rest = REST_OPACITY
) {
  if (progress <= start) return rest;
  if (progress >= end) return 1;
  const t = (progress - start) / (end - start);
  return rest + (1 - rest) * t;
}

function Word({
  children,
  progress,
  index,
  count,
  reducedMotion,
}: {
  children: string;
  progress: MotionValue<number>;
  index: number;
  count: number;
  reducedMotion: boolean;
}) {
  const range = getWordRange(index, count);
  const opacity = useTransform(progress, (value) => getWordOpacity(value, range));
  const glow = useTransform(progress, (value) => {
    if (value <= range.start) return 'rgba(245, 240, 232, 0.18)';
    if (value >= range.end) return 'rgba(245, 240, 232, 1)';
    const t = (value - range.start) / (range.end - range.start);
    return `rgba(245, 240, 232, ${0.18 + 0.82 * t})`;
  });

  return (
    <motion.span
      aria-hidden="true"
      className="inline-block will-change-[opacity,color]"
      style={reducedMotion ? undefined : { opacity, color: glow }}
    >
      {children}
    </motion.span>
  );
}

export interface ScrollWordRevealProps {
  text?: string;
  kicker?: string;
  className?: string;
}

export function ScrollWordReveal({
  text = "« L'excellence créative africaine n'a besoin de la permission de personne pour exister au sommet. »",
  kicker = 'Le Manifeste',
  className = '',
}: ScrollWordRevealProps) {
  const targetRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start 85%', 'center 35%'],
  });

  const words = text.split(' ');

  return (
    <section
      ref={targetRef}
      className={`relative w-full overflow-hidden bg-noir py-24 sm:py-32 md:py-40 ${className}`}
      aria-labelledby="scroll-word-reveal-heading"
    >
      {/* Halo lumineux d'ambiance */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-or/5 blur-[120px]"
      />

      <div className="relative mx-auto max-w-5xl px-6 md:px-12">
        <div className="flex items-stretch gap-6 sm:gap-10 md:gap-14">
          {/* Barre de progression verticale dorée (signature 21st) */}
          <div
            className="relative flex w-[2px] flex-shrink-0 bg-taupe/40"
            aria-hidden="true"
          >
            <motion.span
              className="absolute inset-x-0 top-0 origin-top bg-gradient-to-b from-or to-or-light shadow-[0_0_12px_rgba(211,159,45,0.6)]"
              style={{
                height: '100%',
                scaleY: reducedMotion ? 1 : scrollYProgress,
              }}
            />
          </div>

          {/* Contenu textuel avec apparition mot par mot */}
          <div className="flex-1 py-1">
            {kicker && (
              <p className="font-body text-xs sm:text-sm uppercase tracking-[0.35em] text-or">
                {kicker}
              </p>
            )}

            <h2
              id="scroll-word-reveal-heading"
              className="mt-6 sm:mt-8 font-display text-2xl italic leading-snug text-ivoire sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.25]"
              aria-label={text}
            >
              {words.map((word, index) => (
                <Fragment key={`${word}-${index}`}>
                  <Word
                    progress={scrollYProgress}
                    index={index}
                    count={words.length}
                    reducedMotion={!!reducedMotion}
                  >
                    {word}
                  </Word>
                  {index < words.length - 1 ? ' ' : null}
                </Fragment>
              ))}
            </h2>

            {/* Ligne signature dorée animée en bas */}
            <motion.div
              className="mt-10 sm:mt-12 h-px bg-gradient-to-r from-or/80 via-or/30 to-transparent"
              style={{
                width: reducedMotion ? '80px' : useTransform(scrollYProgress, [0, 1], ['0px', '96px']),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScrollWordReveal;
