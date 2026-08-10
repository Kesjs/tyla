import { createAdminClient } from '@/lib/supabase/admin';
import { ConfirmationContent } from '@/components/billetterie/TicketCard';

export const revalidate = 0;

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const orderId = searchParams.order;

  if (!orderId) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-noir pt-24 text-center">
        <p className="font-body text-ivoire/60">Commande introuvable.</p>
      </section>
    );
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from('tyla_orders')
    .select('*, tyla_ticket_categories(name)')
    .eq('id', orderId)
    .single();

  const { data: tickets } = await supabase
    .from('tyla_tickets')
    .select('*')
    .eq('order_id', orderId);

  if (!order || order.status !== 'paid' || !tickets || tickets.length === 0) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-noir px-6 pt-24 text-center">
        <p className="font-display text-xl text-ivoire">Paiement non confirmé</p>
        <p className="mt-3 max-w-sm font-body text-sm text-ivoire/50">
          Si vous venez de payer, patientez quelques instants et rafraîchissez
          la page. Sinon, contactez benin@tylafrica.com avec votre référence
          {' '}{orderId}.
        </p>
      </section>
    );
  }

  // Préparer les données des billets
  const ticketData = tickets.map((t) => ({
    id: t.id,
    ticketCode: t.ticket_code,
    categoryName: order.tyla_ticket_categories?.name ?? 'BILLET',
    buyerName: t.buyer_name,
  }));

  return <ConfirmationContent tickets={ticketData} />;
}
