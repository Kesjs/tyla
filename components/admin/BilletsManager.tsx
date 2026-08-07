'use client';

import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { TicketCategory } from '@/lib/tickets';

export function BilletsManager({ initialCategories }: { initialCategories: TicketCategory[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  function updateField(id: string, field: keyof TicketCategory, value: any) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  async function saveCategory(cat: TicketCategory) {
    setSavingId(cat.id);
    const supabase = createClient();

    const payload: Record<string, any> = {
      name: cat.name,
      description: cat.description,
      included_items: cat.included_items,
      price_early_bird: cat.price_early_bird,
      price_normal: cat.price_normal,
      quota_early_bird: cat.quota_early_bird,
      quota_total: cat.quota_total,
      is_early_bird_active: cat.is_early_bird_active,
      active: cat.active,
      display_order: cat.display_order,
      code_prefix: cat.code_prefix,
      segment_start: cat.segment_start,
      updated_at: new Date().toISOString(),
    };

    // Si aucun billet n'a encore été vendu dans cette catégorie, on peut
    // aligner le compteur sur le nouveau départ de segment sans risque de
    // doublon. Si des billets existent déjà, on ne touche pas au compteur
    // pour ne jamais réattribuer un numéro déjà émis.
    if (cat.sold_count === 0) {
      payload.next_ticket_number = cat.segment_start;
    }

    await supabase.from('tyla_ticket_categories').update(payload).eq('id', cat.id);
    setSavingId(null);
    router.refresh();
  }

  async function deleteCategory(id: string) {
    if (!confirm('Supprimer définitivement cette catégorie de billet ?')) return;
    const supabase = createClient();
    await supabase.from('tyla_ticket_categories').delete().eq('id', id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function createCategory() {
    setCreating(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('tyla_ticket_categories')
      .insert({
        name: 'Nouvelle catégorie',
        slug: `categorie-${Date.now()}`,
        price_early_bird: 0,
        price_normal: 0,
        quota_early_bird: 0,
        quota_total: 0,
        display_order: categories.length + 1,
        code_prefix: 'NEW',
        segment_start: 9000,
        next_ticket_number: 9000,
      })
      .select()
      .single();
    if (data) setCategories((prev) => [...prev, data as TicketCategory]);
    setCreating(false);
  }

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <div key={cat.id} className="border border-taupe/30 p-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nom">
              <input
                value={cat.name}
                onChange={(e) => updateField(cat.id, 'name', e.target.value)}
                className="w-full border-b border-taupe bg-transparent py-2 font-body text-ivoire outline-none focus:border-or"
              />
            </Field>
            <Field label="Prix Early Bird (FCFA)">
              <input
                type="number"
                value={cat.price_early_bird}
                onChange={(e) => updateField(cat.id, 'price_early_bird', Number(e.target.value))}
                className="w-full border-b border-taupe bg-transparent py-2 font-body text-ivoire outline-none focus:border-or"
              />
            </Field>
            <Field label="Prix normal (FCFA)">
              <input
                type="number"
                value={cat.price_normal}
                onChange={(e) => updateField(cat.id, 'price_normal', Number(e.target.value))}
                className="w-full border-b border-taupe bg-transparent py-2 font-body text-ivoire outline-none focus:border-or"
              />
            </Field>
            <Field label="Quota Early Bird">
              <input
                type="number"
                value={cat.quota_early_bird}
                onChange={(e) => updateField(cat.id, 'quota_early_bird', Number(e.target.value))}
                className="w-full border-b border-taupe bg-transparent py-2 font-body text-ivoire outline-none focus:border-or"
              />
            </Field>
            <Field label="Quota total">
              <input
                type="number"
                value={cat.quota_total}
                onChange={(e) => updateField(cat.id, 'quota_total', Number(e.target.value))}
                className="w-full border-b border-taupe bg-transparent py-2 font-body text-ivoire outline-none focus:border-or"
              />
            </Field>
            <Field label="Déjà vendus (lecture seule)">
              <p className="border-b border-transparent py-2 font-body text-ivoire/50">{cat.sold_count}</p>
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Inclus (texte libre)">
              <input
                value={cat.included_items ?? ''}
                onChange={(e) => updateField(cat.id, 'included_items', e.target.value)}
                className="w-full border-b border-taupe bg-transparent py-2 font-body text-ivoire outline-none focus:border-or"
              />
            </Field>
          </div>

          <div className="mt-5 border-t border-taupe/20 pt-5">
            <p className="font-body text-[11px] uppercase tracking-[0.15em] text-or/70">
              Numérotation des billets (segment dédié, sans chevauchement entre catégories)
            </p>
            <div className="mt-3 grid gap-5 sm:grid-cols-3">
              <Field label="Préfixe (ex: VIP, GLD)">
                <input
                  value={cat.code_prefix}
                  onChange={(e) => updateField(cat.id, 'code_prefix', e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full border-b border-taupe bg-transparent py-2 font-body uppercase text-ivoire outline-none focus:border-or"
                />
              </Field>
              <Field label="Numéro de départ du segment">
                <input
                  type="number"
                  value={cat.segment_start}
                  onChange={(e) => updateField(cat.id, 'segment_start', Number(e.target.value))}
                  className="w-full border-b border-taupe bg-transparent py-2 font-body text-ivoire outline-none focus:border-or"
                />
              </Field>
              <Field label="Prochain numéro à attribuer (lecture seule)">
                <p className="border-b border-transparent py-2 font-body text-ivoire/50">
                  {cat.next_ticket_number}
                </p>
              </Field>
            </div>
            <p className="mt-2 font-body text-[11px] text-ivoire/40">
              Ex : {cat.code_prefix || 'PREFIX'}-{String(cat.segment_start).padStart(4, '0')} sera le premier billet de cette catégorie.
              Laissez un écart suffisant entre le départ de chaque catégorie (ex : 1, 101, 301, 601…) pour qu&apos;aucun segment ne chevauche un autre.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 font-body text-xs text-ivoire/70">
              <input
                type="checkbox"
                checked={cat.is_early_bird_active}
                onChange={(e) => updateField(cat.id, 'is_early_bird_active', e.target.checked)}
              />
              Early Bird actif
            </label>
            <label className="flex items-center gap-2 font-body text-xs text-ivoire/70">
              <input
                type="checkbox"
                checked={cat.active}
                onChange={(e) => updateField(cat.id, 'active', e.target.checked)}
              />
              Catégorie visible sur le site
            </label>

            <div className="ml-auto flex gap-3">
              <button
                onClick={() => saveCategory(cat)}
                disabled={savingId === cat.id}
                className="flex items-center gap-2 border border-or px-4 py-2 font-body text-xs uppercase tracking-[0.15em] text-or transition-colors hover:bg-or hover:text-noir disabled:opacity-50"
              >
                <Save size={14} />
                {savingId === cat.id ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="flex items-center gap-2 border border-porto px-4 py-2 font-body text-xs uppercase tracking-[0.15em] text-porto-light transition-colors hover:bg-porto hover:text-ivoire"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={createCategory}
        disabled={creating}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-taupe py-5 font-body text-xs uppercase tracking-[0.2em] text-ivoire/60 transition-colors hover:border-or hover:text-or"
      >
        <Plus size={16} />
        {creating ? 'Création...' : 'Ajouter une catégorie de billet'}
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
