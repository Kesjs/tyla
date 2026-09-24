'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { GoldFrame } from '@/components/GoldFrame';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    
    setLoading(true);
    setError('');
    const supabase = createClient();
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setError('Erreur lors de la mise à jour du mot de passe.');
        return;
      }
      
      // Marquer que l'utilisateur a changé son mot de passe
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const adminSupabase = createAdminClient();
        await adminSupabase
          .from('admin_users')
          .update({ must_change_password: false })
          .eq('email', user.email);
      }
      
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-noir">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-noir/90" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <GoldFrame inset={16}>
          <div className="bg-noir p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-or/20 blur-xl" />
                <Lock className="relative h-16 w-16 text-or" />
              </div>
              <p className="mt-6 font-body text-xs uppercase tracking-[0.35em] text-or">
                Première connexion
              </p>
              <h1 className="mt-3 font-display text-3xl font-semibold text-ivoire md:text-4xl">
                Changez votre mot de passe
              </h1>
              <p className="mt-4 font-body text-sm text-ivoire/60">
                Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant de continuer.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div className="group">
                <label className="mb-2 block font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ivoire/30 transition-colors group-focus-within:text-or" size={18} />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="w-full border border-taupe/30 bg-noir-soft py-3.5 pl-12 pr-12 font-body text-ivoire outline-none transition-all focus:border-or/50 focus:bg-noir-soft/80"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ivoire/30 transition-colors hover:text-or"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="mb-2 block font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ivoire/30 transition-colors group-focus-within:text-or" size={18} />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="w-full border border-taupe/30 bg-noir-soft py-3.5 pl-12 pr-12 font-body text-ivoire outline-none transition-all focus:border-or/50 focus:bg-noir-soft/80"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded border border-porto/30 bg-porto/10 px-4 py-3">
                  <p className="font-body text-sm text-porto-light">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full border border-or bg-or py-4 font-body text-xs uppercase tracking-[0.25em] text-noir transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
              </button>
            </form>
          </div>
        </GoldFrame>
      </div>
    </section>
  );
}