import Redis from 'ioredis';

// In-memory fallback if Redis is unavailable
const memoryCache = new Map<string, { value: string; expiresAt: number | null }>();

let redisClient: Redis | null = null;
let isRedisAvailable = false;
let hasLoggedFailure = false;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy(times) {
        if (times > 3) {
          if (!hasLoggedFailure) {
            console.warn('[Redis] Connexion impossible. Utilisation du cache mémoire en fallback.');
            hasLoggedFailure = true;
          }
          return null; // Stop retrying
        }
        return Math.min(times * 200, 1000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      hasLoggedFailure = false;
      console.log('[Redis] Connecté avec succès.');
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      if (!hasLoggedFailure) {
        console.warn('[Redis] Avertissement de connexion:', err.message);
        hasLoggedFailure = true;
      }
    });

    // Attempt connection non-blocking
    redisClient.connect().catch(() => {
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (err) {
    isRedisAvailable = false;
    return null;
  }
}

/**
 * Récupère une valeur du cache (Redis ou fallback mémoire)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();

  if (isRedisAvailable && client) {
    try {
      const data = await client.get(key);
      if (data) return JSON.parse(data) as T;
    } catch {
      // Fallback vers mémoire
    }
  }

  // Fallback mémoire
  const item = memoryCache.get(key);
  if (item) {
    if (item.expiresAt && Date.now() > item.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    try {
      return JSON.parse(item.value) as T;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Stocke une valeur dans le cache
 * @param key Clé
 * @param value Valeur (sérialisée en JSON)
 * @param ttlSeconds Durée de vie en secondes (défaut: 300s / 5min)
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 300
): Promise<boolean> {
  const serialized = JSON.stringify(value);
  const client = getRedisClient();

  if (isRedisAvailable && client) {
    try {
      await client.set(key, serialized, 'EX', ttlSeconds);
      return true;
    } catch {
      // Fallback mémoire
    }
  }

  // Stocker dans le cache mémoire
  const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
  memoryCache.set(key, { value: serialized, expiresAt });
  return true;
}

/**
 * Supprime une clé du cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  const client = getRedisClient();

  if (isRedisAvailable && client) {
    try {
      await client.del(key);
    } catch {}
  }

  memoryCache.delete(key);
  return true;
}

/**
 * Vide le cache
 */
export async function flushCache(): Promise<boolean> {
  const client = getRedisClient();

  if (isRedisAvailable && client) {
    try {
      await client.flushdb();
    } catch {}
  }

  memoryCache.clear();
  return true;
}
