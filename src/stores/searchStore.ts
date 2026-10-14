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
      setSearch: (from, to, date, passengers) => set({ 
        from: (typeof from === 'string' && from.trim()) ? from.trim() : 'Cotonou', 
        to: (typeof to === 'string' && to.trim()) ? to.trim() : 'Parakou', 
        date: (typeof date === 'string' && date.trim()) ? date.trim() : new Date().toISOString().split('T')[0], 
        passengers: typeof passengers === 'number' && passengers > 0 ? passengers : 1 
      }),
    }),
    {
      name: 'ticket-plus-search-storage',
    }
  )
);
