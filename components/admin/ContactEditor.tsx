'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ContactInfo } from '@/lib/tickets';

export function ContactEditor({ initial }: { initial: ContactInfo }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(field: keyof ContactInfo, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('tyla_contact_info')
      .update({
        phone_1: form.phone_1,
        phone_2: form.phone_2,
        email: form.email,
        address: form.address,
        instagram: form.instagram,
        facebook: form.facebook,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="max-w-lg space-y-6">
      <Field label="Email">
        <input
          value={form.email ?? ''}
          onChange={(e) => update('email', e.target.value)}
          className="w-full border-b border-taupe bg-transparent py-2.5 font-body text-ivoire outline-none focus:border-or"
        />
      </Field>
      <Field label="Téléphone principal">
        <input
          value={form.phone_1 ?? ''}
          onChange={(e) => update('phone_1', e.target.value)}
          placeholder="+229 XX XX XX XX"
          className="w-full border-b border-taupe bg-transparent py-2.5 font-body text-ivoire outline-none focus:border-or"
        />
      </Field>
      <Field label="Téléphone secondaire">
        <input
          value={form.phone_2 ?? ''}
          onChange={(e) => update('phone_2', e.target.value)}
          placeholder="+41 XX XXX XX XX"
          className="w-full border-b border-taupe bg-transparent py-2.5 font-body text-ivoire outline-none focus:border-or"
        />
      </Field>
      <Field label="Adresse / lieu">
        <input
          value={form.address ?? ''}
          onChange={(e) => update('address', e.target.value)}
          placeholder="Family Beach, Cotonou"
          className="w-full border-b border-taupe bg-transparent py-2.5 font-body text-ivoire outline-none focus:border-or"
        />
      </Field>
      <Field label="Instagram">
        <input
          value={form.instagram ?? ''}
          onChange={(e) => update('instagram', e.target.value)}
          placeholder="@tyla.africa"
          className="w-full border-b border-taupe bg-transparent py-2.5 font-body text-ivoire outline-none focus:border-or"
        />
      </Field>
      <Field label="Facebook (lien)">
        <input
          value={form.facebook ?? ''}
          onChange={(e) => update('facebook', e.target.value)}
          className="w-full border-b border-taupe bg-transparent py-2.5 font-body text-ivoire outline-none focus:border-or"
        />
      </Field>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 border border-or px-6 py-3 font-body text-xs uppercase tracking-[0.2em] text-or transition-colors hover:bg-or hover:text-noir disabled:opacity-50"
      >
        <Save size={14} />
        {saving ? 'Enregistrement...' : saved ? 'Enregistré ✓' : 'Enregistrer'}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-body text-[11px] uppercase tracking-[0.15em] text-ivoire/40">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
