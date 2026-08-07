import { createClient } from '@/lib/supabase/server';
import { BilletsManager } from '@/components/admin/BilletsManager';
import type { TicketCategory } from '@/lib/tickets';

export const revalidate = 0;

export default async function AdminBilletsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('tyla_ticket_categories')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <div>
      <p className="font-body text-xs uppercase tracking-[0.3em] text-or">Gestion</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ivoire">Catégories de billets</h1>
      <p className="mt-2 font-body text-sm text-ivoire/50">
        Modifiez les prix, quotas et statut Early Bird. Les changements sont visibles immédiatement sur le site.
      </p>

      <div className="mt-10">
        <BilletsManager initialCategories={(data ?? []) as TicketCategory[]} />
      </div>
    </div>
  );
}
