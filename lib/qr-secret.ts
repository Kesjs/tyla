import { randomBytes } from 'crypto';

/**
 * Génère un secret aléatoire haute entropie (192 bits) pour un billet.
 * C'est CE secret qui est encodé dans le QR code — jamais le ticket_code
 * (lisible, séquentiel, donc devinable en JAF-VIP-0001, 0002, ...).
 *
 * ⚠️ Server-only : ce fichier importe le module Node `crypto` et ne doit
 * JAMAIS être importé depuis un composant client (uniquement depuis des
 * route handlers / server actions).
 */
export function generateQrSecret(): string {
  return randomBytes(24).toString('base64url'); // 24 octets = 192 bits, ~32 caractères URL-safe
}
