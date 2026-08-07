/**
 * Utilitaires de sécurité pour validation et sanitization
 */

/**
 * Valide un email avec regex stricte
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Sanitize une chaîne contre XSS (échappe les caractères HTML dangereux)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valide et sanitize un nom (lettres, espaces, tirets, apostrophes)
 */
export function validateAndSanitizeName(name: string): { valid: boolean; sanitized: string } {
  const trimmed = name.trim();
  // Accepte les lettres (incluant accents), espaces, tirets, apostrophes
  const nameRegex = /^[a-zA-Zà-ÿÀ-Ÿ\s\-']+$/;
  
  if (trimmed.length < 2 || trimmed.length > 100) {
    return { valid: false, sanitized: '' };
  }
  
  if (!nameRegex.test(trimmed)) {
    return { valid: false, sanitized: '' };
  }
  
  return { valid: true, sanitized: sanitizeString(trimmed) };
}

/**
 * Valide un numéro de téléphone béninois (8 chiffres après l'indicatif)
 */
export function validateBeninPhone(phone: string): { valid: boolean; error: string } {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 0) {
    return { valid: false, error: 'Merci de renseigner votre numéro Mobile Money.' };
  }
  
  if (digitsOnly.length < 8) {
    return { valid: false, error: `Numéro incomplet — il manque ${8 - digitsOnly.length} chiffre(s).` };
  }
  
  if (digitsOnly.length > 8) {
    return { valid: false, error: 'Numéro trop long — seuls 8 chiffres sont attendus après +229.' };
  }
  
  return { valid: true, error: '' };
}

/**
 * Logger structuré pour le suivi des événements de sécurité
 */
export class SecurityLogger {
  static log(event: string, details: Record<string, unknown>) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      ...details,
    };
    
    // En production, envoyer vers un service de logging (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      console.error('[SECURITY]', JSON.stringify(logEntry));
    } else {
      console.log('[SECURITY]', logEntry);
    }
  }
  
  static logSuspiciousActivity(type: string, ip: string, details: Record<string, unknown>) {
    this.log('SUSPICIOUS_ACTIVITY', { type, ip, ...details });
  }
  
  static logAuthAttempt(email: string, success: boolean, ip: string) {
    this.log('AUTH_ATTEMPT', { email, success, ip });
  }
  
  static logApiCall(endpoint: string, method: string, ip: string, success: boolean) {
    this.log('API_CALL', { endpoint, method, ip, success });
  }
}