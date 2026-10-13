/**
 * src/lib/validations/contact.ts
 * Schéma Zod de validation du formulaire de contact et assistance
 */
import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Votre nom complet doit comporter au moins 2 caractères.')
    .max(80, 'Nom trop long.')
    .regex(/^[\p{L}\s\-']+$/u, 'Le nom contient des caractères non autorisés.'),
  email: z.string().email('Adresse email invalide.'),
  phone: z
    .string()
    .min(8, 'Numéro de téléphone invalide.')
    .max(16, 'Numéro de téléphone trop long.')
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .min(3, 'Le sujet doit contenir au moins 3 caractères.')
    .max(120, 'Le sujet ne peut dépasser 120 caractères.'),
  message: z
    .string()
    .min(10, 'Votre message doit contenir au moins 10 caractères.')
    .max(2000, 'Message trop long (maximum 2000 caractères).'),
});

export type ContactInput = z.infer<typeof contactSchema>;
