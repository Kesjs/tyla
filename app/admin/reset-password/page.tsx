'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { GoldFrame } from '@/components/GoldFrame';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Le lien envoyé par email contient un jeton de récupération que le SDK
    // Supabase détecte automatiquement dans l'URL et échange contre une
    // session temporaire. On écoute l'événement PASSWORD_RECOVERY pour
    // savoir que cette session est prête avant d'afficher le formulaire.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // Filet de sécurité : si une session existe déjà au chargement
    // (certains navigateurs déclenchent l'event avant l'attachement du
    // listener), on la détecte aussi directement.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      }
    });

    // Si après quelques secondes aucune session de récupération n'est
    // détectée, le lien est probablement invalide ou expiré.
    const timeout = setTimeout(() => {
      setReady((current) => {
        if (!current) setLinkInvalid(true);
        return current;
      });
    }, 4000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Impossible de mettre à jour le mot de passe. Réessayez ou redemandez un lien.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push('/admin/login');
    }, 2000);
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-noir">
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
            <div className="flex flex-col items-center text-center">
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
              <h1 className="mt-6 font-serif text-2xl text-blanc">
                Définir un mot de passe
              </h1>
              <p className="mt-2 text-sm text-blanc/60">
                Choisissez le mot de passe de votre espace admin.
              </p>
            </div>

            <div className="mt-8">
              {linkInvalid && !success && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  Ce lien est invalide ou a expiré. Redemandez un email de
                  réinitialisation depuis le dashboard Supabase.
                </p>
              )}

              {!ready && !linkInvalid && (
                <p className="text-center text-sm text-blanc/60">
                  Vérification du lien…
                </p>
              )}

              {ready && !success && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blanc/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nouveau mot de passe"
                      minLength={8}
                      required
                      className="w-full rounded-lg border border-blanc/10 bg-blanc/5 py-3 pl-10 pr-10 text-sm text-blanc placeholder:text-blanc/40 focus:border-or/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blanc/40 hover:text-blanc/70"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blanc/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      minLength={8}
                      required
                      className="w-full rounded-lg border border-blanc/10 bg-blanc/5 py-3 pl-10 pr-10 text-sm text-blanc placeholder:text-blanc/40 focus:border-or/50 focus:outline-none"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-or py-3 text-sm font-medium text-noir transition hover:bg-or/90 disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement…' : 'Définir le mot de passe'}
                  </button>
                </form>
              )}

              {success && (
                <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-400">
                  Mot de passe défini. Redirection vers la connexion…
                </p>
              )}
            </div>
          </div>
        </GoldFrame>
      </motion.div>
    </section>
  );
}
