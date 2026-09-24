import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AuthCallbackPage() {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data.user) {
    // Erreur d'authentification, rediriger vers la page de login
    redirect('/admin/login?error=auth_failed');
  }
  
  // Vérifier si l'utilisateur est autorisé à accéder à l'admin
  const authorizedEmails = ['ken2001babatounde@gmail.com', 'eunice@tylafrica.com'];
  
  if (!authorizedEmails.includes(data.user.email || '')) {
    // Utilisateur non autorisé, déconnecter et rediriger
    await supabase.auth.signOut();
    redirect('/admin/login?error=unauthorized');
  }
  
  // Authentification réussie, rediriger vers le dashboard
  redirect('/admin');
}