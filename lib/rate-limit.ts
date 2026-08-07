/**
 * Rate limiting simple en mémoire pour protéger contre les abus
 * En production, utiliser Redis ou un service dédié
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  
  /**
   * Vérifie si une IP/identifiant a dépassé la limite autorisée
   * @param identifier - IP address ou unique identifier
   * @param limit - Nombre maximal de requêtes
   * @param windowMs - Fenêtre de temps en millisecondes
   */
  check(identifier: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);
    
    // Nettoyer les entrées expirées
    if (entry && entry.resetTime < now) {
      this.store.delete(identifier);
    }
    
    const currentEntry = this.store.get(identifier) || { count: 0, resetTime: now + windowMs };
    
    if (currentEntry.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: currentEntry.resetTime,
      };
    }
    
    // Incrémenter le compteur
    currentEntry.count++;
    this.store.set(identifier, currentEntry);
    
    return {
      allowed: true,
      remaining: limit - currentEntry.count,
      resetTime: currentEntry.resetTime,
    };
  }
  
  /**
   * Réinitialise le compteur pour un identifiant
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }
  
  /**
   * Nettoie toutes les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
}

// Instance singleton
export const rateLimiter = new RateLimiter();

// Nettoyer périodiquement les entrées expirées
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 60000); // Toutes les minutes
}

/**
 * Configuration des limites par endpoint
 */
export const RATE_LIMITS = {
  // API de recherche de billets : 10 requêtes/minute
  lookupTickets: { limit: 10, windowMs: 60 * 1000 },
  
  // API de création de commande : 5 commandes/minute
  checkout: { limit: 5, windowMs: 60 * 1000 },
  
  // API de confirmation paiement : 20 requêtes/minute
  confirmPayment: { limit: 20, windowMs: 60 * 1000 },
  
  // API check-in : 30 requêtes/minute
  checkin: { limit: 30, windowMs: 60 * 1000 },
  
  // Login admin : 5 tentatives/15 minutes
  adminLogin: { limit: 5, windowMs: 15 * 60 * 1000 },
} as const;

/**
 * Extrait l'IP de la requête (prend en compte les proxies)
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}