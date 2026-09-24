'use client';

import { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface PendingOrder {
  id: string;
  created_at: string;
  total_amount: number;
  buyer_email: string;
}

interface ReconciliationResult {
  checked: number;
  confirmed: string[];
  failed: string[];
  stillPending: string[];
  autoCancelled: string[];
  errors: { orderId: string; error: string }[];
}

export function PaymentReconciliation({ pendingOrders }: { pendingOrders: PendingOrder[] }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [error, setError] = useState('');

  async function reconcilePayments() {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/admin/api/reconcile-payments', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la réconciliation');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  const formatAge = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Moins d\'une minute';
    if (diffMins < 60) return `${diffMins} minute(s)`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} heure(s)`;
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Bouton de réconciliation */}
      <div className="flex items-center justify-between border border-taupe/30 p-6">
        <div>
          <p className="font-body text-sm text-ivoire/70">
            {pendingOrders.length} commande(s) en attente de paiement
          </p>
          <p className="mt-1 font-body text-xs text-ivoire/40">
            Cliquez pour vérifier le statut des paiements auprès de GeniusPay
          </p>
        </div>
        <button
          onClick={reconcilePayments}
          disabled={loading}
          className="flex items-center gap-2 border border-or bg-or px-6 py-3 font-body text-xs uppercase tracking-[0.2em] text-noir transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Vérification...
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Réconcilier
            </>
          )}
        </button>
      </div>

      {/* Liste des commandes en attente */}
      {pendingOrders.length > 0 && (
        <div className="border border-taupe/30">
          <table className="w-full border-collapse font-body text-sm">
            <thead>
              <tr className="border-b border-taupe/30 text-left text-ivoire/50">
                <th className="px-4 py-3 font-normal uppercase tracking-[0.1em]">ID Commande</th>
                <th className="px-4 py-3 font-normal uppercase tracking-[0.1em]">Email</th>
                <th className="px-4 py-3 font-normal uppercase tracking-[0.1em]">Montant</th>
                <th className="px-4 py-3 font-normal uppercase tracking-[0.1em]">Âge</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.id} className="border-b border-taupe/10 text-ivoire/80">
                  <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3">{order.buyer_email}</td>
                  <td className="px-4 py-3">{order.total_amount.toLocaleString()} FCFA</td>
                  <td className="px-4 py-3">{formatAge(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Résultat de la réconciliation */}
      {result && (
        <div className="border border-or/30 bg-or/5 p-6">
          <h3 className="font-display text-lg font-semibold text-ivoire">Résultat de la réconciliation</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-or/20 p-2">
                <RefreshCw className="text-or" size={16} />
              </div>
              <div>
                <p className="font-body text-xs text-ivoire/50">Vérifiées</p>
                <p className="font-display text-lg text-ivoire">{result.checked}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/20 p-2">
                <CheckCircle className="text-green-400" size={16} />
              </div>
              <div>
                <p className="font-body text-xs text-ivoire/50">Confirmées</p>
                <p className="font-display text-lg text-ivoire">{result.confirmed.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-500/20 p-2">
                <XCircle className="text-red-400" size={16} />
              </div>
              <div>
                <p className="font-body text-xs text-ivoire/50">Échouées</p>
                <p className="font-display text-lg text-ivoire">{result.failed.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-500/20 p-2">
                <AlertCircle className="text-yellow-400" size={16} />
              </div>
              <div>
                <p className="font-body text-xs text-ivoire/50">Auto-annulées</p>
                <p className="font-display text-lg text-ivoire">{result.autoCancelled.length}</p>
              </div>
            </div>
          </div>
          
          {result.errors.length > 0 && (
            <div className="mt-4 border-l-2 border-porto bg-porto/5 pl-4 py-3">
              <p className="font-body text-xs text-porto-light">Erreurs:</p>
              <ul className="mt-2 space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i} className="font-body text-xs text-ivoire/60">
                    {err.orderId.slice(0, 8)}...: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="border-l-2 border-porto bg-porto/5 pl-4 py-3">
          <p className="font-body text-sm text-porto-light">{error}</p>
        </div>
      )}
    </div>
  );
}