-- ============================================================
-- Ticket+ — Migration 006: RLS Policies avancées basées sur les rôles
-- Rôles supportés: 'traveler', 'partner', 'admin'
-- ============================================================

-- 1. FONCTIONS DE SÉCURITÉ (SECURITY DEFINER pour éviter les récursions RLS)

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.users WHERE id = auth.uid()), false);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_partner()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT role = 'partner' FROM public.users WHERE id = auth.uid()), false);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. POLICIES POUR LA TABLE USERS
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users"
  ON public.users FOR ALL
  USING (is_admin());

-- 3. POLICIES POUR LA TABLE COMPANIES
DROP POLICY IF EXISTS "Partners can update their company" ON public.companies;
CREATE POLICY "Partners can update their company"
  ON public.companies FOR UPDATE
  USING (id = get_user_company_id() OR is_admin());

DROP POLICY IF EXISTS "Admins can insert companies" ON public.companies;
CREATE POLICY "Admins can insert companies"
  ON public.companies FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete companies" ON public.companies;
CREATE POLICY "Admins can delete companies"
  ON public.companies FOR DELETE
  USING (is_admin());

-- 4. POLICIES POUR LA GESTION DES FLOTTES ET TRAJETS (Partners & Admins)
-- Routes
DROP POLICY IF EXISTS "Partners can manage their routes" ON public.routes;
CREATE POLICY "Partners can manage their routes"
  ON public.routes FOR ALL
  USING (company_id = get_user_company_id() OR is_admin())
  WITH CHECK (company_id = get_user_company_id() OR is_admin());

-- Stations
DROP POLICY IF EXISTS "Partners can manage their stations" ON public.stations;
CREATE POLICY "Partners can manage their stations"
  ON public.stations FOR ALL
  USING (company_id = get_user_company_id() OR is_admin())
  WITH CHECK (company_id = get_user_company_id() OR is_admin());

-- Buses
DROP POLICY IF EXISTS "Partners can manage their buses" ON public.buses;
CREATE POLICY "Partners can manage their buses"
  ON public.buses FOR ALL
  USING (company_id = get_user_company_id() OR is_admin())
  WITH CHECK (company_id = get_user_company_id() OR is_admin());

-- Schedules
DROP POLICY IF EXISTS "Partners can manage their schedules" ON public.schedules;
CREATE POLICY "Partners can manage their schedules"
  ON public.schedules FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.routes WHERE routes.id = schedules.route_id AND routes.company_id = get_user_company_id())
    OR is_admin()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.routes WHERE routes.id = schedules.route_id AND routes.company_id = get_user_company_id())
    OR is_admin()
  );

-- Trips
DROP POLICY IF EXISTS "Partners can manage their trips" ON public.trips;
CREATE POLICY "Partners can manage their trips"
  ON public.trips FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.routes WHERE routes.id = trips.route_id AND routes.company_id = get_user_company_id())
    OR is_admin()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.routes WHERE routes.id = trips.route_id AND routes.company_id = get_user_company_id())
    OR is_admin()
  );

-- Seats
DROP POLICY IF EXISTS "Partners can manage trip seats" ON public.seats;
CREATE POLICY "Partners can manage trip seats"
  ON public.seats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      JOIN public.routes ON trips.route_id = routes.id 
      WHERE trips.id = seats.trip_id AND routes.company_id = get_user_company_id()
    )
    OR is_admin()
  );

-- 5. POLICIES POUR LES RÉSERVATIONS (Bookings, Tickets, Payments)
-- Bookings: Partner view
DROP POLICY IF EXISTS "Partners can view company bookings" ON public.bookings;
CREATE POLICY "Partners can view company bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.trips
      JOIN public.routes ON trips.route_id = routes.id
      WHERE trips.id = bookings.trip_id AND routes.company_id = get_user_company_id()
    )
    OR is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  USING (is_admin());

-- Tickets: Partner view
DROP POLICY IF EXISTS "Partners can view company tickets" ON public.tickets;
CREATE POLICY "Partners can view company tickets"
  ON public.tickets FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = tickets.booking_id AND bookings.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.bookings
      JOIN public.trips ON bookings.trip_id = trips.id
      JOIN public.routes ON trips.route_id = routes.id
      WHERE bookings.id = tickets.booking_id AND routes.company_id = get_user_company_id()
    )
    OR is_admin()
  );

-- Payments: Partner view
DROP POLICY IF EXISTS "Partners can view company payments" ON public.payments;
CREATE POLICY "Partners can view company payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = payments.booking_id AND bookings.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.bookings
      JOIN public.trips ON bookings.trip_id = trips.id
      JOIN public.routes ON trips.route_id = routes.id
      WHERE bookings.id = payments.booking_id AND routes.company_id = get_user_company_id()
    )
    OR is_admin()
  );
