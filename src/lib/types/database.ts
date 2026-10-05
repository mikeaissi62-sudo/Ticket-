// ============================================================
// Ticket+ — Types TypeScript pour Supabase PostgreSQL
// Générés à partir du schéma de base de données planifié.
// ============================================================

export type UserRole = 'traveler' | 'partner' | 'admin';
export type TripStatus = 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';
export type SeatStatus = 'available' | 'reserved' | 'occupied';
export type SeatType = 'window' | 'aisle' | 'middle';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentProvider = 'mtn_momo' | 'moov_money' | 'card';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type NotificationType = 'booking' | 'departure' | 'promo' | 'system';
export type BusType = 'VIP' | 'Confort' | 'Standard';

// ---- Table Row Types ----

export interface User {
  id: string;
  email: string | null;
  phone: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  company_id: string | null;
  preferences: Record<string, unknown> | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  logo_url: string | null;
  cover_url: string | null;
  description: string | null;
  is_active: boolean;
  is_official_partner: boolean;
  contact_info: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    address?: string;
  } | null;
  commission_rate: number;
  rating: number;
  total_reviews: number;
  daily_departures: number;
  created_at: string;
  updated_at: string;
}

export interface Station {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  address: string | null;
  company_id: string;
  is_active: boolean;
  created_at: string;
}

export interface Route {
  id: string;
  company_id: string;
  departure_station_id: string;
  arrival_station_id: string;
  name: string;
  duration_minutes: number;
  base_price: number;
  features: string[]; // ['ac', 'wifi', 'usb', 'tv', 'wc']
  is_active: boolean;
  created_at: string;
}

export interface Schedule {
  id: string;
  route_id: string;
  departure_time: string; // "HH:MM:SS"
  days_of_week: number[]; // [0,1,2,3,4,5,6]
  is_active: boolean;
  created_at: string;
}

export interface Trip {
  id: string;
  schedule_id: string;
  route_id: string;
  bus_id: string;
  trip_date: string; // "YYYY-MM-DD"
  departure_time: string; // "HH:MM:SS"
  status: TripStatus;
  current_lat: number | null;
  current_lng: number | null;
  available_seats: number;
  created_at: string;
}

export interface Bus {
  id: string;
  company_id: string;
  plate_number: string;
  model: string;
  total_seats: number;
  seat_layout: number[][]; // Matrice de configuration des sièges
  bus_type: BusType;
  has_ac: boolean;
  has_wifi: boolean;
  has_usb: boolean;
  has_tv: boolean;
  has_wc: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Seat {
  id: string;
  trip_id: string;
  seat_number: string; // "A1", "A2", "B1"...
  status: SeatStatus;
  seat_type: SeatType;
  price_modifier: number; // ex: 1.0 normal, 1.2 VIP, 0.0 disabled
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  seat_id: string;
  passenger_first_name: string;
  passenger_last_name: string;
  passenger_phone: string;
  has_baggage: boolean;
  is_flexible: boolean;
  status: BookingStatus;
  total_price: number;
  booking_reference: string; // "TK-XXXXXX"
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  provider: PaymentProvider;
  transaction_id: string | null;
  amount: number;
  currency: string; // "XOF"
  status: PaymentStatus;
  provider_response: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  booking_id: string;
  qr_code_data: string;
  pdf_url: string | null;
  is_used: boolean;
  issued_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

// ---- Join / View Types (for queries with relations) ----

export interface TripWithDetails extends Trip {
  route: Route & {
    departure_station: Station;
    arrival_station: Station;
    company: Company;
  };
  bus: Bus;
  seats?: Seat[];
}

export interface BookingWithDetails extends Booking {
  trip: TripWithDetails;
  seat: Seat;
  payment?: Payment;
  ticket?: Ticket;
}

// ---- Insert Types (for creating new records) ----

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type CompanyInsert = Omit<Company, 'id' | 'created_at' | 'updated_at'>;
export type StationInsert = Omit<Station, 'id' | 'created_at'>;
export type RouteInsert = Omit<Route, 'id' | 'created_at'>;
export type ScheduleInsert = Omit<Schedule, 'id' | 'created_at'>;
export type TripInsert = Omit<Trip, 'id' | 'created_at'>;
export type BusInsert = Omit<Bus, 'id' | 'created_at'>;
export type SeatInsert = Omit<Seat, 'id' | 'created_at'>;
export type BookingInsert = Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'booking_reference'>;
export type PaymentInsert = Omit<Payment, 'id' | 'created_at'>;
export type TicketInsert = Omit<Ticket, 'id'>;
export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>;

// ---- Update Types ----

export type UserUpdate = Partial<UserInsert>;
export type CompanyUpdate = Partial<CompanyInsert>;
export type TripUpdate = Partial<Pick<Trip, 'status' | 'current_lat' | 'current_lng' | 'available_seats'>>;
export type SeatUpdate = Partial<Pick<Seat, 'status'>>;
export type BookingUpdate = Partial<Pick<Booking, 'status'>>;
export type PaymentUpdate = Partial<Pick<Payment, 'status' | 'transaction_id' | 'provider_response' | 'paid_at'>>;

// ---- Supabase Database type (for typed client) ----

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      companies: {
        Row: Company;
        Insert: CompanyInsert;
        Update: CompanyUpdate;
      };
      stations: {
        Row: Station;
        Insert: StationInsert;
        Update: Partial<StationInsert>;
      };
      routes: {
        Row: Route;
        Insert: RouteInsert;
        Update: Partial<RouteInsert>;
      };
      schedules: {
        Row: Schedule;
        Insert: ScheduleInsert;
        Update: Partial<ScheduleInsert>;
      };
      trips: {
        Row: Trip;
        Insert: TripInsert;
        Update: TripUpdate;
      };
      buses: {
        Row: Bus;
        Insert: BusInsert;
        Update: Partial<BusInsert>;
      };
      seats: {
        Row: Seat;
        Insert: SeatInsert;
        Update: SeatUpdate;
      };
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
      };
      tickets: {
        Row: Ticket;
        Insert: TicketInsert;
        Update: Partial<TicketInsert>;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: Partial<NotificationInsert>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      trip_status: TripStatus;
      seat_status: SeatStatus;
      seat_type: SeatType;
      booking_status: BookingStatus;
      payment_provider: PaymentProvider;
      payment_status: PaymentStatus;
      notification_type: NotificationType;
      bus_type: BusType;
    };
  };
}
