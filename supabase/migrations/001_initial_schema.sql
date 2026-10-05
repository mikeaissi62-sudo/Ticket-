-- ============================================================
-- Ticket+ — Migration SQL pour Supabase PostgreSQL
-- Version: 1.0.0
-- Description: Création de toutes les tables, enums, 
--              RLS policies, et seed data initial.
-- ============================================================

-- ==========================================
-- 1. ENUMS
-- ==========================================

CREATE TYPE user_role AS ENUM ('traveler', 'partner', 'admin');
CREATE TYPE trip_status AS ENUM ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled');
CREATE TYPE seat_status AS ENUM ('available', 'reserved', 'occupied');
CREATE TYPE seat_type AS ENUM ('window', 'aisle', 'middle');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_provider AS ENUM ('mtn_momo', 'moov_money', 'card');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE notification_type AS ENUM ('booking', 'departure', 'promo', 'system');
CREATE TYPE bus_type AS ENUM ('VIP', 'Confort', 'Standard');

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Profils utilisateurs (liés à auth.users via id)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'traveler',
  company_id UUID,
  preferences JSONB DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compagnies de transport
CREATE TABLE companies (
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

-- Gares / Stations
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address TEXT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Routes (lignes de transport)
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  departure_station_id UUID NOT NULL REFERENCES stations(id),
  arrival_station_id UUID NOT NULL REFERENCES stations(id),
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Horaires programmés
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bus / Véhicules
CREATE TABLE buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plate_number TEXT NOT NULL,
  model TEXT NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 49,
  seat_layout JSONB DEFAULT '[]',
  bus_type bus_type NOT NULL DEFAULT 'Confort',
  has_ac BOOLEAN NOT NULL DEFAULT false,
  has_wifi BOOLEAN NOT NULL DEFAULT false,
  has_usb BOOLEAN NOT NULL DEFAULT false,
  has_tv BOOLEAN NOT NULL DEFAULT false,
  has_wc BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Voyages (instances concrètes d'un schedule à une date)
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES schedules(id),
  route_id UUID NOT NULL REFERENCES routes(id),
  bus_id UUID NOT NULL REFERENCES buses(id),
  trip_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  status trip_status NOT NULL DEFAULT 'scheduled',
  current_lat DECIMAL(10,8),
  current_lng DECIMAL(11,8),
  available_seats INTEGER NOT NULL DEFAULT 49,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, trip_date)
);

-- Sièges (par voyage)
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  status seat_status NOT NULL DEFAULT 'available',
  seat_type seat_type NOT NULL DEFAULT 'aisle',
  price_modifier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trip_id, seat_number)
);

-- Réservations
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  trip_id UUID NOT NULL REFERENCES trips(id),
  seat_id UUID NOT NULL REFERENCES seats(id),
  passenger_first_name TEXT NOT NULL,
  passenger_last_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  has_baggage BOOLEAN NOT NULL DEFAULT false,
  is_flexible BOOLEAN NOT NULL DEFAULT false,
  status booking_status NOT NULL DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL,
  booking_reference TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Paiements
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL,
  transaction_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  status payment_status NOT NULL DEFAULT 'pending',
  provider_response JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tickets / Billets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  qr_code_data TEXT NOT NULL,
  pdf_url TEXT,
  is_used BOOLEAN NOT NULL DEFAULT false,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. INDEXES
-- ==========================================

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_stations_city ON stations(city);
CREATE INDEX idx_stations_company ON stations(company_id);
CREATE INDEX idx_routes_company ON routes(company_id);
CREATE INDEX idx_routes_stations ON routes(departure_station_id, arrival_station_id);
CREATE INDEX idx_schedules_route ON schedules(route_id);
CREATE INDEX idx_trips_date ON trips(trip_date);
CREATE INDEX idx_trips_route_date ON trips(route_id, trip_date);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_seats_trip ON seats(trip_id);
CREATE INDEX idx_seats_status ON seats(trip_id, status);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_trip ON bookings(trip_id);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ==========================================
-- 4. TRIGGERS (auto updated_at)
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 5. FUNCTIONS
-- ==========================================

