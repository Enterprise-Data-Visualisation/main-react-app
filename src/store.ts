import { create } from "zustand";

interface DateRange {
  start: string; // ISO String
  end: string; // ISO String
}

interface SignalStore {
  activeSignalIds: string[]; // Array for multi-select
  isLive: boolean;
  dateRange: DateRange;

  toggleSignal: (id: string) => void;
  toggleLiveMode: () => void;
  setDateRange: (range: DateRange) => void;
}

export const useSignalStore = create<SignalStore>((set) => ({
  activeSignalIds: [], // Default: no signals selected
  isLive: false,
  dateRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    end: new Date().toISOString(), // Now
  },

  toggleSignal: (id) =>
    set((state) => {
      // If exists, remove it. If not, add it.
      const exists = state.activeSignalIds.includes(id);
      if (exists) {
        return {
          activeSignalIds: state.activeSignalIds.filter((s) => s !== id),
        };
      }
      return { activeSignalIds: [...state.activeSignalIds, id] };
    }),

  toggleLiveMode: () => set((state) => ({ isLive: !state.isLive })),

  setDateRange: (range) => set({ dateRange: range }),
}));
