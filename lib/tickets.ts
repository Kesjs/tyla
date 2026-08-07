export type TicketCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  included_items: string | null;
  price_early_bird: number;
  price_normal: number;
  is_early_bird_active: boolean;
  quota_early_bird: number;
  quota_total: number;
  sold_count: number;
  display_order: number;
  active: boolean;
};

export type ContactInfo = {
  id: number;
  phone_1: string | null;
  phone_2: string | null;
  email: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
};

/** Prix effectif d'une catégorie : early bird tant qu'il reste des places dédiées, sinon tarif normal. */
export function effectivePrice(cat: TicketCategory): number {
  const earlyBirdRemaining = cat.quota_early_bird - Math.min(cat.sold_count, cat.quota_early_bird);
  if (cat.is_early_bird_active && earlyBirdRemaining > 0) {
    return cat.price_early_bird;
  }
  return cat.price_normal;
}

export function isEarlyBirdAvailable(cat: TicketCategory): boolean {
  const earlyBirdRemaining = cat.quota_early_bird - Math.min(cat.sold_count, cat.quota_early_bird);
  return cat.is_early_bird_active && earlyBirdRemaining > 0;
}

export function placesRemaining(cat: TicketCategory): number {
  return Math.max(cat.quota_total - cat.sold_count, 0);
}

export function formatFcfa(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}
