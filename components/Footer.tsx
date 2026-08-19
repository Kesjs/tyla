import Image from 'next/image';
import { Instagram, Facebook } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

export function Footer() {
  return (
    <footer className="border-t border-taupe bg-noir">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-tyla.png"
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
              <li><NavLink href="/association" className="hover:text-or">L&apos;Association</NavLink></li>
              <li><NavLink href="/evenement" className="hover:text-or">L&apos;Événement</NavLink></li>
              <li><NavLink href="/billetterie" className="hover:text-or">Billetterie</NavLink></li>
              <li><NavLink href="/presse" className="hover:text-or">Presse</NavLink></li>
              <li><NavLink href="/contact" className="hover:text-or">Contact</NavLink></li>
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
                className="text-ivoire/70 transition-colors hover:text-or flex items-center"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/tyla.africa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-ivoire/70 transition-colors hover:text-or flex items-center"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.linkedin.com/company/the-young-leadership-of-africa/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="font-body text-sm text-ivoire/70 transition-colors hover:text-or flex items-center"
              >
                LinkedIn
              </a>
              <a
                href="https://www.tiktok.com/@tylafrica?_r=1&_t=ZN-98xQ86OXW3a"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="font-body text-sm text-ivoire/70 transition-colors hover:text-or flex items-center"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>

        <div className="hairline-or mt-14" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 font-body text-xs text-ivoire/40 md:flex-row">
          <p>&copy; {new Date().getFullYear()} T.Y.L.A — The Young Leadership Africa. Tous droits réservés.</p>
          <p>J&apos;AFFIRME — T.Y.L.A Fashion Week · Cotonou, Bénin.</p>
        </div>
      </div>
    </footer>
  );
}
