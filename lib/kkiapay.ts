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

/** Génère un code de billet unique, lisible, difficile à deviner. */
export function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans caractères ambigus
  let code = 'JAF-';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
