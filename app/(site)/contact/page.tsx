import Image from 'next/image';
import { Mail, Phone, Instagram, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Reveal } from '@/components/Reveal';
import { ContactForm } from '@/components/contact/ContactForm';
import type { ContactInfo } from '@/lib/tickets';
import { getCommitteeMembers } from '@/lib/committee';
import type { CommitteeMember } from '@/lib/committee';

// Données par défaut en attendant que la table soit créée
const DEFAULT_COMMITTEE: CommitteeMember[] = [
  { 
    initials: 'TM', 
    name: 'Tatiana Monteiro', 
    role: 'Présidente',
    email: 'presidente@tylafrica.com',
    phone: '+229 XX XX XX XX',
    display_order: 1,
    active: true
  },
  { 
    initials: 'MT', 
    name: 'Myriam Tsumbu Nzanzala', 
    role: 'Vice-Présidente',
    email: 'vice-presidente@tylafrica.com',
    phone: '+229 XX XX XX XX',
    display_order: 2,
    active: true
  },
  { 
    initials: 'IK', 
    name: 'Ismael Kane', 
    role: 'Trésorier',
    email: 'tresorier@tylafrica.com',
    phone: '+229 XX XX XX XX',
    display_order: 3,
    active: true
  },
  { 
    initials: 'ET', 
    name: 'Eunice Tchibozo', 
    role: 'Resp. Projet et Développement',
    email: 'projet@tylafrica.com',
    phone: '+229 XX XX XX XX',
    display_order: 4,
    active: true
  },
  { 
    initials: 'BO', 
    name: 'Benedicte Okonda', 
    role: 'Secrétaire Générale',
    email: 'secretaire@tylafrica.com',
    phone: '+229 XX XX XX XX',
    display_order: 5,
    active: true
  },
  { 
    initials: 'JL', 
    name: 'Julia Lavenette', 
    role: 'Responsable Média',
    email: 'media@tylafrica.com',
    phone: '+229 XX XX XX XX',
    display_order: 6,
    active: true
  },
];

export const revalidate = 0;

export default async function ContactPage() {
  const supabase = createClient();
  const [contactData, committeeData] = await Promise.all([
    supabase.from('tyla_contact_info').select('*').eq('id', 1).single(),
    getCommitteeMembers(supabase).catch(() => []) // Fallback si table n'existe pas encore
  ]);

  const contact = contactData.data as ContactInfo | null;
  const committee = committeeData && committeeData.length > 0 ? committeeData : DEFAULT_COMMITTEE;

  return (
    <section className="relative overflow-hidden bg-noir py-32 pt-40 md:py-40 md:pt-48">
      <div className="absolute inset-0 opacity-20">
        <Image src="/images/DSC_7657.jpg" alt="" fill className="object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-noir/90" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
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

        <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Contact Form */}
          <div className="lg:col-span-1">
            <Reveal delay={0.15}>
              <div className="space-y-6 mb-8">
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
              </div>
              <ContactForm />
            </Reveal>
          </div>

          {/* Committee Team */}
          <div className="lg:col-span-2">
            <Reveal delay={0.2}>
              <h2 className="font-display text-2xl font-semibold text-ivoire mb-8">Le Comité</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {committee.map((member, i) => (
                  <Reveal key={member.id} delay={0.25 + i * 0.05}>
                    <div className="border border-taupe/30 bg-noir-soft p-6 hover:border-or/50 transition-colors h-full flex flex-col">
                      <div className="flex-1">
                        <p className="font-display text-base font-semibold text-ivoire">{member.name}</p>
                        <p className="font-body text-xs uppercase tracking-[0.15em] text-ivoire/50 mb-4">{member.role}</p>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-taupe/20">
                        <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-ivoire/70 hover:text-or transition-colors">
                          <Mail size={14} />
                          <span className="truncate">{member.email}</span>
                        </a>
                        <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-sm text-ivoire/70 hover:text-or transition-colors">
                          <Phone size={14} />
                          <span>{member.phone}</span>
                        </a>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
