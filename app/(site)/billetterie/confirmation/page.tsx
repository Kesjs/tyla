import { createAdminClient } from '@/lib/supabase/admin';
import { TicketCard } from '@/components/billetterie/TicketCard';
import { Reveal } from '@/components/Reveal';

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

  return (
    <section className="min-h-screen bg-noir px-6 pb-32 pt-40 md:px-10 md:pt-48">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-or">Paiement confirmé</p>
          <h1 className="mt-5 font-display text-3xl font-semibold text-ivoire sm:text-4xl">
            Vos billets sont prêts.
          </h1>
          <p className="mt-4 font-body text-sm text-ivoire/60">
            Présentez le QR code de chaque billet à l&apos;entrée le 24 octobre 2026.
            Faites une capture d&apos;écran ou téléchargez-les.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-14 flex max-w-md flex-col gap-6">
        {tickets.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.1}>
            <TicketCard
              ticketCode={t.ticket_code}
              categoryName={order.tyla_ticket_categories?.name ?? ''}
              buyerName={t.buyer_name}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
