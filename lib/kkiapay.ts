/**
 * Vérifie une transaction Kkiapay auprès de leur API.
 * Doc : https://docs.kkiapay.me/v1/utilisation-des-api/verifier-une-transaction
 */
export async function verifyKkiapayTransaction(transactionId: string) {
  const res = await fetch('https://api.kkiapay.me/api/v1/transactions/status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY ?? '',
      'x-private-key': process.env.KKIAPAY_PRIVATE_KEY ?? '',
      'x-secret-key': process.env.KKIAPAY_SECRET ?? '',
    },
    body: JSON.stringify({ transactionId }),
  });

  if (!res.ok) {
    throw new Error(`Kkiapay verification failed with status ${res.status}`);
  }

  const data = await res.json();
  // data.status attendu: "SUCCESS" | "FAILED" | "PENDING"
  return data as { status: string; amount?: number; [key: string]: unknown };
}

/**
 * Formate le code d'un billet à partir du préfixe de la catégorie et de son
 * numéro séquentiel dans le segment qui lui est réservé.
 * Ex: catégorie "VIP" (préfixe) + numéro 7 → "JAF-VIP-0007"
 */
export function formatTicketCode(prefix: string, ticketNumber: number): string {
  const padded = String(ticketNumber).padStart(4, '0');
  return `JAF-${prefix}-${padded}`;
}
