/**
 * src/lib/security/rateLimit.ts
 * Rate limiter en mémoire avec fenêtre glissante (Sliding Window)
 * Conçu pour protéger les routes sensibles (Authentification OTP, Initiation de paiement, Contact)
 */

interface RateLimitRecord {
  timestamps: number[];
}

// Magasin en mémoire pour stocker les requêtes par clé (IP ou identifiant)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Nettoyage régulier des entrées expirées toutes les 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      // Si la dernière requête date de plus de 10 minutes, supprimer la clé
      if (record.timestamps.length === 0 || now - record.timestamps[record.timestamps.length - 1] > 600000) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitOptions {
  /** Nombre maximum de requêtes autorisées dans la fenêtre */
  limit: number;
  /** Durée de la fenêtre en secondes (défaut : 60s) */
  windowSeconds?: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Vérifie si une requête dépasse la limite autorisée
 * @param identifier Identifiant unique du client (adresse IP, numéro de téléphone, userId)
 * @param options Paramètres de restriction (limite et durée de la fenêtre)
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 10, windowSeconds: 60 }
): RateLimitResult {
  const windowMs = (options.windowSeconds || 60) * 1000;
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitStore.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filtrer pour ne garder que les timestamps dans la fenêtre active
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.limit) {
    const oldest = record.timestamps[0];
    const resetTime = Math.ceil((oldest + windowMs - now) / 1000);

    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: Math.max(1, resetTime),
    };
  }

  // Ajouter la requête actuelle
  record.timestamps.push(now);

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.timestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}

/**
 * Récupère l'IP du client depuis les headers de la requête NextRequest
 */
export function getClientIp(headers: Headers): string {
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }

  return '127.0.0.1';
}

/**
 * Préréglages recommandés pour Ticket+
 */
export const RateLimitPresets = {
  /** Paiements Mobile Money : 5 requêtes par minute par IP/téléphone */
  PAYMENT_INITIATE: { limit: 5, windowSeconds: 60 },
  /** Envoi de code OTP / SMS : 3 requêtes par 2 minutes */
  PHONE_OTP: { limit: 3, windowSeconds: 120 },
  /** Formulaire de contact : 5 requêtes par minute */
  CONTACT: { limit: 5, windowSeconds: 60 },
  /** Consultation API générale : 60 requêtes par minute */
  PUBLIC_API: { limit: 60, windowSeconds: 60 },
};
