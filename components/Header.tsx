'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const NAV_LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: '/association', label: "L'Association" },
  { href: '/evenement', label: "L'Événement" },
  { href: '/billetterie', label: 'Billetterie' },
  { href: '/presse', label: 'Presse' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? 'bg-noir/90 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
          <Image
            src="/logo-tyla.png"
            alt="T.Y.L.A"
            width={36}
            height={36}
            className="h-9 w-9 object-contain transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-sm tracking-[0.3em] text-ivoire">T.Y.L.A</span>
            <span className="font-body text-[9px] tracking-[0.2em] text-or/80">
              THE YOUNG LEADERSHIP AFRICA
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:gap-10 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <NavLink
                key={link.href}
                href={link.href}
                external={link.external}
                className={`relative py-1 font-body text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                  isActive ? 'text-or font-semibold' : 'text-ivoire/80 hover:text-or'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-or rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
          <NavLink
            href="/billetterie"
            className="border border-or px-5 py-2 font-body text-xs uppercase tracking-[0.2em] text-or transition-all duration-300 hover:bg-or hover:text-noir"
          >
            Réserver
          </NavLink>
        </nav>

        <button
          aria-label="Menu"
          className="text-ivoire md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-taupe bg-noir md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-6">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    external={link.external}
                    onClick={() => setOpen(false)}
                    className={`py-3 font-body text-sm uppercase tracking-[0.2em] transition-colors ${
                      isActive ? 'text-or font-semibold' : 'text-ivoire/80'
                    }`}
                  >
                    {link.label}
                  </NavLink>
                );
              })}
              <NavLink
                href="/billetterie"
                onClick={() => setOpen(false)}
                className="mt-3 border border-or px-5 py-3 text-center font-body text-sm uppercase tracking-[0.2em] text-or"
              >
                Réserver
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
