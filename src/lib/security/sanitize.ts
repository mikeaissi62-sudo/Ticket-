/**
 * src/lib/security/sanitize.ts
 * Utilitaires d'assainissement des entrées utilisateurs (XSS, injections, caractères suspects)
 */

/**
 * Nettoie une chaîne de texte en supprimant les balises HTML et les scripts potentiellement malveillants
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    // Supprimer les balises HTML/XML
    .replace(/<[^>]*>?/gm, '')
    // Remplacer les caractères dangereux
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Nettoie une chaîne sans échappement HTML agressif pour les champs de texte simples (ex: noms, prénoms)
 */
export function sanitizePlainText(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/<[^>]*>?/gm, '') // Supprime les balises <script>, etc.
    .replace(/[<>'"`;]/g, '')  // Supprime les caractères d'injection directs
    .slice(0, 500);            // Évite les attaques par déni de service de taille
}

/**
 * Nettoie et normalise un numéro de téléphone béninois
 */
export function sanitizeBeninPhone(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Ne garder que les chiffres
  const digits = input.replace(/\D/g, '');

  // Format 229XXXXXXXX
  if (digits.startsWith('229') && digits.length === 11) {
    return digits;
  }

  // Format local à 8 chiffres (ex: 97123456)
  if (digits.length === 8) {
    return `229${digits}`;
  }

  // Format avec préfixe 01 (ex: 0197123456 -> 10 chiffres)
  if (digits.length === 10 && digits.startsWith('01')) {
    return `229${digits.slice(2)}`;
  }

  return digits;
}

/**
 * Nettoie récursivement un objet de données
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}
