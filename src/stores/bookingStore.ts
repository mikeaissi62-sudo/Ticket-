import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Trip } from '../lib/mock-data';

export interface Passenger {
  firstName: string;
  lastName: string;
  phone: string;
  idType: string;
}

interface BookingState {
  selectedTrip: Trip | null;
  selectedSeats: number[];
  passengerInfo: Passenger | null;
  hasBaggage: boolean;
  isFlexible: boolean;
  paymentMethod: string | null;
  
  // Actions
  selectTrip: (trip: Trip) => void;
  selectSeats: (seats: number[]) => void;
  setPassengerInfo: (info: Passenger) => void;
  setExtras: (hasBaggage: boolean, isFlexible: boolean) => void;
  setPaymentMethod: (method: string) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      selectedTrip: null,
      selectedSeats: [],
      passengerInfo: null,
      hasBaggage: false,
      isFlexible: false,
      paymentMethod: null,

      selectTrip: (trip) => set({ selectedTrip: trip, selectedSeats: [], passengerInfo: null }),
      selectSeats: (seats) => set({ selectedSeats: seats }),
      setPassengerInfo: (info) => set({ passengerInfo: info }),
      setExtras: (hasBaggage, isFlexible) => set({ hasBaggage, isFlexible }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      resetBooking: () => set({
        selectedTrip: null,
        selectedSeats: [],
        passengerInfo: null,
        hasBaggage: false,
        isFlexible: false,
        paymentMethod: null
      }),
    }),
    {
      name: 'ticket-plus-booking-storage',
    }
  )
);
