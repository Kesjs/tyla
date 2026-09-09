'use client';

import { useCallback, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, Camera, Keyboard } from 'lucide-react';
import { QrScanner } from './QrScanner';

type CheckinResult = {
  type: 'success' | 'warning' | 'error';
  message: string;
  ticket?: any;
  verifiedBy?: 'qr' | 'manual';
} | null;

export function CheckinPanel() {
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [result, setResult] = useState<CheckinResult>(null);
  const [loading, setLoading] = useState(false);
  const lastScannedRef = useRef<{ value: string; at: number } | null>(null);

  const submitCode = useCallback(async (value: string) => {
    if (!value.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: value.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResult({ type: 'error', message: data.error ?? 'Billet introuvable.' });
      } else if (data.warning) {
        setResult({ type: 'warning', message: data.warning, ticket: data.ticket, verifiedBy: data.verifiedBy });
      } else {
        setResult({
          type: 'success',
          message: `Accès validé — ${data.ticket.buyer_name} (${data.ticket.tyla_ticket_categories?.name ?? ''})`,
          ticket: data.ticket,
          verifiedBy: data.verifiedBy,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Anti-doublon : évite de renvoyer 10x la même frame QR par seconde
  const handleScan = useCallback((value: string) => {
    const now = Date.now();
    const last = lastScannedRef.current;
    if (last && last.value === value && now - last.at < 3000) return;
    lastScannedRef.current = { value, at: now };
    submitCode(value);
  }, [submitCode]);

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitCode(code);
    setCode('');
  }

  return (
    <div className="border border-taupe/30 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ivoire">Check-in le jour J</h2>
          <p className="mt-1 font-body text-xs text-ivoire/50">
            Scannez le QR du billet, ou basculez en saisie manuelle en dépannage.
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setMode('scan')}
            className={`flex items-center gap-1.5 border px-3 py-2 font-body text-[11px] uppercase tracking-wider transition-colors ${
              mode === 'scan' ? 'border-or text-or' : 'border-taupe/30 text-ivoire/40 hover:text-ivoire/70'
            }`}
          >
            <Camera size={13} /> Scan
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center gap-1.5 border px-3 py-2 font-body text-[11px] uppercase tracking-wider transition-colors ${
              mode === 'manual' ? 'border-or text-or' : 'border-taupe/30 text-ivoire/40 hover:text-ivoire/70'
            }`}
          >
            <Keyboard size={13} /> Manuel
          </button>
        </div>
      </div>

      <QrScanner active={mode === 'scan'} onScan={handleScan} />

      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="mt-4 flex gap-3">
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
      )}

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
          <div>
            <p>{result.message}</p>
            {result.verifiedBy === 'manual' && result.type !== 'error' && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-yellow-500/90">
                <ShieldAlert size={13} /> Vérification manuelle — contrôlez la pièce d&apos;identité.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
