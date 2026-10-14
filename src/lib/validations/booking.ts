/**
 * src/lib/validations/booking.ts
 * Schéma Zod de validation des réservations côté serveur
 */
import { z } from 'zod';

export const createBookingSchema = z.object({
  trip_id: z.string().min(1, 'L’identifiant du trajet est obligatoire.'),
  seat_id: z.string().min(1, 'L’identifiant du siège est obligatoire.'),
  passenger_first_name: z
    .string()
    .min(2, 'Le prénom doit comporter au moins 2 caractères.')
    .max(50, 'Le prénom ne peut excéder 50 caractères.')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le prénom contient des caractères non autorisés.'),
  passenger_last_name: z
    .string()
    .min(2, 'Le nom doit comporter au moins 2 caractères.')
    .max(50, 'Le nom ne peut excéder 50 caractères.')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom contient des caractères non autorisés.'),
  passenger_phone: z
    .string()
    .min(8, 'Le numéro de téléphone est invalide.')
    .max(15, 'Le numéro de téléphone est trop long.')
    .regex(/^(\+?229)?[0-9]{8,10}$/, 'Format de téléphone béninois invalide (ex: 97123456 ou +2290197123456).'),
  passenger_email: z.string().email('Format d’adresse email invalide.').optional().nullable(),
  has_baggage: z.boolean().default(false),
  is_flexible: z.boolean().default(true),
  total_price: z.number().positive('Le prix total doit être un montant positif supérieur à 0.'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
