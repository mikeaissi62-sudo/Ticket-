-- ============================================================
-- Ticket+ Bénin — Migration d'Indexation pour Haute Performance
-- Optimise les requêtes de recherche, réservations et notifications
-- ============================================================

-- 1. Index sur les Réservations (bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings (booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON public.bookings (trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON public.bookings (user_id, status);

-- 2. Index sur les Notifications (notifications)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);

-- 3. Index sur les Trajets & Horaires (trips)
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON public.trips (route_id);
CREATE INDEX IF NOT EXISTS idx_trips_departure_time ON public.trips (departure_time);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips (status);
CREATE INDEX IF NOT EXISTS idx_trips_route_date ON public.trips (route_id, departure_time, status);

-- 4. Index sur les Lignes (routes)
CREATE INDEX IF NOT EXISTS idx_routes_stations ON public.routes (departure_station_id, arrival_station_id);
CREATE INDEX IF NOT EXISTS idx_routes_company_id ON public.routes (company_id);
CREATE INDEX IF NOT EXISTS idx_routes_active ON public.routes (is_active);

-- 5. Index sur les Compagnies (companies)
CREATE INDEX IF NOT EXISTS idx_companies_active ON public.companies (is_active);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies (slug);

-- 6. Index sur les Paiements (payments)
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments (transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);

-- 7. Index sur les Sièges (seats)
CREATE INDEX IF NOT EXISTS idx_seats_trip_id ON public.seats (trip_id);
CREATE INDEX IF NOT EXISTS idx_seats_trip_status ON public.seats (trip_id, status);

-- 8. Index sur les Utilisateurs & Rôles (users)
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users (phone);
