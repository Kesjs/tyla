'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Ticket, MessageSquare, LogOut, QrCode } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/billets', label: 'Billets', icon: Ticket },
  { href: '/admin/commandes', label: 'Commandes & Check-in', icon: QrCode },
  { href: '/admin/contact', label: 'Page Contact', icon: MessageSquare },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="flex h-full w-full flex-col justify-between border-r border-taupe/30 bg-noir-soft px-6 py-8 md:w-64">
      <div>
        <div className="flex items-center gap-3">
          <Image src="/logo/tyla-logo-or-fond-noir.jpg" alt="T.Y.L.A" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
          <div className="leading-none">
            <p className="font-display text-xs tracking-[0.25em] text-ivoire">T.Y.L.A</p>
            <p className="mt-1 font-body text-[9px] tracking-[0.15em] text-or/80">ADMIN J&apos;AFFIRME</p>
          </div>
        </div>

        <nav className="mt-10 flex flex-col gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 font-body text-sm transition-colors ${
                  active ? 'bg-or/10 text-or' : 'text-ivoire/60 hover:text-ivoire'
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2.5 font-body text-sm text-ivoire/50 transition-colors hover:text-porto-light"
      >
        <LogOut size={16} />
        Déconnexion
      </button>
    </aside>
  );
}
