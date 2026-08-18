'use client';
import { useState, useEffect } from 'react';
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
import { isValidEmail, validateAndSanitizeName, validateInternationalPhone } from '@/lib/security';

export function TicketSelector({ categories, paymentCancelled }: { categories: TicketCategory[], paymentCancelled?: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [step, setStep] = useState<'pick' | 'form' | 'paying' | 'error'>('pick');
  const [errorMsg, setErrorMsg] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);

  // Afficher un message si le paiement a été annulé
  useEffect(() => {
    if (paymentCancelled) {
      setErrorMsg('Votre paiement a été annulé. N\'hésitez pas à réessayer.');
    }
  }, [paymentCancelled]);

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

  function handlePhoneChange(raw: string) {
    setPhone(raw);
    if (phoneError) setPhoneError('');
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
    
    try {
      // Afficher immédiatement le feedback visuel
      setStep('paying');
      
      setErrorMsg('');
      setNameError('');
      setEmailError('');
      setPhoneError('');

      // Validation client-side (double vérification avec serveur)
      if (!name.trim()) {
        setNameError('Le nom est requis.');
        setStep('form');
        return;
      }

      const nameValidation = validateAndSanitizeName(name);
      if (!nameValidation.valid) {
        setNameError('Nom invalide. Utilisez uniquement des lettres, espaces, tirets et apostrophes.');
        setStep('form');
        return;
      }

      if (!email.trim()) {
        setEmailError('L\'email est requis.');
        setStep('form');
        return;
      }

      if (!isValidEmail(email)) {
        setEmailError('Format d\'email invalide.');
        setStep('form');
        return;
      }

      const phoneValidation = validateInternationalPhone(phone.replace(/\D/g, ''));
      if (!phoneValidation.valid) {
        setPhoneError(phoneValidation.error);
        setStep('form');
        return;
      }

      const fullPhone = phone.trim();

      console.log('[submitOrder] Creating order:', { categoryId: selected.id, quantity, name, email });

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selected.id,
          quantity,
          buyerName: name,
          buyerPhone: fullPhone,
          buyerEmail: email,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error ?? 'Erreur lors de la création de la commande.';
        console.error('[submitOrder] Checkout error:', errorMsg);
        setErrorMsg(errorMsg);
        setStep('form');
        return;
      }

      console.log('[submitOrder] Order created:', { orderId: data.orderId, amount: data.amount });
      setOrderId(data.orderId);
      setAmount(data.amount);

      // Redirection vers GeniusPay (step 'paying' déjà set)
      await initiateGeniusPayPayment(data.orderId, data.amount, email, name, fullPhone);
    } catch (error) {
      console.error('[submitOrder] Exception:', error);
      setErrorMsg('Une erreur inattendue s\'est produite. Vérifiez la console.');
      setStep('form');
    }
  }

  async function initiateGeniusPayPayment(
    orderId: string,
    amount: number,
    email: string,
    name: string,
    phone: string
  ) {
    try {
      // Récupérer le lien de paiement GeniusPay
      const response = await fetch('/api/geniuspay/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          description: `Achat de billets TYLA - ${selected?.name}`,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrorMsg(error.error || 'Erreur lors de l\'initialisation du paiement GeniusPay');
        setStep('form');
        return;
      }

      const data = await response.json();
      console.log('[TicketSelector] Payment response - Full:', JSON.stringify(data, null, 2));
      console.log('[TicketSelector] Available keys:', Object.keys(data));
      
      // Redirection vers le checkout GeniusPay hébergé
      if (data.checkoutUrl) {
        console.log('[TicketSelector] Redirecting to:', data.checkoutUrl);
        // Ajouter les paramètres de callback avec l'orderId pour gérer l'annulation
        const callbackUrl = data.checkoutUrl.includes('?')
          ? `${data.checkoutUrl}&order=${orderId}`
          : `${data.checkoutUrl}?order=${orderId}`;
        window.location.href = callbackUrl;
      } else {
        console.error('[TicketSelector] No checkout URL found. Available:', data);
        setErrorMsg('Impossible de récupérer le lien de paiement. Réponse: ' + JSON.stringify(data));
        setStep('form');
      }
    } catch (error) {
      console.error('Erreur GeniusPay:', error);
      setErrorMsg('Erreur lors de la connexion à GeniusPay');
      setStep('form');
    }
  }

  return (
    <>
      {step === 'pick' && paymentCancelled && (
        <Reveal>
          <div className="mb-8 border-l-2 border-or bg-or/5 pl-4 py-3">
            <p className="font-body text-sm text-or/80">
              Votre paiement a été annulé. N'hésitez pas à réessayer. Si vous avez besoin d'aide, contactez-nous à benin@tylafrica.com
            </p>
          </div>
        </Reveal>
      )}
      {step === 'pick' && (
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((cat, i) => {
            const remaining = placesRemaining(cat);
            const soldOut = remaining <= 0;
            const earlyBird = isEarlyBirdAvailable(cat);
            const price = effectivePrice(cat);
            const progressPercent = Math.min(100, Math.round((cat.sold_count / (cat.quota_total || 1)) * 100)) || 0;
            
            let desc = cat.description || '';
            if (cat.name.match(/vip gold/i)) desc = desc.replace(/Professionnels établis,\s*diaspora,\s*mentors/i, '');
            if (cat.name.match(/standard/i)) desc = desc.replace(/Jeunes professionnels,\s*créatifs,\s*entrepreneurs,\s*grand public/i, '');

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
                  {desc && (
                    <p className="mt-2 font-body text-xs text-ivoire/50">{desc}</p>
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
                    <div className="text-right">
                      <p className="font-body text-xs text-ivoire/40">
                        {soldOut ? 'Épuisé' : `${remaining} place(s) restante(s)`}
                      </p>
                      <div className="mt-2 h-1 w-24 bg-taupe/20 ml-auto overflow-hidden">
                        <div className="h-full bg-or" style={{ width: `${progressPercent}%` }} />
                      </div>
                      <p className="mt-1 font-body text-[9px] text-or/60">{progressPercent}% vendus</p>
                    </div>
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
            <p className="border-l-2 border-or/40 pl-3 font-body text-xs leading-relaxed text-ivoire/50">
              Notez bien l&apos;email et le téléphone ci-dessous : ce sont les
              identifiants qui vous permettront de retrouver vos billets si
              vous fermez la page après paiement.
            </p>
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Nom complet</label>
              <input
                required
                value={name}
                onChange={(e) => { setName(e.target.value); if (nameError) setNameError(''); }}
                className={`mt-2 w-full border-b bg-transparent py-2.5 font-body text-ivoire outline-none ${
                  nameError ? 'border-porto focus:border-porto' : 'border-taupe focus:border-or'
                }`}
              />
              {nameError && <p className="mt-2 font-body text-xs text-porto-light">{nameError}</p>}
            </div>
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Téléphone (Mobile Money ou International)</label>
              <div className="mt-2 flex">
                <input
                  required
                  type="tel"
                  placeholder="ex: +33 6 12 34 56 78 ou +229 97 12 34 56"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => {
                    const validation = validateInternationalPhone(phone.replace(/\D/g, ''));
                    setPhoneError(validation.error);
                  }}
                  aria-invalid={!!phoneError}
                  className={`w-full border-b bg-transparent py-2.5 font-body text-ivoire outline-none ${
                    phoneError ? 'border-porto focus:border-porto' : 'border-taupe focus:border-or'
                  }`}
                />
              </div>
              {phoneError ? (
                <p className="mt-2 font-body text-xs text-porto-light">{phoneError}</p>
              ) : (
                <p className="mt-2 font-body text-xs text-ivoire/30">
                  Avec l&apos;indicatif pays (ex: +33, +229)
                </p>
              )}
            </div>
            <div>
              <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                onBlur={() => {
                  if (email && !isValidEmail(email)) {
                    setEmailError('Format d\'email invalide.');
                  }
                }}
                className={`mt-2 w-full border-b bg-transparent py-2.5 font-body text-ivoire outline-none ${
                  emailError ? 'border-porto focus:border-porto' : 'border-taupe focus:border-or'
                }`}
              />
              {emailError && <p className="mt-2 font-body text-xs text-porto-light">{emailError}</p>}
            </div>

            {errorMsg && (
              <div className="border-l-2 border-porto bg-porto/5 pl-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-body text-sm text-porto-light">{errorMsg}</p>
                  <button
                    onClick={() => setErrorMsg('')}
                    className="flex-shrink-0 text-porto/50 hover:text-porto"
                    aria-label="Fermer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={false}
              className="mt-2 w-full border border-or bg-or py-3.5 font-body text-xs uppercase tracking-[0.25em] text-noir transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step !== 'form' ? 'Traitement...' : `Payer ${formatFcfa(effectivePrice(selected) * quantity)}`}
            </button>
            <p className="text-center font-body text-[11px] text-ivoire/40">
              Paiement sécurisé via GeniusPay — Mobile Money, Carte bancaire &amp; Portefeuille numérique
            </p>
          </form>
        </Reveal>
      )}

      {step === 'paying' && (
        <div className="mx-auto max-w-lg border border-or/40 p-10 text-center">
          <p className="font-display text-lg text-ivoire">Fenêtre de paiement ouverte…</p>
          <p className="mt-3 font-body text-sm text-ivoire/50">
            Complétez le paiement de {formatFcfa(amount)} dans la fenêtre GeniusPay.
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
