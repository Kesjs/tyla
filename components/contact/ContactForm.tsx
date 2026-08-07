'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Reveal } from '@/components/Reveal';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    const supabase = createClient();
    const { error } = await supabase
      .from('tyla_contact_messages')
      .insert({ name, email, message });

    if (error) {
      setStatus('error');
      return;
    }
    setStatus('sent');
    setName('');
    setEmail('');
    setMessage('');
  }

  if (status === 'sent') {
    return (
      <Reveal>
        <div className="border border-or/40 p-8 text-center">
          <p className="font-display text-xl text-or">Message envoyé.</p>
          <p className="mt-3 font-body text-sm text-ivoire/60">
            Merci — l&apos;équipe T.Y.L.A vous répond au plus vite.
          </p>
        </div>
      </Reveal>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Nom</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full border-b border-taupe bg-transparent py-3 font-body text-ivoire outline-none transition-colors focus:border-or"
        />
      </div>
      <div>
        <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border-b border-taupe bg-transparent py-3 font-body text-ivoire outline-none transition-colors focus:border-or"
        />
      </div>
      <div>
        <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Message</label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full resize-none border-b border-taupe bg-transparent py-3 font-body text-ivoire outline-none transition-colors focus:border-or"
        />
      </div>
      {status === 'error' && (
        <p className="font-body text-sm text-porto-light">
          Une erreur est survenue, réessayez dans un instant.
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="group relative overflow-hidden border border-or px-9 py-3.5 font-body text-xs uppercase tracking-[0.25em] text-or disabled:opacity-50"
      >
        <span className="absolute inset-0 -translate-x-full bg-or transition-transform duration-500 ease-out group-hover:translate-x-0" />
        <span className="relative transition-colors duration-500 group-hover:text-noir">
          {status === 'sending' ? 'Envoi...' : 'Envoyer le message'}
        </span>
      </button>
    </form>
  );
}
