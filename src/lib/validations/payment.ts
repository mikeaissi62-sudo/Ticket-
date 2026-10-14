/**
 * src/lib/validations/payment.ts
 * Schéma Zod de validation des transactions et remboursements
 */
import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  booking_id: z.string().min(1, 'La réservation ou sa référence est obligatoire.'),
  booking_reference: z.string().optional(),
  provider: z.enum(['mtn_momo', 'moov_money', 'card']),
  phone: z
    .string()
    .min(8, 'Le numéro de téléphone est obligatoire.')
    .max(16, 'Numéro de téléphone trop long.')
    .regex(/^(\+?229)?[0-9]{8,10}$/, 'Numéro Mobile Money béninois invalide.'),
  amount: z.number().positive('Le montant doit être un nombre positif.').optional(),
  otp: z.string().length(4, 'Le code OTP Moov doit contenir 4 chiffres.').regex(/^[0-9]+$/).optional(),
});

export const refundPaymentSchema = z.object({
  booking_reference: z.string().optional(),
  booking_id: z.string().optional(),
  reason: z
    .string()
    .min(3, 'Le motif de remboursement doit contenir au moins 3 caractères.')
    .max(200, 'Le motif ne peut pas dépasser 200 caractères.')
    .optional(),
}).refine((data) => data.booking_reference || data.booking_id, {
  message: 'Au moins l’un des deux paramètres (booking_reference ou booking_id) est requis.',
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