-- Générer une référence de booking unique (TK-XXXXXX)
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_reference := 'TK-' || UPPER(SUBSTR(MD5(gen_random_uuid()::TEXT), 1, 6));
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_booking_reference BEFORE INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- Décrémenter les places disponibles quand un siège est réservé
CREATE OR REPLACE FUNCTION update_available_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'reserved' AND OLD.status = 'available' THEN
        UPDATE trips SET available_seats = available_seats - 1 WHERE id = NEW.trip_id;
    ELSIF NEW.status = 'available' AND OLD.status = 'reserved' THEN
        UPDATE trips SET available_seats = available_seats + 1 WHERE id = NEW.trip_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER seat_status_change AFTER UPDATE ON seats
    FOR EACH ROW EXECUTE FUNCTION update_available_seats();

-- ==========================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- === Users ===
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow insert during sign-up"
  ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- === Companies (public read) ===
CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT USING (true);
CREATE POLICY "Only admins can modify companies"
  ON companies FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- === Stations (public read) ===
CREATE POLICY "Stations are viewable by everyone"
  ON stations FOR SELECT USING (true);

-- === Routes (public read) ===
CREATE POLICY "Routes are viewable by everyone"
  ON routes FOR SELECT USING (true);

-- === Schedules (public read) ===
CREATE POLICY "Schedules are viewable by everyone"
  ON schedules FOR SELECT USING (true);

-- === Trips (public read) ===
CREATE POLICY "Trips are viewable by everyone"
  ON trips FOR SELECT USING (true);

-- === Buses (public read) ===
CREATE POLICY "Buses are viewable by everyone"
  ON buses FOR SELECT USING (true);

-- === Seats (public read) ===
CREATE POLICY "Seats are viewable by everyone"
  ON seats FOR SELECT USING (true);

-- === Bookings (user owns) ===
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- === Payments (user owns via booking) ===
CREATE POLICY "Users can view their payments"
  ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payments.booking_id AND bookings.user_id = auth.uid())
  );

-- === Tickets (user owns via booking) ===
CREATE POLICY "Users can view their tickets"
  ON tickets FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = tickets.booking_id AND bookings.user_id = auth.uid())
  );

-- === Notifications (user owns) ===
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- 7. SEED DATA — Compagnies du Bénin
-- ==========================================

INSERT INTO companies (name, slug, subtitle, description, is_active, is_official_partner, commission_rate, rating, total_reviews, daily_departures, contact_info) VALUES
  ('Confort Lines', 'confort-lines', 'Voyagez en toute sérénité', 'Première compagnie de transport interurbain au Bénin. Flotte moderne, climatisée, sièges confortables.', true, true, 10.00, 4.5, 1280, 11, '{"phone": "+229 97 00 00 01", "whatsapp": "+229 97 00 00 01", "email": "contact@confortlines.bj"}'),
  ('Baobab Express', 'baobab-express', 'Spécialiste du Nord', 'Transport rapide et fiable vers le Nord du Bénin. Liaisons quotidiennes Cotonou-Parakou-Natitingou.', true, true, 10.00, 4.3, 856, 8, '{"phone": "+229 96 00 00 02", "whatsapp": "+229 96 00 00 02", "email": "info@baobabexpress.bj"}'),
  ('ATT Transports', 'att-transports', 'Le transport accessible', 'Réseau étendu couvrant l''ensemble du territoire béninois avec des tarifs accessibles.', true, true, 10.00, 4.1, 620, 5, '{"phone": "+229 95 00 00 03", "email": "contact@att-transports.bj"}'),
  ('STM Voyageur', 'stm-voyageur', 'Confort et ponctualité', 'Service de transport moderne avec une attention particulière à la ponctualité et au confort.', true, false, 10.00, 4.2, 430, 6, '{"phone": "+229 94 00 00 04", "email": "stm@voyageur.bj"}');

