'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import {
  type TicketCategory,
  effectivePrice,
  isEarlyBirdAvailable,
  placesRemaining,
  formatFcfa,
} from '@/lib/tickets';
import { Reveal } from '@/components/Reveal';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'kkiapay-widget': any;
    }
  }
}

export function TicketSelector({ categories }: { categories: TicketCategory[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'pick' | 'form' | 'paying' | 'error'>('pick');
  const [errorMsg, setErrorMsg] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);

  // Empêche un rechargement/fermeture accidentel pendant qu'un paiement est en cours
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (step === 'paying') {
        e.preventDefault();
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step]);

  function cancelPayment() {
    setStep('form');
    setErrorMsg('');
  }

  function pick(cat: TicketCategory) {
    setSelected(cat);
    setQuantity(1);
    setStep('form');
    setErrorMsg('');
  }

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setErrorMsg('');

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: selected.id,
        quantity,
        buyerName: name,
        buyerPhone: phone,
        buyerEmail: email,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setErrorMsg(data.error ?? 'Une erreur est survenue.');
      return;
    }

    setOrderId(data.orderId);
    setAmount(data.amount);
    setStep('paying');

    // Ouvre le widget Kkiapay une fois le script chargé
    setTimeout(() => {
      // @ts-ignore — API globale injectée par le script Kkiapay
      if (typeof window.openKkiapayWidget === 'function') {
        // @ts-ignore
        window.openKkiapayWidget({
          amount: data.amount,
          key: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY,
          sandbox: true, // ⚠️ passer à false une fois le compte Kkiapay validé en production
          data: JSON.stringify({ orderId: data.orderId }),
          phone,
          email,
          name,
        });
      }
    }, 200);
  }

  async function handleKkiapaySuccess(transactionId: string) {
    if (!orderId) return;
    const res = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, transactionId }),
    });
    if (res.ok) {
      router.push(`/billetterie/confirmation?order=${orderId}`);
    } else {
      setStep('error');
      setErrorMsg("Le paiement a été reçu mais la confirmation a échoué. Contactez benin@tylafrica.com avec votre référence.");
    }
  }

  return (
    <>
      <Script src="https://cdn.kkiapay.me/k.js" strategy="afterInteractive" />
      <Script id="kkiapay-listener" strategy="afterInteractive">
        {`
          window.addEventListener('kkiapay-widget:success', (e) => {
            window.dispatchEvent(new CustomEvent('tyla-kkiapay-success', { detail: e.detail }));
          });
          window.addEventListener('kkiapay-widget:close', () => {
            window.dispatchEvent(new CustomEvent('tyla-kkiapay-close'));
          });
        `}
      </Script>
      <KkiapaySuccessListener onSuccess={handleKkiapaySuccess} />
      <KkiapayCloseListener onClose={cancelPayment} active={step === 'paying'} />

      {step === 'pick' && (
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((cat, i) => {
            const remaining = placesRemaining(cat);
            const soldOut = remaining <= 0;
            const earlyBird = isEarlyBirdAvailable(cat);
            const price = effectivePrice(cat);
            return (
              <Reveal key={cat.id} delay={i * 0.08}>
                <div
                  className={`flex h-full flex-col border p-8 text-left ${
                    soldOut ? 'border-taupe/30 opacity-50' : 'border-taupe/40 hover:border-or'
                  } transition-colors duration-300`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-display text-xl font-semibold text-ivoire">{cat.name}</h3>
                    {earlyBird && !soldOut && (
                      <span className="border border-or px-2 py-0.5 font-body text-[10px] uppercase tracking-[0.15em] text-or">
                        Early Bird
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="mt-2 font-body text-xs text-ivoire/50">{cat.description}</p>
                  )}
                  {cat.included_items && (
                    <p className="mt-4 font-body text-sm leading-relaxed text-ivoire/70">
                      {cat.included_items}
                    </p>
                  )}
                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="font-display text-2xl font-semibold text-or">
                        {formatFcfa(price)}
                      </p>
                      {earlyBird && cat.price_normal !== cat.price_early_bird && (
                        <p className="font-body text-xs text-ivoire/40 line-through">
                          {formatFcfa(cat.price_normal)}
                        </p>
                      )}
                    </div>
                    <p className="font-body text-xs text-ivoire/40">
                      {soldOut ? 'Épuisé' : `${remaining} place(s) restante(s)`}
                    </p>
                  </div>
                  <button
                    disabled={soldOut}
                    onClick={() => pick(cat)}
                    className="mt-6 w-full border border-or py-3 font-body text-xs uppercase tracking-[0.2em] text-or transition-colors hover:bg-or hover:text-noir disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-or"
                  >
                    {soldOut ? 'Complet' : 'Choisir'}
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      {step === 'form' && selected && (
        <Reveal className="mx-auto max-w-lg border border-taupe/40 p-8 sm:p-10">
          <button
            onClick={() => setStep('pick')}
            className="font-body text-xs uppercase tracking-[0.15em] text-ivoire/50 hover:text-or"
          >
            ← Changer de catégorie
          </button>
          <h3 className="mt-4 font-display text-2xl font-semibold text-ivoire">{selected.name}</h3>

          <div className="mt-6 flex items-center justify-between border-b border-taupe pb-6">
            <span className="font-body text-sm text-ivoire/70">Nombre de places</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-ivoire/60 hover:text-or"
                aria-label="Diminuer"
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center font-display text-lg text-ivoire">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(placesRemaining(selected), Math.min(10, q + 1)))
                }
                className="text-ivoire/60 hover:text-or"
                aria-label="Augmenter"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="font-body text-sm text-ivoire/70">Total</span>
            <span className="font-display text-xl font-semibold text-or">
              {formatFcfa(effectivePrice(selected) * quantity)}
            </span>
          </div>

          <form onSubmit={submitOrder} className="mt-8 space-y-5">
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Nom complet</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full border-b border-taupe bg-transparent py-2.5 font-body text-ivoire outline-none focus:border-or"
              />
            </div>
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Téléphone (Mobile Money)</label>
              <input
                required
                type="tel"
                placeholder="+229 XX XX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full border-b border-taupe bg-transparent py-2.5 font-body text-ivoire outline-none focus:border-or"
              />
            </div>
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

            {errorMsg && <p className="font-body text-sm text-porto-light">{errorMsg}</p>}

            <button
              type="submit"
              className="mt-2 w-full border border-or bg-or py-3.5 font-body text-xs uppercase tracking-[0.25em] text-noir transition-opacity hover:opacity-90"
            >
              Payer {formatFcfa(effectivePrice(selected) * quantity)}
            </button>
            <p className="text-center font-body text-[11px] text-ivoire/40">
              Paiement sécurisé via Kkiapay — Mobile Money &amp; carte bancaire
            </p>
          </form>
        </Reveal>
      )}

      {step === 'paying' && (
        <div className="mx-auto max-w-lg border border-or/40 p-10 text-center">
          <p className="font-display text-lg text-ivoire">Fenêtre de paiement ouverte…</p>
          <p className="mt-3 font-body text-sm text-ivoire/50">
            Complétez le paiement de {formatFcfa(amount)} dans la fenêtre Kkiapay.
            Si elle ne s&apos;est pas ouverte, vérifiez que les pop-ups sont autorisés.
          </p>
          <button
            onClick={cancelPayment}
            className="mt-8 font-body text-xs uppercase tracking-[0.2em] text-ivoire/50 underline-offset-4 hover:text-or hover:underline"
          >
            Annuler et revenir en arrière
          </button>
        </div>
      )}

      {step === 'error' && (
        <div className="mx-auto max-w-lg border border-porto p-10 text-center">
          <p className="font-display text-lg text-ivoire">Un problème est survenu</p>
          <p className="mt-3 font-body text-sm text-ivoire/60">{errorMsg}</p>
        </div>
      )}
    </>
  );
}

/** Écoute l'événement de succès Kkiapay redispatché globalement. */
function KkiapaySuccessListener({ onSuccess }: { onSuccess: (transactionId: string) => void }) {
  useEffect(() => {
    function handler(e: any) {
      const transactionId = e.detail?.transactionId ?? e.detail?.transaction_id;
      if (transactionId) onSuccess(transactionId);
    }
    window.addEventListener('tyla-kkiapay-success', handler);
    return () => window.removeEventListener('tyla-kkiapay-success', handler);
  }, [onSuccess]);
  return null;
}

/**
 * Écoute la fermeture du widget Kkiapay sans paiement abouti (croix cliquée)
 * pour ramener automatiquement l'utilisateur à l'étape précédente au lieu
 * de le laisser bloqué sur "Fenêtre de paiement ouverte...".
 */
function KkiapayCloseListener({ onClose, active }: { onClose: () => void; active: boolean }) {
  useEffect(() => {
    if (!active) return;
    function handler() {
      onClose();
    }
    window.addEventListener('tyla-kkiapay-close', handler);
    return () => window.removeEventListener('tyla-kkiapay-close', handler);
  }, [onClose, active]);
  return null;
}
