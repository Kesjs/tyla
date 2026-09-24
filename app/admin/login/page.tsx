'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { GoldFrame } from '@/components/GoldFrame';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBlocked = searchParams.get('blocked') === 'true';
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (isBlocked) {
      setError('Trop de tentatives de connexion. Réessayez dans 15 minutes.');
      return;
    }
    
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/auth/callback`
      }
    });
    setLoading(false);
    
    if (error) {
      setError('Erreur lors de l\'envoi du lien de connexion.');
      return;
    }
    
    setSuccess(true);
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-noir">
      {/* Background with subtle image */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/images/backstage-01.jpg"
          alt="Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-noir/90" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <GoldFrame inset={16}>
          <div className="bg-noir p-8 md:p-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-or/20 blur-xl" />
                <Image
                  src="/logo/tyla-logo-blanc.png"
                  alt="T.Y.L.A"
                  width={64}
                  height={64}
                  className="relative h-16 w-16 object-contain"
                />
              </div>
              <p className="mt-6 font-body text-xs uppercase tracking-[0.35em] text-or">
                Espace admin
              </p>
              <h1 className="mt-3 font-display text-3xl font-semibold text-ivoire md:text-4xl">
                J&apos;AFFIRME 2026
              </h1>
              <p className="mt-4 font-body text-sm text-ivoire/60">
                Connexion sécurisée par email. Un lien de connexion sera envoyé à votre adresse.
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              onSubmit={handleSubmit}
              className="mt-10 space-y-6"
            >
              {/* Email field */}
              <div className="group">
                <label className="mb-2 block font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ivoire/30 transition-colors group-focus-within:text-or" size={18} />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full border border-taupe/30 bg-noir-soft py-3.5 pl-12 pr-4 font-body text-ivoire outline-none transition-all focus:border-or/50 focus:bg-noir-soft/80"
                  />
                </div>
              </div>

              {/* Blocked message */}
              {isBlocked && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded border border-porto/50 bg-porto/20 px-4 py-3"
                >
                  <p className="font-body text-sm text-porto-light">
                    Trop de tentatives de connexion. Votre IP a été temporairement bloquée pour des raisons de sécurité. Réessayez dans 15 minutes.
                  </p>
                </motion.div>
              )}

              {/* Success message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded border border-or/30 bg-or/10 px-4 py-3"
                >
                  <p className="font-body text-sm text-or">
                    Lien de connexion envoyé à {email}. Vérifiez votre boîte de réception et cliquez sur le lien pour vous connecter.
                  </p>
                </motion.div>
              )}

              {/* Error message */}
              {error && !isBlocked && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded border border-porto/30 bg-porto/10 px-4 py-3"
                >
                  <p className="font-body text-sm text-porto-light">{error}</p>
                </motion.div>
              )}

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading || success}
                whileHover={{ scale: loading || success ? 1 : 1.02 }}
                whileTap={{ scale: loading || success ? 1 : 0.98 }}
                className="group relative w-full overflow-hidden border border-or bg-or py-4 font-body text-xs uppercase tracking-[0.25em] text-noir transition-all hover:shadow-lg hover:shadow-or/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <motion.div
                        className="h-4 w-4 rounded-full border-2 border-noir border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Envoi en cours...
                    </>
                  ) : success ? (
                    'Lien envoyé'
                  ) : (
                    'Envoyer le lien de connexion'
                  )}
                </span>
              </motion.button>
            </motion.form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="font-body text-xs text-ivoire/40">
                T.Y.L.A — The Young Leadership Africa
              </p>
            </motion.div>
          </div>
        </GoldFrame>
      </motion.div>
    </section>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-noir">
        <div className="text-ivoire/50">Chargement...</div>
      </section>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}