'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function GeniusPayCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Récupérer les paramètres de la redirection GeniusPay
        const orderId = searchParams.get('order');
        const reference = searchParams.get('reference');
        const paymentStatus = searchParams.get('status');

        if (!orderId) {
          setStatus('error');
          setErrorMsg('Commande introuvable.');
          return;
        }

        if (!reference || paymentStatus !== 'success') {
          setStatus('error');
          setErrorMsg('Le paiement n\'a pas été confirmé. Contactez benin@tylafrica.com avec votre référence.');
          return;
        }

        // Confirmer le paiement auprès du serveur
        const response = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, reference }),
        });

        if (response.ok) {
          setStatus('success');
          // Redirection vers la page de confirmation après 2 secondes
          setTimeout(() => {
            router.push(`/billetterie/confirmation?order=${orderId}`);
          }, 2000);
        } else {
          const error = await response.json();
          setStatus('error');
          setErrorMsg(error.error || 'La confirmation a échoué.');
        }
      } catch (error) {
        console.error('Erreur lors de la confirmation:', error);
        setStatus('error');
        setErrorMsg('Erreur de connexion lors de la confirmation.');
      }
    };

    confirmPayment();
  }, [searchParams, router]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-noir px-6 pt-24">
      <div className="max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto mb-4 animate-spin text-or" size={32} />
            <p className="font-display text-lg text-ivoire">Confirmation du paiement...</p>
            <p className="mt-3 font-body text-sm text-ivoire/50">
              Veuillez patienter pendant que nous traitons votre paiement.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-or">
                <span className="text-2xl text-or">✓</span>
              </div>
            </div>
            <p className="font-display text-lg text-ivoire">Paiement confirmé !</p>
            <p className="mt-3 font-body text-sm text-ivoire/50">
              Redirection vers vos billets...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="font-display text-lg text-porto">Erreur</p>
            <p className="mt-3 font-body text-sm text-ivoire/50">{errorMsg}</p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 border border-or px-6 py-2 font-body text-xs uppercase tracking-[0.2em] text-or transition-colors hover:bg-or hover:text-noir"
            >
              Retour
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default function GeniusPayCallbackPage() {
  return (
    <Suspense fallback={
      <section className="flex min-h-screen items-center justify-center bg-noir px-6 pt-24">
        <div className="max-w-md text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-or" size={32} />
          <p className="font-display text-lg text-ivoire">Chargement...</p>
        </div>
      </section>
    }>
      <GeniusPayCallbackContent />
    </Suspense>
  );
}
