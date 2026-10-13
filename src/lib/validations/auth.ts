/**
 * src/lib/validations/auth.ts
 * Schémas Zod pour l'authentification par téléphone / OTP
 */
import { z } from 'zod';

export const phoneOtpSendSchema = z.object({
  phone: z
    .string()
    .min(8, 'Le numéro de téléphone doit comporter au moins 8 chiffres.')
    .max(16, 'Numéro de téléphone trop long.')
    .regex(/^(\+?229)?[0-9]{8,10}$/, 'Format de téléphone béninois invalide.'),
});

export const phoneOtpVerifySchema = z.object({
  phone: z
    .string()
    .min(8, 'Numéro de téléphone invalide.')
    .max(16, 'Numéro de téléphone trop long.'),
  code: z
    .string()
    .length(6, 'Le code OTP de vérification doit comporter exactement 6 chiffres.')
    .regex(/^[0-9]{6}$/, 'Le code doit contenir uniquement des chiffres.'),
});

export type PhoneOtpSendInput = z.infer<typeof phoneOtpSendSchema>;
export type PhoneOtpVerifyInput = z.infer<typeof phoneOtpVerifySchema>;
