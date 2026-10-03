'use client';

import { ExternalLink } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { type TicketCategory, formatFcfa } from '@/lib/tickets';

const MAIN_RESERVATION_URL = 'https://my-yap.com/events/jaffirme-tyla-fashion-week';

export function TicketSelector({ categories }: { categories: TicketCategory[]; paymentCancelled?: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {categories.map((cat, i) => {
        let desc = cat.description || '';
        if (cat.name.match(/vip gold/i)) desc = desc.replace(/Professionnels établis,\s*diaspora,\s*mentors/i, '');
        if (cat.name.match(/standard/i)) desc = desc.replace(/Jeunes professionnels,\s*créatifs,\s*entrepreneurs,\s*grand public/i, '');

        return (
          <Reveal key={cat.id} delay={i * 0.08}>
            <div className="flex h-full flex-col border border-taupe/40 p-8 text-left transition-colors duration-300 hover:border-or">
              <div className="flex items-start gap-4">
                <h3 className="font-display text-xl font-semibold text-ivoire">{cat.name}</h3>
              </div>
              {desc && <p className="mt-2 font-body text-xs text-ivoire/50">{desc}</p>}
              {cat.included_items && <p className="mt-4 font-body text-sm leading-relaxed text-ivoire/70">{cat.included_items}</p>}
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="font-display text-2xl font-semibold text-or">{formatFcfa(cat.price_normal)}</p>
                </div>
              </div>
              <a
                href={MAIN_RESERVATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 border border-or py-3 font-body text-xs uppercase tracking-[0.2em] text-or transition-colors hover:bg-or hover:text-noir"
              >
                Réserver ce billet
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