-- ==========================================
-- 8. SEED DATA — Gares du Bénin
-- ==========================================

-- Confort Lines
INSERT INTO stations (name, city, latitude, longitude, address, company_id) VALUES
  ('Gare Étoile Rouge', 'Cotonou', 6.36560000, 2.43740000, 'Carrefour Étoile Rouge, Cotonou', (SELECT id FROM companies WHERE slug = 'confort-lines')),
  ('Gare Confort Parakou', 'Parakou', 9.33710000, 2.63120000, 'Boulevard Principal, Parakou', (SELECT id FROM companies WHERE slug = 'confort-lines')),
  ('Gare Confort Natitingou', 'Natitingou', 10.30480000, 1.37950000, 'Avenue Centrale, Natitingou', (SELECT id FROM companies WHERE slug = 'confort-lines')),
  ('Gare Confort Bohicon', 'Bohicon', 7.17740000, 2.06850000, 'Centre-ville, Bohicon', (SELECT id FROM companies WHERE slug = 'confort-lines'));

-- Baobab Express
INSERT INTO stations (name, city, latitude, longitude, address, company_id) VALUES
  ('Gare Baobab Cotonou', 'Cotonou', 6.36700000, 2.44100000, 'Quartier Zongo, Cotonou', (SELECT id FROM companies WHERE slug = 'baobab-express')),
  ('Gare Baobab Parakou', 'Parakou', 9.33500000, 2.62800000, 'Rond-point Parakou, Parakou', (SELECT id FROM companies WHERE slug = 'baobab-express')),
  ('Gare Baobab Natitingou', 'Natitingou', 10.30200000, 1.37800000, 'Entrée Nord, Natitingou', (SELECT id FROM companies WHERE slug = 'baobab-express'));

-- ATT Transports
INSERT INTO stations (name, city, latitude, longitude, address, company_id) VALUES
  ('Gare ATT Cotonou', 'Cotonou', 6.36900000, 2.43500000, 'Marché Dantokpa, Cotonou', (SELECT id FROM companies WHERE slug = 'att-transports')),
  ('Gare ATT Parakou', 'Parakou', 9.34000000, 2.63500000, 'Quartier Aïdjédji, Parakou', (SELECT id FROM companies WHERE slug = 'att-transports')),
  ('Gare ATT Bohicon', 'Bohicon', 7.17500000, 2.07000000, 'Route Nationale, Bohicon', (SELECT id FROM companies WHERE slug = 'att-transports')),
  ('Gare ATT Abomey', 'Abomey', 7.18280000, 1.99130000, 'Place Goho, Abomey', (SELECT id FROM companies WHERE slug = 'att-transports'));

-- STM Voyageur
INSERT INTO stations (name, city, latitude, longitude, address, company_id) VALUES
  ('Gare STM Cotonou', 'Cotonou', 6.37100000, 2.43900000, 'Quartier Ganhi, Cotonou', (SELECT id FROM companies WHERE slug = 'stm-voyageur')),
  ('Gare STM Parakou', 'Parakou', 9.33800000, 2.63000000, 'Avenue Centrale, Parakou', (SELECT id FROM companies WHERE slug = 'stm-voyageur')),
  ('Gare STM Porto-Novo', 'Porto-Novo', 6.49710000, 2.62890000, 'Place Jean Bayol, Porto-Novo', (SELECT id FROM companies WHERE slug = 'stm-voyageur'));

-- ==========================================
-- 9. SEED DATA — Routes principales
-- ==========================================

