-- =============================================
-- Migration: phone_otps table for OTP SMS verification
-- Phase 5.1 — Authentification par téléphone (Bénin)
-- =============================================

-- Table pour stocker les codes OTP temporaires (mode démo/dev)
-- En production avec Twilio configuré, cette table n'est pas utilisée
CREATE TABLE IF NOT EXISTS phone_otps (
  phone      TEXT PRIMARY KEY,
  otp_code   TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  attempts   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour le nettoyage des OTP expirés
CREATE INDEX IF NOT EXISTS idx_phone_otps_expires ON phone_otps(expires_at);

-- Politique RLS : seul le service role peut accéder à cette table
ALTER TABLE phone_otps ENABLE ROW LEVEL SECURITY;

-- Nettoyage automatique des OTP expirés (optionnel, via pg_cron en production)
-- SELECT cron.schedule('cleanup-phone-otps', '*/10 * * * *', 'DELETE FROM phone_otps WHERE expires_at < now()');

-- =============================================
-- Ajout du champ auth_provider à la table users (optionnel, pour tracking)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'auth_provider'
  ) THEN
    ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'email';
  END IF;
END $$;
