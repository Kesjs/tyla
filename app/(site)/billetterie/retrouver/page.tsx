'use client';

import { useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { TicketCard } from '@/components/billetterie/TicketCard';
import { Search } from 'lucide-react';

type FoundTicket = { ticketCode: string; categoryName: string; buyerName: string };

export default function RetrouverBilletsPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<FoundTicket[] | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTickets(null);

    const res = await fetch('/api/lookup-tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Une erreur est survenue.');
      return;
    }
    setTickets(data.tickets);
  }

  return (
    <section className="min-h-screen bg-noir px-6 pb-32 pt-40 md:px-10 md:pt-48">
      <div className="mx-auto max-w-md text-center">
        <Reveal>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-or">Billetterie</p>
          <h1 className="mt-5 font-display text-3xl font-semibold text-ivoire sm:text-4xl">
            Retrouver mes billets
          </h1>
          <p className="mt-4 font-body text-sm leading-relaxed text-ivoire/60">
            Vous avez déjà payé mais fermé la page avant de télécharger votre
            billet ? Retrouvez-le ici avec l&apos;email et le numéro utilisés lors de l&apos;achat.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <form onSubmit={handleSearch} className="mt-10 space-y-5 text-left">
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border-b border-taupe bg-transparent py-2.5 font-body text-ivoire outline-none focus:border-or"
              />
            </div>
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">
                Téléphone utilisé lors de l&apos;achat
              </label>
              <input
                required
                type="tel"
                placeholder="97 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full border-b border-taupe bg-transparent py-2.5 font-body text-ivoire outline-none focus:border-or"
              />
            </div>

            {error && <p className="font-body text-sm text-porto-light">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 border border-or bg-or py-3.5 font-body text-xs uppercase tracking-[0.25em] text-noir transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Search size={14} />
              {loading ? 'Recherche...' : 'Retrouver mes billets'}
            </button>
          </form>
        </Reveal>
      </div>

      {tickets && tickets.length > 0 && (
        <div className="mx-auto mt-14 flex max-w-md flex-col gap-6">
          {tickets.map((t, i) => (
            <Reveal key={t.ticketCode} delay={i * 0.1}>
              <TicketCard
                ticketCode={t.ticketCode}
                categoryName={t.categoryName}
                buyerName={t.buyerName}
              />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
