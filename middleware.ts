import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SecurityLogger } from '@/lib/security';

// Rate limiting simple en mémoire pour le middleware
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const attempts = loginAttempts.get(ip);
  
  if (!attempts || attempts.resetTime < now) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (attempts.count >= maxAttempts) {
    return false;
  }

  attempts.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isResetPasswordPage = request.nextUrl.pathname === '/admin/reset-password';
  // Pages accessibles sans session admin déjà établie : login classique et
  // la page de définition de mot de passe (utilisée via le lien de
  // récupération envoyé par email, où la session ne se forme que côté
  // client une fois la page chargée).
  const isPublicAuthPage = isLoginPage || isResetPasswordPage;

  // Rate limiting pour login admin
  if (isLoginPage && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
              request.headers.get('x-real-ip') || 
              'unknown';
    
    if (!checkLoginRateLimit(ip)) {
      SecurityLogger.logSuspiciousActivity('login_rate_limit', ip, { 
        endpoint: 'admin/login',
        attempts: loginAttempts.get(ip)?.count 
      });
      return NextResponse.redirect(new URL('/admin/login?blocked=true', request.url));
    }
  }

  if (!user && !isPublicAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // Vérification du rôle admin réel (table partagée Ayiba public.users).
  // Un compte connecté (client/vendeur/livreur, y compris ceux d'Ayiba) ne
  // doit PAS pouvoir accéder à /admin/* juste parce qu'il est authentifié.
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, account_roles')
      .eq('id', user.id)
      .single();

    isAdmin =
      profile?.role === 'admin' ||
      (Array.isArray(profile?.account_roles) && profile.account_roles.includes('admin'));

    if (!isAdmin && !isPublicAuthPage) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                request.headers.get('x-real-ip') ||
                'unknown';
      SecurityLogger.logSuspiciousActivity('admin_access_denied', ip, {
        endpoint: request.nextUrl.pathname,
        userId: user.id,
      });
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('unauthorized', 'true');
      return NextResponse.redirect(url);
    }
  }

  if (user && isAdmin && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
