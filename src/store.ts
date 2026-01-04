import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DateRange, Snapshot } from './types';

interface SignalStore {
  activeSignalIds: string[]; // Array for multi-select
  hiddenSignalIds: string[]; // Array for toggling visibility without deselecting
  isLive: boolean;
  dateRange: DateRange;
  customColors: Record<string, string>;
  highlightedSignalId: string | null;

  toggleSignal: (id: string) => void;
  toggleSignalVisibility: (id: string) => void;
  toggleLiveMode: () => void;
  setDateRange: (range: DateRange) => void;
  setSignalColor: (id: string, color: string) => void;
  setHighlightedSignal: (id: string | null) => void;
  restoreSnapshot: (snapshot: Snapshot) => void;
}

export const useSignalStore = create<SignalStore>()(
  persist(
    (set) => ({
      activeSignalIds: [], // Default: no signals selected
      hiddenSignalIds: [],
      isLive: false,
      dateRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        end: new Date().toISOString(), // Now
      },

      customColors: {},
      highlightedSignalId: null,

      toggleSignal: (id) =>
        set((state) => {
          // If exists, remove it. If not, add it.
          const exists = state.activeSignalIds.includes(id);
          if (exists) {
            return {
              activeSignalIds: state.activeSignalIds.filter((s) => s !== id),
              hiddenSignalIds: state.hiddenSignalIds.filter((s) => s !== id), // Cleanup hidden state
            };
          }
          return { activeSignalIds: [...state.activeSignalIds, id] };
        }),

      toggleSignalVisibility: (id) =>
        set((state) => {
          const isHidden = state.hiddenSignalIds.includes(id);
          if (isHidden) {
            return {
              hiddenSignalIds: state.hiddenSignalIds.filter((s) => s !== id),
            };
          }
          return { hiddenSignalIds: [...state.hiddenSignalIds, id] };
        }),

      toggleLiveMode: () =>
        set((state) => {
          const newIsLive = !state.isLive;
          let newDateRange = state.dateRange;

          // If switching TO live mode, snap to last 5 minutes
          if (newIsLive) {
            const now = Date.now();
            newDateRange = {
              start: new Date(now - 5 * 60 * 1000).toISOString(),
              end: new Date(now).toISOString(),
            };
          }

          return { isLive: newIsLive, dateRange: newDateRange };
        }),

      setDateRange: (range) => set({ dateRange: range }),

      setSignalColor: (id, color) =>
        set((state) => ({
          customColors: { ...state.customColors, [id]: color },
        })),

      setHighlightedSignal: (id) => set({ highlightedSignalId: id }),

      restoreSnapshot: (snapshot) => {
        let parsedColors = {};
        try {
          // If customColors came from backend as string
          if (typeof snapshot.customColors === 'string') {
            parsedColors = JSON.parse(snapshot.customColors);
          } else {
            parsedColors = snapshot.customColors || {};
          }
        } catch {
          console.error('Failed to parse colors');
        }

        // Date range might be JSON string or object depending on how we saved it
        let parsedDateRange: DateRange;

        if (typeof snapshot.dateRange === 'string') {
          try {
            parsedDateRange = JSON.parse(snapshot.dateRange);
          } catch {
            // Fallback if not JSON or invalid
            parsedDateRange = {
              start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString(),
            };
          }
        } else {
          parsedDateRange = snapshot.dateRange;
        }

        set({
          activeSignalIds: snapshot.activeSignalIds || [],
          hiddenSignalIds: snapshot.hiddenSignalIds || [],
          customColors: parsedColors,
          dateRange: parsedDateRange,
        });
      },
    }),
    {
      name: 'signal-store', // unique name for localStorage
      partialize: (state) => ({
        // Select fields to persist
        activeSignalIds: state.activeSignalIds,
        hiddenSignalIds: state.hiddenSignalIds,
        isLive: state.isLive,
        dateRange: state.dateRange,
        customColors: state.customColors,
      }),
    }
  )
);
