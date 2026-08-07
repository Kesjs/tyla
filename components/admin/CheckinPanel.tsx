'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export function CheckinPanel() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    ticket?: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheckin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketCode: code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setResult({ type: 'error', message: data.error ?? 'Billet introuvable.' });
    } else if (data.warning) {
      setResult({ type: 'warning', message: data.warning, ticket: data.ticket });
    } else {
      setResult({
        type: 'success',
        message: `Accès validé — ${data.ticket.buyer_name} (${data.ticket.tyla_ticket_categories?.name ?? ''})`,
        ticket: data.ticket,
      });
    }
    setCode('');
  }

  return (
    <div className="border border-taupe/30 p-6">
      <h2 className="font-display text-lg font-semibold text-ivoire">Check-in le jour J</h2>
      <p className="mt-1 font-body text-xs text-ivoire/50">
        Saisissez ou scannez le code du billet (ex : JAF-XXXX-XXXX)
      </p>
      <form onSubmit={handleCheckin} className="mt-4 flex gap-3">
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="JAF-XXXX-XXXX"
          className="flex-1 border-b border-taupe bg-transparent py-2.5 font-body uppercase tracking-widest text-ivoire outline-none focus:border-or"
        />
        <button
          type="submit"
          disabled={loading}
          className="border border-or px-6 py-2.5 font-body text-xs uppercase tracking-[0.15em] text-or transition-colors hover:bg-or hover:text-noir disabled:opacity-50"
        >
          Valider
        </button>
      </form>

      {result && (
        <div
          className={`mt-5 flex items-start gap-3 border p-4 font-body text-sm ${
            result.type === 'success'
              ? 'border-or/40 text-or'
              : result.type === 'warning'
              ? 'border-yellow-600/40 text-yellow-500'
              : 'border-porto/40 text-porto-light'
          }`}
        >
          {result.type === 'success' && <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
          {result.type === 'warning' && <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
          {result.type === 'error' && <XCircle size={18} className="mt-0.5 shrink-0" />}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}
