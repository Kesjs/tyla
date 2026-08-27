'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isMounted) {
    return <div className="h-14 sm:h-16" />; // placeholder height
  }

  const timeBlocks = [
    { label: 'Jours', value: timeLeft.days },
    { label: 'Heures', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Secondes', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-6 md:gap-8 justify-center">
      {timeBlocks.map((block) => (
        <div key={block.label} className="flex flex-col items-center">
          <div className="flex h-11 w-11 sm:h-13 sm:w-13 md:h-14 md:w-14 items-center justify-center border border-or/30 bg-noir/40 backdrop-blur-sm text-ivoire shadow-sm">
            <span className="font-display text-lg sm:text-xl md:text-2xl font-medium">{block.value.toString().padStart(2, '0')}</span>
          </div>
          <span className="mt-1 font-body text-[9px] sm:text-[10px] uppercase tracking-widest text-or/80">{block.label}</span>
        </div>
      ))}
    </div>
  );
}
