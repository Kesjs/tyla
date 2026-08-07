import Image from 'next/image';
import { Mail, Phone, Instagram, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Reveal } from '@/components/Reveal';
import { ContactForm } from '@/components/contact/ContactForm';
import type { ContactInfo } from '@/lib/tickets';

export const revalidate = 0;

export default async function ContactPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('tyla_contact_info')
    .select('*')
    .eq('id', 1)
    .single();

  const contact = data as ContactInfo | null;

  return (
    <section className="relative overflow-hidden bg-noir py-32 pt-40 md:py-40 md:pt-48">
      <div className="absolute inset-0 opacity-20">
        <Image src="/images/DSC_7657.jpg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-noir/90" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:px-10">
        <div>
          <Reveal>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-or">Contact</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-ivoire sm:text-5xl">
              Parlons-en.
            </h1>
            <p className="mt-5 max-w-sm font-body text-sm leading-relaxed text-ivoire/60">
              Presse, partenariats, sponsoring ou simple question sur la
              billetterie — l&apos;équipe T.Y.L.A vous répond.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-12 space-y-6">
            {contact?.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-4 group">
                <Mail className="text-or" size={18} />
                <span className="font-body text-sm text-ivoire/80 group-hover:text-or">
                  {contact.email}
                </span>
              </a>
            )}
            {contact?.phone_1 && (
              <a href={`tel:${contact.phone_1}`} className="flex items-center gap-4 group">
                <Phone className="text-or" size={18} />
                <span className="font-body text-sm text-ivoire/80 group-hover:text-or">
                  {contact.phone_1}
                  {contact.phone_2 ? ` · ${contact.phone_2}` : ''}
                </span>
              </a>
            )}
            {contact?.instagram && (
              <a
                href={`https://instagram.com/${contact.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <Instagram className="text-or" size={18} />
                <span className="font-body text-sm text-ivoire/80 group-hover:text-or">
                  {contact.instagram}
                </span>
              </a>
            )}
            {contact?.address && (
              <div className="flex items-center gap-4">
                <MapPin className="text-or" size={18} />
                <span className="font-body text-sm text-ivoire/80">{contact.address}</span>
              </div>
            )}
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
