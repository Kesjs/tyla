import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyGeniusPayTransaction } from '@/lib/geniuspay';
import { confirmOrderPaid, markOrderNotPaid } from '@/lib/payment-confirmation';
import { SecurityLogger } from '@/lib/security';

/**
 * Filet de sécurité en cas d'échec du retour navigateur ET du webhook
 * GeniusPay (voir les deux autres points d'entrée dans
 * lib/payment-confirmation.ts) : repasse périodiquement sur les commandes
 * "pending" trop anciennes et republie leur vrai statut auprès de
 * GeniusPay via `verifyGeniusPayTransaction`.
 *
 * Déclenché par Vercel Cron (voir vercel.json). Vercel ajoute
 * automatiquement `Authorization: Bearer $CRON_SECRET` aux requêtes de cron
 * quand la variable d'env CRON_SECRET est configurée sur le projet — c'est
 * cette valeur qu'on vérifie ci-dessous. Reste appelable manuellement
 * (ex: depuis un poste admin) avec le même header.
 *
 * On ne laisse volontairement aucune commande de plus de
 * PENDING_MAX_AGE_MINUTES sans nouvelle tentative de vérification, même si
 * une exécution précédente a déjà essayé et échoué (ex: erreur réseau
 * ponctuelle côté GeniusPay) — au pire ça revérifie une commande qui reste
 * légitimement "pending" (en cours côté Mobile Money).
 */

const PENDING_MAX_AGE_MINUTES = 15;
const AUTO_CANCEL_MINUTES = 3; // Annuler automatiquement après 3 minutes si toujours pending
const MAX_ORDERS_PER_RUN = 50;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Pas de secret configuré = endpoint non protégé. On refuse plutôt que
    // de tourner en clair sur un endpoint qui écrit en base.
    return false;
  }
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - PENDING_MAX_AGE_MINUTES * 60 * 1000).toISOString();

  const { data: staleOrders, error: fetchError } = await supabase
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
        const result = await confirmOrderPaid(supabase, order.id, reference, verification, 'reconciliation');
        if (result.outcome === 'error') {
          results.errors.push({ orderId: order.id, error: result.error ?? 'Erreur inconnue.' });
        } else {
          results.confirmed.push(order.id);
        }
      } else if (remoteStatus === 'failed' || remoteStatus === 'cancelled' || remoteStatus === 'refunded') {
        await markOrderNotPaid(
          supabase,
          order.id,
          remoteStatus === 'refunded' ? 'cancelled' : remoteStatus,
          reference,
          verification,
          'reconciliation'
        );
        results.failed.push(order.id);
      } else {
        // Toujours 'pending' ou 'processing' côté GeniusPay
        // Si la commande est en pending depuis plus de AUTO_CANCEL_MINUTES, on l'annule automatiquement
        if (orderAgeMinutes > AUTO_CANCEL_MINUTES) {
          await markOrderNotPaid(
            supabase,
            order.id,
            'cancelled',
            reference,
            { reason: 'Auto-cancelled after timeout', age: orderAgeMinutes },
            'reconciliation'
          );
          results.autoCancelled.push(order.id);
        } else {
          // On la laisse pour la prochaine exécution
          results.stillPending.push(order.id);
        }
      }
    } catch (err) {
      // Erreur réseau/API GeniusPay pour cette commande : on continue avec
      // les suivantes plutôt que d'abandonner tout le batch.
      results.errors.push({
        orderId: order.id,
        error: err instanceof Error ? err.message : 'Erreur inconnue.',
      });
    }
  }

  SecurityLogger.log('reconcile_run_completed', results);

  return NextResponse.json(results);
}
