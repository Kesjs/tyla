'use client';

import React, { useEffect, useRef } from 'react';

interface AnimatedTextProps {
  text: string;
  fontSize?: number | string;
  minWeight?: number;
  maxWeight?: number;
  animationDuration?: number;
  delayMultiplier?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export function AnimatedText({
  text,
  fontSize,
  minWeight = 400,
  maxWeight = 900,
  animationDuration = 1.8,
  delayMultiplier = 0.18,
  className = '',
  as: Component = 'p',
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLParagraphElement | HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const spans = containerRef.current.querySelectorAll<HTMLSpanElement>('span[data-char]');
    const numLetters = spans.length;

    spans.forEach((span, i) => {
      const mappedIndex = i - numLetters / 2;
      span.style.animationDelay = `${mappedIndex * delayMultiplier}s`;
    });
  }, [text, delayMultiplier]);

  const characters = text.split('').map((char, index) => {
    if (char === ' ') {
      return (
        <span key={index} className="inline-block whitespace-pre">
          {' '}
        </span>
      );
    }
    return (
      <span
        key={index}
        data-char="true"
        aria-hidden="true"
        className="inline-block transition-all will-change-[font-variation-settings,opacity]"
        style={{
          animation: `breath ${animationDuration}s alternate cubic-bezier(0.37, 0, 0.63, 1) infinite`,
          animationFillMode: 'both',
          fontVariationSettings: `"wght" ${minWeight}`,
        }}
      >
        {char}
      </span>
    );
  });

  return (
    <div className="flex justify-center items-center">
      <Component
        ref={containerRef as any}
        aria-label={text}
        className={`m-0 ${className}`}
        style={{
          ...(fontSize ? { fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize } : {}),
          fontFeatureSettings: '"wght"',
        }}
      >
        {characters}
        <style>{`
          @keyframes breath {
            0% {
              font-variation-settings: "wght" ${minWeight};
            }
            100% {
              font-variation-settings: "wght" ${maxWeight};
            }
          }
        `}</style>
      </Component>
    </div>
  );
}

export default AnimatedText;
