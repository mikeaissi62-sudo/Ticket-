// In-memory OTP store for development & demo mode
// Global singleton persists across Next.js dev server reloads

interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, OtpEntry>;
};

export const otpStore = globalForOtp.otpStore ?? new Map<string, OtpEntry>();
if (process.env.NODE_ENV !== 'production') globalForOtp.otpStore = otpStore;

/**
 * Enregistre un code OTP pour un numéro de téléphone béninois
 */
export function saveOtp(phone: string, otp: string, ttlMs = 5 * 60 * 1000): void {
  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + ttlMs,
    attempts: 0,
  });
}

/**
 * Vérifie un code OTP
 */
export function verifyStoredOtp(phone: string, inputOtp: string): { valid: boolean; error?: string } {
  const entry = otpStore.get(phone);
  if (!entry) {
    return { valid: false, error: 'Aucun code en attente. Veuillez demander un nouveau code.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, error: 'Code expiré. Veuillez demander un nouveau code.' };
  }

  if (entry.attempts >= 5) {
    otpStore.delete(phone);
    return { valid: false, error: 'Trop de tentatives. Veuillez demander un nouveau code.' };
  }

  entry.attempts += 1;

  if (entry.otp !== inputOtp) {
    return { valid: false, error: 'Code incorrect. Veuillez réessayer.' };
  }

  // Consommer le code OTP
  otpStore.delete(phone);
  return { valid: true };
}
