import { createClient } from '@/lib/supabase/server';
import { formatFcfa, placesRemaining, type TicketCategory } from '@/lib/tickets';
import { TrendingUp, Ticket, Users, Wallet } from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from('tyla_ticket_categories')
    .select('*')
    .order('display_order', { ascending: true });

  const { data: paidOrders } = await supabase
    .from('tyla_orders')
    .select('total_amount, quantity')
    .eq('status', 'paid');

  const cats = (categories ?? []) as TicketCategory[];
  const totalRevenue = (paidOrders ?? []).reduce((sum, o) => sum + o.total_amount, 0);
  const totalSold = (paidOrders ?? []).reduce((sum, o) => sum + o.quantity, 0);
  const totalQuota = cats.reduce((sum, c) => sum + c.quota_total, 0);
  const totalRemaining = cats.reduce((sum, c) => sum + placesRemaining(c), 0);

  const stats = [
    { label: 'Revenu total', value: formatFcfa(totalRevenue), icon: Wallet },
    { label: 'Billets vendus', value: `${totalSold} / ${totalQuota}`, icon: Ticket },
    { label: 'Places restantes', value: String(totalRemaining), icon: Users },
    { label: 'Taux de remplissage', value: totalQuota ? `${Math.round((totalSold / totalQuota) * 100)}%` : '0%', icon: TrendingUp },
  ];

  return (
    <div>
      <p className="font-body text-xs uppercase tracking-[0.3em] text-or">Dashboard</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ivoire">Vue d&apos;ensemble</h1>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-taupe/30 p-6">
            <s.icon className="text-or" size={20} />
            <p className="mt-4 font-display text-2xl font-semibold text-ivoire">{s.value}</p>
            <p className="mt-1 font-body text-xs uppercase tracking-[0.15em] text-ivoire/50">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="font-display text-xl font-semibold text-ivoire">Par catégorie</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse font-body text-sm">
            <thead>
              <tr className="border-b border-taupe/30 text-left text-ivoire/50">
                <th className="pb-3 font-normal uppercase tracking-[0.1em]">Catégorie</th>
                <th className="pb-3 font-normal uppercase tracking-[0.1em]">Vendus</th>
                <th className="pb-3 font-normal uppercase tracking-[0.1em]">Quota</th>
                <th className="pb-3 font-normal uppercase tracking-[0.1em]">Restant</th>
                <th className="pb-3 font-normal uppercase tracking-[0.1em]">Early Bird</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id} className="border-b border-taupe/10 text-ivoire/80">
                  <td className="py-3">{c.name}</td>
                  <td className="py-3">{c.sold_count}</td>
                  <td className="py-3">{c.quota_total}</td>
                  <td className="py-3">{placesRemaining(c)}</td>
                  <td className="py-3">
                    <span className={`text-xs ${c.is_early_bird_active && c.sold_count < c.quota_early_bird ? 'text-or' : 'text-ivoire/30'}`}>
                      {c.is_early_bird_active && c.sold_count < c.quota_early_bird ? 'Actif' : 'Terminé'}
                    </span>
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
