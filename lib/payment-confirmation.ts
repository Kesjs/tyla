import type { SupabaseClient } from '@supabase/supabase-js';
import { formatTicketCode } from '@/lib/geniuspay';
import { generateQrSecret } from '@/lib/qr-secret';
import { SecurityLogger } from '@/lib/security';

/**
 * Logique unique de confirmation de paiement : c'est LE seul endroit qui
 * décide "paiement = billets générés". Utilisée par :
 *  - /api/confirm-payment (retour navigateur après le checkout GeniusPay)
 *  - /api/webhook/geniuspay (notification serveur-à-serveur)
 *  - le réconciliateur planifié (/api/cron/reconcile-payments)
 *
 * Idempotente : si la commande est déjà "paid", retourne simplement les
 * billets existants sans rien recréer. Deux appels concurrents (ex: le
 * webhook et le retour navigateur arrivent en même temps) sont gérés par
 * la contrainte d'unicité sur order_id côté génération de billets — voir
 * la vérification `status === 'paid'` avant insertion.
 */

export type ConfirmationSource = 'callback' | 'webhook' | 'reconciliation';

interface ConfirmResult {
  outcome: 'already_paid' | 'confirmed' | 'failed' | 'error';
  tickets?: unknown[];
  error?: string;
}

/**
 * Marque une commande comme payée et génère ses billets, si ce n'est pas
 * déjà fait. `reference` et `rawResponse` proviennent de la source qui a
 * confirmé le paiement (GeniusPay verify API, ou payload webhook).
 */
export async function confirmOrderPaid(
  supabase: SupabaseClient,
  orderId: string,
  reference: string | null | undefined,
  rawResponse: unknown,
  source: ConfirmationSource
): Promise<ConfirmResult> {
  const { data: order, error: orderError } = await supabase
    .from('tyla_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return { outcome: 'error', error: 'Commande introuvable.' };
  }

  // Idempotence : déjà confirmée (par le chemin navigateur, le webhook, ou
  // une exécution précédente du réconciliateur) → on ne régénère rien.
  if (order.status === 'paid') {
    const { data: existingTickets } = await supabase
      .from('tyla_tickets')
      .select('*')
      .eq('order_id', orderId);
    return { outcome: 'already_paid', tickets: existingTickets ?? [] };
  }

  const { data: cat, error: catError } = await supabase
    .from('tyla_ticket_categories')
    .select('code_prefix, sold_count')
    .eq('id', order.category_id)
    .single();

  if (catError || !cat) {
    return { outcome: 'error', error: 'Catégorie de billet introuvable.' };
  }

  // Réserve atomiquement un bloc de N numéros consécutifs (évite toute
  // collision entre commandes simultanées ou entre sources concurrentes).
  const { data: startNumber, error: reserveError } = await supabase.rpc(
    'tyla_reserve_ticket_numbers',
    { p_category_id: order.category_id, p_count: order.quantity }
  );

  if (reserveError || startNumber === null) {
    SecurityLogger.log('payment_confirmation_reserve_failed', {
      orderId,
      source,
      error: reserveError?.message,
    });
    return { outcome: 'error', error: 'Erreur lors de la génération des billets.' };
  }

  const ticketsToInsert = Array.from({ length: order.quantity }).map((_, i) => {
    const ticketNumber = (startNumber as number) + i;
    return {
      order_id: order.id,
      category_id: order.category_id,
      ticket_number: ticketNumber,
      ticket_code: formatTicketCode(cat.code_prefix, ticketNumber),
      // Toujours généré ici (le webhook l'oubliait auparavant, ce qui
      // empêchait le scan QR de ces billets — seul le fallback manuel
      // fonctionnait pour eux).
      qr_secret: generateQrSecret(),
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
    };
  });

  const { data: tickets, error: ticketsError } = await supabase
    .from('tyla_tickets')
    .insert(ticketsToInsert)
    .select();

  if (ticketsError) {
    SecurityLogger.log('payment_confirmation_tickets_failed', {
      orderId,
      source,
      error: ticketsError.message,
    });
    return { outcome: 'error', error: 'Erreur lors de la génération des billets.' };
  }

  const { error: updateError } = await supabase
    .from('tyla_orders')
    .update({
      status: 'paid',
      payment_transaction_id: reference,
      payment_raw_response: rawResponse,
    })
    .eq('id', orderId);

  if (updateError) {
    SecurityLogger.log('payment_confirmation_order_update_failed', {
      orderId,
      source,
      error: updateError.message,
    });
    return { outcome: 'error', error: 'Billets générés mais échec de mise à jour de la commande.' };
  }

  await supabase
    .from('tyla_ticket_categories')
    .update({ sold_count: cat.sold_count + order.quantity })
    .eq('id', order.category_id);

  SecurityLogger.log('payment_confirmed', { orderId, reference, source, amount: order.total_amount });

  return { outcome: 'confirmed', tickets };
}

/**
 * Marque une commande comme échouée/annulée sans générer de billets.
 * N'écrase jamais une commande déjà "paid".
 */
export async function markOrderNotPaid(
  supabase: SupabaseClient,
  orderId: string,
  status: 'failed' | 'cancelled',
  reference: string | null | undefined,
  rawResponse: unknown,
  source: ConfirmationSource
): Promise<ConfirmResult> {
  const { data: order } = await supabase
    .from('tyla_orders')
    .select('status')
    .eq('id', orderId)
    .single();

  if (!order) {
    return { outcome: 'error', error: 'Commande introuvable.' };
  }

  if (order.status === 'paid') {
    // Ne jamais rétrograder une commande déjà payée (ex: un événement
    // "failed" tardif ou dupliqué qui arrive après une confirmation).
    return { outcome: 'already_paid' };
  }

  const { error } = await supabase
    .from('tyla_orders')
    .update({ status, payment_transaction_id: reference, payment_raw_response: rawResponse })
    .eq('id', orderId);

  if (error) {
    return { outcome: 'error', error: error.message };
  }

  SecurityLogger.log(`payment_${status}`, { orderId, reference, source });
  return { outcome: 'failed' };
}
