import { createClient } from '@/lib/supabase/server';
import { CheckinPanel } from '@/components/admin/CheckinPanel';
import { formatFcfa } from '@/lib/tickets';

export const revalidate = 0;

export default async function AdminCommandesPage() {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from('tyla_orders')
    .select('*, tyla_ticket_categories(name)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <p className="font-body text-xs uppercase tracking-[0.3em] text-or">Gestion</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ivoire">Commandes &amp; Check-in</h1>

      <div className="mt-10">
        <CheckinPanel />
      </div>

      <div className="mt-12">
        <h2 className="font-display text-lg font-semibold text-ivoire">Dernières commandes</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse font-body text-sm">
            <thead>
              <tr className="border-b border-taupe/30 text-left text-ivoire/50">
                <th className="pb-3 font-normal uppercase tracking-[0.1em]">Acheteur</th>
                <th className="pb-3 font-normal uppercase tracking-[0.1em]">Catégorie</th>
                <th className="pb-3 font-normal uppercase tracking-[0.1em]">Qté</th>
                <th className="pb-3 font-normal uppercase tracking-[0.1em]">Montant</th>
                <th className="pb-3 font-normal uppercase tracking-[0.1em]">Statut</th>
                <th className="pb-3 font-normal uppercase tracking-[0.1em]">Date</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((o: any) => (
                <tr key={o.id} className="border-b border-taupe/10 text-ivoire/80">
                  <td className="py-3">
                    <p>{o.buyer_name}</p>
                    <p className="text-xs text-ivoire/40">{o.buyer_phone}</p>
                  </td>
                  <td className="py-3">{o.tyla_ticket_categories?.name}</td>
                  <td className="py-3">{o.quantity}</td>
                  <td className="py-3">{formatFcfa(o.total_amount)}</td>
                  <td className="py-3">
                    <span
                      className={
                        o.status === 'paid'
                          ? 'text-or'
                          : o.status === 'pending'
                          ? 'text-ivoire/40'
                          : 'text-porto-light'
                      }
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-ivoire/40">
                    {new Date(o.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
