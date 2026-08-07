'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Mail, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Reveal } from '@/components/Reveal';
import type { CommitteeMember } from '@/lib/committee';

export function CommitteeManager() {
  const supabase = createClient();
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    initials: '',
    name: '',
    role: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    const { data } = await supabase
      .from('tyla_committee_members')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });
    setMembers(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (editingMember) {
      await supabase
        .from('tyla_committee_members')
        .update(formData)
        .eq('id', editingMember.id)
      .select();
    } else {
      const maxOrder = members.length > 0 ? Math.max(...members.map(m => m.display_order)) : 0;
      await supabase
        .from('tyla_committee_members')
        .insert({ ...formData, display_order: maxOrder + 1, active: true })
        .select();
    }
    
    setFormData({ initials: '', name: '', role: '', email: '', phone: '' });
    setEditingMember(null);
    setShowForm(false);
    loadMembers();
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce membre ?')) return;
    
    await supabase
      .from('tyla_committee_members')
      .update({ active: false })
      .eq('id', id);
    
    loadMembers();
  }

  function handleEdit(member: CommitteeMember) {
    setEditingMember(member);
    setFormData({
      initials: member.initials,
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
    });
    setShowForm(true);
  }

  function handleCancel() {
    setFormData({ initials: '', name: '', role: '', email: '', phone: '' });
    setEditingMember(null);
    setShowForm(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ivoire">Membres du Comité</h2>
          <p className="mt-2 font-body text-sm text-ivoire/60">
            Gérez les membres du comité et leurs contacts
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 border border-or px-4 py-2 font-body text-xs uppercase tracking-[0.2em] text-or transition-colors hover:bg-or hover:text-noir"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {showForm && (
        <Reveal>
          <div className="border border-taupe/40 bg-noir-soft p-6">
            <h3 className="font-display text-lg font-semibold text-ivoire mb-4">
              {editingMember ? 'Modifier' : 'Ajouter'} un membre
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Initiales</label>
                  <input
                    required
                    value={formData.initials}
                    onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
                    placeholder="TM"
                    maxLength={4}
                    className="mt-2 w-full border-b border-taupe bg-transparent py-2 font-body text-ivoire outline-none focus:border-or"
                  />
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Nom complet</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tatiana Monteiro"
                    className="mt-2 w-full border-b border-taupe bg-transparent py-2 font-body text-ivoire outline-none focus:border-or"
                  />
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Rôle</label>
                  <input
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Présidente"
                    className="mt-2 w-full border-b border-taupe bg-transparent py-2 font-body text-ivoire outline-none focus:border-or"
                  />
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Email</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@tylafrica.com"
                    className="mt-2 w-full border-b border-taupe bg-transparent py-2 font-body text-ivoire outline-none focus:border-or"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-body text-xs uppercase tracking-[0.2em] text-ivoire/50">Téléphone</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+229 XX XX XX XX"
                    className="mt-2 w-full border-b border-taupe bg-transparent py-2 font-body text-ivoire outline-none focus:border-or"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="border border-or bg-or px-6 py-2 font-body text-xs uppercase tracking-[0.2em] text-noir transition-colors hover:opacity-90"
                >
                  {editingMember ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-taupe px-6 py-2 font-body text-xs uppercase tracking-[0.2em] text-ivoire/70 transition-colors hover:border-ivoire hover:text-ivoire"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </Reveal>
      )}

      {loading ? (
        <p className="font-body text-sm text-ivoire/60">Chargement...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, i) => (
            <Reveal key={member.id} delay={i * 0.05}>
              <div className="border border-taupe/30 bg-noir-soft p-5 hover:border-or/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-or/40 font-display text-lg text-or">
                    {member.initials}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-ivoire/40 hover:text-or transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => member.id && handleDelete(member.id)}
                      className="text-ivoire/40 hover:text-porto transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-ivoire">{member.name}</p>
                  <p className="font-body text-xs uppercase tracking-[0.15em] text-ivoire/50 mb-3">{member.role}</p>
                  <div className="space-y-2 pt-3 border-t border-taupe/20">
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
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}