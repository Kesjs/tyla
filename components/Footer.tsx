import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Facebook, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-taupe bg-noir">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/logo/tyla-logo-blanc.png"
                alt="T.Y.L.A"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
              <div className="leading-none">
                <p className="font-display text-base tracking-[0.3em] text-ivoire">T.Y.L.A</p>
                <p className="mt-1 font-body text-[10px] tracking-[0.2em] text-or/80">
                  THE YOUNG LEADERSHIP AFRICA
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-sm font-body text-sm leading-relaxed text-ivoire/60">
              Créer sans copier. Influencer sans se renier. Transformer son héritage
              en force créative.
            </p>
          </div>

          <div>
            <p className="font-body text-xs uppercase tracking-[0.25em] text-or">Explorer</p>
            <ul className="mt-5 space-y-3 font-body text-sm text-ivoire/70">
              <li><Link href="/association" className="hover:text-or">L&apos;Association</Link></li>
              <li><Link href="/evenement" className="hover:text-or">L&apos;Événement</Link></li>
              <li><Link href="/billetterie" className="hover:text-or">Billetterie</Link></li>
              <li><Link href="/contact" className="hover:text-or">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-body text-xs uppercase tracking-[0.25em] text-or">Suivre</p>
            <div className="mt-5 flex gap-4">
              <a
                href="https://instagram.com/tyla.africa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-ivoire/70 transition-colors hover:text-or"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-ivoire/70 transition-colors hover:text-or"
              >
                <Facebook size={20} />
              </a>
              <a
                href="mailto:benin@tylafrica.com"
                aria-label="Email"
                className="text-ivoire/70 transition-colors hover:text-or"
              >
                <Mail size={20} />
              </a>
            </div>
            <p className="mt-5 font-body text-sm text-ivoire/50">@tyla.africa</p>
          </div>
        </div>

        <div className="hairline-or mt-14" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 font-body text-xs text-ivoire/40 md:flex-row">
          <p>&copy; {new Date().getFullYear()} T.Y.L.A — The Young Leadership Africa. Tous droits réservés.</p>
          <p>J&apos;AFFIRME Fashion Week · Cotonou, Bénin</p>
        </div>
      </div>
    </footer>
  );
}
