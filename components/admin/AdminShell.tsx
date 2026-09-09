'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  MessageSquare,
  LogOut,
  QrCode,
  Users,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/billets', label: 'Billets', icon: Ticket },
  { href: '/admin/commandes', label: 'Commandes & Check-in', icon: QrCode },
  { href: '/admin/committee', label: 'Comité', icon: Users },
  { href: '/admin/contact', label: 'Page Contact', icon: MessageSquare },
];

const COLLAPSE_KEY = 'tyla-admin-sidebar-collapsed';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Restaure la préférence desktop (réduit / étendu) une fois côté client.
  useEffect(() => {
    const stored = window.localStorage.getItem(COLLAPSE_KEY);
    if (stored === '1') setCollapsed(true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
  }, [collapsed, hydrated]);

  // Ferme le tiroir mobile à chaque changement de page.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Verrouille le scroll + ferme sur Échap tant que le tiroir mobile est ouvert.
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstLinkRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-noir md:flex-row">
      {/* Barre du haut — mobile uniquement */}
      <header className="flex items-center justify-between border-b border-taupe/30 bg-noir-soft px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo/tyla-logo-or-fond-noir.jpg"
            alt="T.Y.L.A"
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
          />
          <div className="leading-none">
            <p className="font-display text-[11px] tracking-[0.25em] text-ivoire">T.Y.L.A</p>
            <p className="mt-0.5 font-body text-[8px] tracking-[0.15em] text-or/80">ADMIN J&apos;AFFIRME</p>
          </div>
        </div>
        <button
          ref={hamburgerRef}
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={mobileOpen}
          aria-controls="admin-sidebar"
          className="rounded-md p-2 text-ivoire/70 transition-colors hover:bg-ivoire/5 hover:text-ivoire"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Overlay — mobile uniquement, ferme le tiroir au clic */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-noir/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        aria-label="Navigation admin"
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col justify-between border-r border-taupe/30 bg-noir-soft py-6 transition-transform duration-300 ease-out md:static md:h-auto md:min-h-screen md:translate-x-0 md:transition-[width] md:duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-[76px]' : 'md:w-64'}`}
      >
        <div>
          <div className={`flex items-center gap-3 px-5 ${collapsed ? 'md:justify-center md:px-0' : ''}`}>
            <Image
              src="/logo/tyla-logo-or-fond-noir.jpg"
              alt="T.Y.L.A"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
              loading="lazy"
            />
            <div className={`leading-none ${collapsed ? 'md:hidden' : ''}`}>
              <p className="font-display text-xs tracking-[0.25em] text-ivoire">T.Y.L.A</p>
              <p className="mt-1 font-body text-[9px] tracking-[0.15em] text-or/80">ADMIN J&apos;AFFIRME</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer le menu"
              className="ml-auto rounded-md p-1.5 text-ivoire/60 transition-colors hover:text-ivoire md:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-1 px-3">
            {LINKS.map((link, i) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={i === 0 ? firstLinkRef : undefined}
                  title={collapsed ? link.label : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-sm transition-colors ${
                    active ? 'bg-or/10 text-or' : 'text-ivoire/60 hover:bg-ivoire/5 hover:text-ivoire'
                  } ${collapsed ? 'md:justify-center md:px-0' : ''}`}
                >
                  <link.icon size={16} className="shrink-0" />
                  <span className={collapsed ? 'md:hidden' : ''}>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`flex flex-col gap-1 px-3 ${collapsed ? 'md:items-center md:px-0' : ''}`}>
          {/* Réduire / étendre — desktop uniquement */}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Développer le menu' : 'Réduire le menu'}
            title={collapsed ? 'Développer' : undefined}
            className={`hidden items-center gap-3 rounded-md px-3 py-2.5 font-body text-sm text-ivoire/50 transition-colors hover:bg-ivoire/5 hover:text-ivoire md:flex ${
              collapsed ? 'md:justify-center md:px-0' : ''
            }`}
          >
            {collapsed ? <PanelLeftOpen size={16} className="shrink-0" /> : <PanelLeftClose size={16} className="shrink-0" />}
            <span className={collapsed ? 'md:hidden' : ''}>Réduire</span>
          </button>

          <button
            onClick={logout}
            title={collapsed ? 'Déconnexion' : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-sm text-ivoire/50 transition-colors hover:text-porto-light ${
              collapsed ? 'md:justify-center md:px-0' : ''
            }`}
          >
            <LogOut size={16} className="shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden px-6 py-10 md:px-12 md:py-12">{children}</main>
    </div>
  );
}
