'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/association', label: "L'Association" },
  { href: '/evenement', label: "L'Événement" },
  { href: '/billetterie', label: 'Billetterie' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
            src="/logo/tyla-logo-blanc.png"
            alt="T.Y.L.A"
            width={36}
            height={36}
            className="h-9 w-9 object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-sm tracking-[0.3em] text-ivoire">T.Y.L.A</span>
            <span className="font-body text-[9px] tracking-[0.2em] text-or/80">
              THE YOUNG LEADERSHIP AFRICA
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/80 transition-colors duration-300 hover:text-or"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/billetterie"
            className="border border-or px-5 py-2 font-body text-xs uppercase tracking-[0.2em] text-or transition-all duration-300 hover:bg-or hover:text-noir"
          >
            Réserver
          </Link>
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
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-3 font-body text-sm uppercase tracking-[0.2em] text-ivoire/80"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/billetterie"
                onClick={() => setOpen(false)}
                className="mt-3 border border-or px-5 py-3 text-center font-body text-sm uppercase tracking-[0.2em] text-or"
              >
                Réserver
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
