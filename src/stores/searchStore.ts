import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchState {
  from: string;
  to: string;
  date: string;
  passengers: number;
  setSearch: (from: string, to: string, date: string, passengers: number) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      from: 'Cotonou',
      to: 'Parakou',
      date: new Date().toISOString().split('T')[0],
      passengers: 1,
      setSearch: (from, to, date, passengers) => set({ from, to, date, passengers }),
    }),
    {
      name: 'ticket-plus-search-storage',
    }
  )
);
