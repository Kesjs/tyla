import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyGeniusPayTransaction } from '@/lib/geniuspay';
import { confirmOrderPaid, markOrderNotPaid } from '@/lib/payment-confirmation';
import { SecurityLogger } from '@/lib/security';

const AUTO_CANCEL_MINUTES = 3;
const MAX_ORDERS_PER_RUN = 50;

export async function POST(req: NextRequest) {
  // Vérifier que l'utilisateur est authentifié comme admin
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Vérifier que l'utilisateur est autorisé
  const authorizedEmails = ['ken2001babatounde@gmail.com', 'eunice@tylafrica.com'];
  if (!authorizedEmails.includes(user.email || '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  // Utiliser le client admin pour les opérations de base de données
  const adminSupabase = createAdminClient();
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { data: staleOrders, error: fetchError } = await adminSupabase
    .from('tyla_orders')
    .select('id, payment_transaction_id, created_at')
    .eq('status', 'pending')
    .not('payment_transaction_id', 'is', null)
    .lt('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(MAX_ORDERS_PER_RUN);

  if (fetchError) {
    SecurityLogger.log('reconcile_fetch_failed', { error: fetchError.message });
    return NextResponse.json({ error: 'Erreur lors de la récupération des commandes.' }, { status: 500 });
  }

  const results = {
    checked: staleOrders?.length ?? 0,
    confirmed: [] as string[],
    failed: [] as string[],
    stillPending: [] as string[],
    autoCancelled: [] as string[],
    errors: [] as { orderId: string; error: string }[],
  };

  for (const order of staleOrders ?? []) {
    const reference = order.payment_transaction_id as string;
    const orderAge = Date.now() - new Date(order.created_at).getTime();
    const orderAgeMinutes = orderAge / (60 * 1000);
    
    try {
      const verification = await verifyGeniusPayTransaction(reference);
      const remoteStatus = verification.data?.status;

      if (remoteStatus === 'completed') {
        const result = await confirmOrderPaid(adminSupabase, order.id, reference, verification, 'reconciliation');
        if (result.outcome === 'error') {
          results.errors.push({ orderId: order.id, error: result.error ?? 'Erreur inconnue.' });
        } else {
          results.confirmed.push(order.id);
        }
      } else if (remoteStatus === 'failed' || remoteStatus === 'cancelled' || remoteStatus === 'refunded') {
        await markOrderNotPaid(
          adminSupabase,
          order.id,
          remoteStatus === 'refunded' ? 'cancelled' : remoteStatus,
          reference,
          verification,
          'reconciliation'
        );
        results.failed.push(order.id);
      } else {
        if (orderAgeMinutes > AUTO_CANCEL_MINUTES) {
          await markOrderNotPaid(
            adminSupabase,
            order.id,
            'cancelled',
            reference,
            { reason: 'Auto-cancelled after timeout', age: orderAgeMinutes },
            'reconciliation'
          );
          results.autoCancelled.push(order.id);
        } else {
          results.stillPending.push(order.id);
        }
      }
    } catch (err) {
      results.errors.push({
        orderId: order.id,
        error: err instanceof Error ? err.message : 'Erreur inconnue.',
      });
    }
  }

  SecurityLogger.log('admin_reconcile_run_completed', { userEmail: user.email, ...results });

  return NextResponse.json(results);
}