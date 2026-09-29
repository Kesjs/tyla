'use client';

import { ExternalLink } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { type TicketCategory, effectivePrice, isEarlyBirdAvailable, placesRemaining, formatFcfa } from '@/lib/tickets';

const MAIN_RESERVATION_URL = 'https://my-yap.com/events/jaffirme-tyla-fashion-week';

export function TicketSelector({ categories }: { categories: TicketCategory[]; paymentCancelled?: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {categories.map((cat, i) => {
        const remaining = placesRemaining(cat);
        const soldOut = remaining <= 0;
        const earlyBird = isEarlyBirdAvailable(cat);
        const price = effectivePrice(cat);
        let desc = cat.description || '';
        if (cat.name.match(/vip gold/i)) desc = desc.replace(/Professionnels établis,\s*diaspora,\s*mentors/i, '');
        if (cat.name.match(/standard/i)) desc = desc.replace(/Jeunes professionnels,\s*créatifs,\s*entrepreneurs,\s*grand public/i, '');

        return (
          <Reveal key={cat.id} delay={i * 0.08}>
            <div className={`flex h-full flex-col border p-8 text-left ${soldOut ? 'border-taupe/30 opacity-50' : 'border-taupe/40 hover:border-or'} transition-colors duration-300`}>
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-xl font-semibold text-ivoire">{cat.name}</h3>
                {earlyBird && !soldOut && <span className="border border-or px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.15em] text-or">Early Bird</span>}
              </div>
              {desc && <p className="mt-2 font-body text-xs text-ivoire/50">{desc}</p>}
              {cat.included_items && <p className="mt-4 font-body text-sm leading-relaxed text-ivoire/70">{cat.included_items}</p>}
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="font-display text-2xl font-semibold text-or">{formatFcfa(price)}</p>
                  {earlyBird && cat.price_normal !== cat.price_early_bird && <p className="font-body text-xs text-ivoire/40 line-through">{formatFcfa(cat.price_normal)}</p>}
                </div>
                <p className="text-right font-body text-xs text-ivoire/40">{soldOut ? 'Épuisé' : `${remaining} place(s) restante(s)`}</p>
              </div>
              <a
                href={soldOut ? undefined : MAIN_RESERVATION_URL}
                target={soldOut ? undefined : '_blank'}
                rel={soldOut ? undefined : 'noopener noreferrer'}
                aria-disabled={soldOut}
                className="mt-6 flex w-full items-center justify-center gap-2 border border-or py-3 font-body text-xs uppercase tracking-[0.2em] text-or transition-colors hover:bg-or hover:text-noir aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
              >
                {soldOut ? 'Complet' : 'Réserver ce billet'}
                {!soldOut && <ExternalLink size={14} aria-hidden="true" />}
              </a>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
