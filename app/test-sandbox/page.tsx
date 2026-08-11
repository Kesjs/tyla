'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Page de test SANDBOX UNIQUEMENT
 * Permet de tester le flux de paiement sans GeniusPay
 * 
 * À SUPPRIMER avant la production
 */

export default function TestSandboxPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function simulatePayment() {
    if (!orderId.trim()) {
      setError('Veuillez entrer un ID de commande');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/test/confirm-payment-sandbox?orderId=${orderId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la simulation');
        return;
      }

      setMessage(`✓ Paiement simulé avec succès ! ${data.ticketsCount} billet(s) créé(s)`);
      
      // Rediriger vers la page de confirmation après 2 secondes
      setTimeout(() => {
        router.push(data.confirmationUrl);
      }, 2000);
    } catch (err) {
      setError('Erreur de connexion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-noir px-6 pb-32 pt-40 md:px-10 md:pt-48">
      <div className="mx-auto max-w-md text-center">
        <div className="border border-or/40 bg-noir/50 p-8">
          <p className="font-body text-xs uppercase tracking-[0.35em] text-or">🧪 TEST SANDBOX</p>
          <h1 className="mt-5 font-display text-2xl font-semibold text-ivoire">
            Simuler un paiement
          </h1>
          <p className="mt-4 font-body text-sm text-ivoire/60">
            Cette page permet de tester le flux de paiement en sandbox sans appeler GeniusPay.
          </p>

          <div className="mt-8 space-y-4 text-left">
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">
                ID de la commande
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  setError('');
                }}
                placeholder="ex: 550e8400-e29b-41d4-a716-446655440000"
                className="mt-2 w-full border-b border-taupe bg-transparent py-2.5 font-body text-ivoire outline-none focus:border-or"
              />
              <p className="mt-2 font-body text-xs text-ivoire/40">
                Créez d'abord une commande en passant par la billetterie normal, puis copiez l'ID ici.
              </p>
            </div>

            {error && (
              <div className="border-l-2 border-porto bg-porto/5 pl-4 py-3">
                <p className="font-body text-sm text-porto-light">{error}</p>
              </div>
            )}

            {message && (
              <div className="border-l-2 border-or bg-or/5 pl-4 py-3">
                <p className="font-body text-sm text-or">{message}</p>
                <p className="mt-2 font-body text-xs text-or/60">Redirection en cours...</p>
              </div>
            )}

            <button
              onClick={simulatePayment}
              disabled={loading}
              className="mt-6 w-full border border-or bg-or py-3.5 font-body text-xs uppercase tracking-[0.25em] text-noir transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Simulation...' : 'Simuler le paiement'}
            </button>
          </div>

          <p className="mt-6 border-t border-taupe/20 pt-6 font-body text-xs text-ivoire/40">
            ⚠️ Cette page est réservée au développement. Elle sera supprimée avant la production.
          </p>
        </div>
      </div>
    </section>
  );
}
