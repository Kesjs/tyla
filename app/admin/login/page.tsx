'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError('Email ou mot de passe incorrect.');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-noir px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo/tyla-logo-or-fond-noir.jpg"
            alt="T.Y.L.A"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
          <p className="mt-4 font-body text-xs uppercase tracking-[0.3em] text-or">Espace admin</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ivoire">J&apos;AFFIRME 2026</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
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
            <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Mot de passe</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border-b border-taupe bg-transparent py-2.5 font-body text-ivoire outline-none focus:border-or"
            />
          </div>
          {error && <p className="font-body text-sm text-porto-light">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full border border-or bg-or py-3.5 font-body text-xs uppercase tracking-[0.25em] text-noir transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </section>
  );
}