-- Confort Lines Routes
INSERT INTO routes (company_id, departure_station_id, arrival_station_id, name, duration_minutes, base_price, features) VALUES
  ((SELECT id FROM companies WHERE slug = 'confort-lines'),
   (SELECT id FROM stations WHERE name = 'Gare Étoile Rouge'),
   (SELECT id FROM stations WHERE name = 'Gare Confort Parakou'),
   'Cotonou → Parakou', 360, 7500, ARRAY['ac', 'usb', 'tv']),

  ((SELECT id FROM companies WHERE slug = 'confort-lines'),
   (SELECT id FROM stations WHERE name = 'Gare Étoile Rouge'),
   (SELECT id FROM stations WHERE name = 'Gare Confort Natitingou'),
   'Cotonou → Natitingou', 540, 12000, ARRAY['ac', 'usb', 'tv', 'wifi']),

  ((SELECT id FROM companies WHERE slug = 'confort-lines'),
   (SELECT id FROM stations WHERE name = 'Gare Étoile Rouge'),
   (SELECT id FROM stations WHERE name = 'Gare Confort Bohicon'),
   'Cotonou → Bohicon', 120, 3000, ARRAY['ac', 'usb']);

-- Baobab Express Routes
INSERT INTO routes (company_id, departure_station_id, arrival_station_id, name, duration_minutes, base_price, features) VALUES
  ((SELECT id FROM companies WHERE slug = 'baobab-express'),
   (SELECT id FROM stations WHERE name = 'Gare Baobab Cotonou'),
   (SELECT id FROM stations WHERE name = 'Gare Baobab Parakou'),
   'Cotonou → Parakou', 330, 7000, ARRAY['ac', 'usb']),

  ((SELECT id FROM companies WHERE slug = 'baobab-express'),
   (SELECT id FROM stations WHERE name = 'Gare Baobab Cotonou'),
   (SELECT id FROM stations WHERE name = 'Gare Baobab Natitingou'),
   'Cotonou → Natitingou', 510, 11000, ARRAY['ac', 'usb']);

-- ATT Transports Routes
INSERT INTO routes (company_id, departure_station_id, arrival_station_id, name, duration_minutes, base_price, features) VALUES
  ((SELECT id FROM companies WHERE slug = 'att-transports'),
   (SELECT id FROM stations WHERE name = 'Gare ATT Cotonou'),
   (SELECT id FROM stations WHERE name = 'Gare ATT Parakou'),
   'Cotonou → Parakou', 390, 5500, ARRAY['ac']),

  ((SELECT id FROM companies WHERE slug = 'att-transports'),
   (SELECT id FROM stations WHERE name = 'Gare ATT Cotonou'),
   (SELECT id FROM stations WHERE name = 'Gare ATT Bohicon'),
   'Cotonou → Bohicon', 135, 2500, ARRAY['ac']),

  ((SELECT id FROM companies WHERE slug = 'att-transports'),
   (SELECT id FROM stations WHERE name = 'Gare ATT Cotonou'),
   (SELECT id FROM stations WHERE name = 'Gare ATT Abomey'),
   'Cotonou → Abomey', 150, 3000, ARRAY['ac']);

-- STM Voyageur Routes
INSERT INTO routes (company_id, departure_station_id, arrival_station_id, name, duration_minutes, base_price, features) VALUES
  ((SELECT id FROM companies WHERE slug = 'stm-voyageur'),
   (SELECT id FROM stations WHERE name = 'Gare STM Cotonou'),
   (SELECT id FROM stations WHERE name = 'Gare STM Parakou'),
   'Cotonou → Parakou', 370, 6500, ARRAY['ac', 'wifi']),

  ((SELECT id FROM companies WHERE slug = 'stm-voyageur'),
   (SELECT id FROM stations WHERE name = 'Gare STM Cotonou'),
   (SELECT id FROM stations WHERE name = 'Gare STM Porto-Novo'),
   'Cotonou → Porto-Novo', 60, 1500, ARRAY['ac']);

-- ==========================================
-- 10. SEED DATA — Bus
-- ==========================================

