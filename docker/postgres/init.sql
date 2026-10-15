-- ============================================================
-- Ticket+ — Initialisation PostgreSQL Docker
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Création d'un schéma auth minimal compatible avec les références
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Types Enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('traveler', 'partner', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE trip_status AS ENUM ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE seat_status AS ENUM ('available', 'reserved', 'occupied');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE seat_type AS ENUM ('window', 'aisle', 'middle');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_provider AS ENUM ('mtn_momo', 'moov_money', 'card');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('booking', 'departure', 'promo', 'system');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE bus_type AS ENUM ('VIP', 'Confort', 'Standard');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  phone TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'traveler',
  company_id UUID,
  preferences JSONB DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  logo_url TEXT,
  cover_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_official_partner BOOLEAN NOT NULL DEFAULT false,
  contact_info JSONB DEFAULT '{}',
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  rating DECIMAL(2,1) NOT NULL DEFAULT 4.0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  daily_departures INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table stations
CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table routes
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  departure_station_id UUID NOT NULL REFERENCES stations(id) ON DELETE RESTRICT,
  arrival_station_id UUID NOT NULL REFERENCES stations(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  distance_km INTEGER,
  duration_minutes INTEGER NOT NULL DEFAULT 360,
  base_price INTEGER NOT NULL DEFAULT 6500,
  features TEXT[] DEFAULT ARRAY['ac', 'wifi'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table buses
CREATE TABLE IF NOT EXISTS buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL,
  model TEXT,
  bus_type bus_type NOT NULL DEFAULT 'Confort',
  total_seats INTEGER NOT NULL DEFAULT 50,
  amenities TEXT[] DEFAULT ARRAY['ac'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table schedules
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  bus_id UUID REFERENCES buses(id) ON DELETE SET NULL,
  departure_time TIME NOT NULL,
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table trips
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
  bus_id UUID REFERENCES buses(id) ON DELETE RESTRICT,
  trip_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  price INTEGER NOT NULL DEFAULT 6500,
  available_seats INTEGER NOT NULL DEFAULT 50,
  status trip_status NOT NULL DEFAULT 'scheduled',
  features TEXT[] DEFAULT ARRAY['ac', 'wifi'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES trips(id) ON DELETE RESTRICT,
  reference TEXT NOT NULL UNIQUE,
  total_amount INTEGER NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  contact_email TEXT,
  contact_phone TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  passengers JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed des 4 compagnies réelles
INSERT INTO companies (name, slug, subtitle, rating, is_active, is_official_partner)
VALUES 
  ('Confort Lines', 'confort-lines', 'Le confort sur les routes du Bénin', 4.5, true, true),
  ('Baobab Express', 'baobab-express', 'Voyagez en toute sérénité', 4.3, true, true),
  ('ATT Transports', 'att-transports', 'La liaison rapide et ponctuelle', 4.1, true, true),
  ('STM Voyageurs', 'stm-voyageurs', 'Transport interurbain d excellence', 4.2, true, false)
ON CONFLICT (slug) DO NOTHING;