INSERT INTO buses (company_id, plate_number, model, total_seats, bus_type, has_ac, has_wifi, has_usb, has_tv) VALUES
  ((SELECT id FROM companies WHERE slug = 'confort-lines'), 'AA 1234 RB', 'Mercedes Tourismo VIP', 49, 'VIP', true, true, true, true),
  ((SELECT id FROM companies WHERE slug = 'confort-lines'), 'AA 1235 RB', 'Mercedes Tourismo', 49, 'Confort', true, false, true, true),
  ((SELECT id FROM companies WHERE slug = 'confort-lines'), 'AA 1236 RB', 'Yutong ZK6122', 53, 'Confort', true, false, true, false),
  ((SELECT id FROM companies WHERE slug = 'baobab-express'), 'BB 2001 RB', 'Higer KLQ6122B', 49, 'Confort', true, false, true, false),
  ((SELECT id FROM companies WHERE slug = 'baobab-express'), 'BB 2002 RB', 'King Long XMQ6127', 53, 'Standard', true, false, false, false),
  ((SELECT id FROM companies WHERE slug = 'att-transports'), 'CC 3001 RB', 'Yutong ZK6116', 45, 'Standard', true, false, false, false),
  ((SELECT id FROM companies WHERE slug = 'att-transports'), 'CC 3002 RB', 'Zhongtong LCK6125', 49, 'Confort', true, false, true, false),
  ((SELECT id FROM companies WHERE slug = 'stm-voyageur'), 'DD 4001 RB', 'Golden Dragon XML6125', 49, 'Confort', true, true, true, false),
  ((SELECT id FROM companies WHERE slug = 'stm-voyageur'), 'DD 4002 RB', 'Ankai HFF6120', 53, 'Standard', true, false, false, false);

-- ==========================================
-- 11. SEED DATA — Horaires
-- ==========================================

-- Confort Lines: Cotonou → Parakou (3 départs/jour)
INSERT INTO schedules (route_id, departure_time, days_of_week) VALUES
  ((SELECT id FROM routes WHERE name = 'Cotonou → Parakou' AND company_id = (SELECT id FROM companies WHERE slug = 'confort-lines')),
   '06:00:00', ARRAY[0,1,2,3,4,5,6]),
  ((SELECT id FROM routes WHERE name = 'Cotonou → Parakou' AND company_id = (SELECT id FROM companies WHERE slug = 'confort-lines')),
   '08:30:00', ARRAY[0,1,2,3,4,5,6]),
  ((SELECT id FROM routes WHERE name = 'Cotonou → Parakou' AND company_id = (SELECT id FROM companies WHERE slug = 'confort-lines')),
   '21:00:00', ARRAY[0,1,2,3,4,5,6]);

-- Confort Lines: Cotonou → Natitingou (2 départs/jour)
INSERT INTO schedules (route_id, departure_time, days_of_week) VALUES
  ((SELECT id FROM routes WHERE name = 'Cotonou → Natitingou' AND company_id = (SELECT id FROM companies WHERE slug = 'confort-lines')),
   '06:00:00', ARRAY[0,1,2,3,4,5,6]),
  ((SELECT id FROM routes WHERE name = 'Cotonou → Natitingou' AND company_id = (SELECT id FROM companies WHERE slug = 'confort-lines')),
   '20:00:00', ARRAY[0,1,2,3,4,5,6]);

-- Confort Lines: Cotonou → Bohicon (3 départs/jour)
INSERT INTO schedules (route_id, departure_time, days_of_week) VALUES
  ((SELECT id FROM routes WHERE name = 'Cotonou → Bohicon' AND company_id = (SELECT id FROM companies WHERE slug = 'confort-lines')),
   '07:00:00', ARRAY[0,1,2,3,4,5,6]),
  ((SELECT id FROM routes WHERE name = 'Cotonou → Bohicon' AND company_id = (SELECT id FROM companies WHERE slug = 'confort-lines')),
   '12:00:00', ARRAY[0,1,2,3,4,5,6]),
  ((SELECT id FROM routes WHERE name = 'Cotonou → Bohicon' AND company_id = (SELECT id FROM companies WHERE slug = 'confort-lines')),
   '17:00:00', ARRAY[0,1,2,3,4,5,6]);

-- Baobab Express: Cotonou → Parakou (2 départs/jour)
INSERT INTO schedules (route_id, departure_time, days_of_week) VALUES
  ((SELECT id FROM routes WHERE name = 'Cotonou → Parakou' AND company_id = (SELECT id FROM companies WHERE slug = 'baobab-express')),
   '07:00:00', ARRAY[0,1,2,3,4,5,6]),
  ((SELECT id FROM routes WHERE name = 'Cotonou → Parakou' AND company_id = (SELECT id FROM companies WHERE slug = 'baobab-express')),
   '19:00:00', ARRAY[0,1,2,3,4,5,6]);

-- Baobab Express: Cotonou → Natitingou (1 départ/jour)
INSERT INTO schedules (route_id, departure_time, days_of_week) VALUES
  ((SELECT id FROM routes WHERE name = 'Cotonou → Natitingou' AND company_id = (SELECT id FROM companies WHERE slug = 'baobab-express')),
   '06:30:00', ARRAY[0,1,2,3,4,5,6]);

-- ATT Transports: Cotonou → Parakou (2 départs/jour)
INSERT INTO schedules (route_id, departure_time, days_of_week) VALUES
  ((SELECT id FROM routes WHERE name = 'Cotonou → Parakou' AND company_id = (SELECT id FROM companies WHERE slug = 'att-transports')),
   '06:30:00', ARRAY[0,1,2,3,4,5,6]),
  ((SELECT id FROM routes WHERE name = 'Cotonou → Parakou' AND company_id = (SELECT id FROM companies WHERE slug = 'att-transports')),
   '18:00:00', ARRAY[0,1,2,3,4,5,6]);

-- ATT: Cotonou → Bohicon (1 départ/jour)
INSERT INTO schedules (route_id, departure_time, days_of_week) VALUES
  ((SELECT id FROM routes WHERE name = 'Cotonou → Bohicon' AND company_id = (SELECT id FROM companies WHERE slug = 'att-transports')),
   '08:00:00', ARRAY[0,1,2,3,4,5,6]);

-- ATT: Cotonou → Abomey (1 départ/jour)
INSERT INTO schedules (route_id, departure_time, days_of_week) VALUES
  ((SELECT id FROM routes WHERE name = 'Cotonou → Abomey' AND company_id = (SELECT id FROM companies WHERE slug = 'att-transports')),
   '09:00:00', ARRAY[0,1,2,3,4,5,6]);

-- STM Voyageur: Cotonou → Parakou (2 départs/jour)
INSERT INTO schedules (route_id, departure_time, days_of_week) VALUES
  ((SELECT id FROM routes WHERE name = 'Cotonou → Parakou' AND company_id = (SELECT id FROM companies WHERE slug = 'stm-voyageur')),
   '07:30:00', ARRAY[0,1,2,3,4,5,6]),
  ((SELECT id FROM routes WHERE name = 'Cotonou → Parakou' AND company_id = (SELECT id FROM companies WHERE slug = 'stm-voyageur')),
   '20:00:00', ARRAY[0,1,2,3,4,5,6]);

-- STM: Cotonou → Porto-Novo (3 départs/jour)
INSERT INTO schedules (route_id, departure_time, days_of_week) VALUES
  ((SELECT id FROM routes WHERE name = 'Cotonou → Porto-Novo' AND company_id = (SELECT id FROM companies WHERE slug = 'stm-voyageur')),
   '07:00:00', ARRAY[0,1,2,3,4,5,6]),
  ((SELECT id FROM routes WHERE name = 'Cotonou → Porto-Novo' AND company_id = (SELECT id FROM companies WHERE slug = 'stm-voyageur')),
   '12:00:00', ARRAY[0,1,2,3,4,5,6]),
  ((SELECT id FROM routes WHERE name = 'Cotonou → Porto-Novo' AND company_id = (SELECT id FROM companies WHERE slug = 'stm-voyageur')),
   '18:00:00', ARRAY[0,1,2,3,4,5,6]);

-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================
