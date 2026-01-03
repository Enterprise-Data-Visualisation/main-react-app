/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

export interface TelemetryMetrics {
  chartLoadTime: number | null;
  lastFetchDuration: number | null;
  signalsLoaded: number;
  renderCount: number;
  avgRenderTime: number;
  renderHistory: number[];
  fetchHistory: number[];
}

interface TelemetryContextType {
  metrics: TelemetryMetrics;
  recordChartLoad: (duration: number) => void;
  recordFetch: (duration: number) => void;
  recordRender: (duration: number) => void;
  setSignalsLoaded: (count: number) => void;
  resetMetrics: () => void;
  startTimer: () => () => number;
}

const initialMetrics: TelemetryMetrics = {
  chartLoadTime: null,
  lastFetchDuration: null,
  signalsLoaded: 0,
  renderCount: 0,
  avgRenderTime: 0,
  renderHistory: [],
  fetchHistory: [],
};

const TelemetryContext = createContext<TelemetryContextType | null>(null);

const MAX_HISTORY_SIZE = 10;

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<TelemetryMetrics>(initialMetrics);

  const recordChartLoad = useCallback((duration: number) => {
    setMetrics((prev) => ({
      ...prev,
      chartLoadTime: duration,
    }));
  }, []);

  const recordFetch = useCallback((duration: number) => {
    setMetrics((prev) => {
      const newHistory = [...prev.fetchHistory, duration].slice(
        -MAX_HISTORY_SIZE
      );
      return {
        ...prev,
        lastFetchDuration: duration,
        fetchHistory: newHistory,
      };
    });
  }, []);

  const recordRender = useCallback((duration: number) => {
    setMetrics((prev) => {
      const newHistory = [...prev.renderHistory, duration].slice(
        -MAX_HISTORY_SIZE
      );
      const newCount = prev.renderCount + 1;
      const totalTime = prev.avgRenderTime * prev.renderCount + duration;
      const newAvg = totalTime / newCount;

      return {
        ...prev,
        renderCount: newCount,
        avgRenderTime: Math.round(newAvg * 100) / 100,
        renderHistory: newHistory,
      };
    });
  }, []);

  const setSignalsLoaded = useCallback((count: number) => {
    setMetrics((prev) => ({
      ...prev,
      signalsLoaded: count,
    }));
  }, []);

  const resetMetrics = useCallback(() => {
    setMetrics(initialMetrics);
  }, []);

  const startTimer = useCallback(() => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      return Math.round((end - start) * 100) / 100;
    };
  }, []);

  const value = useMemo(
    () => ({
      metrics,
      recordChartLoad,
      recordFetch,
      recordRender,
      setSignalsLoaded,
      resetMetrics,
      startTimer,
    }),
    [
      metrics,
      recordChartLoad,
      recordFetch,
      recordRender,
      setSignalsLoaded,
      resetMetrics,
      startTimer,
    ]
  );

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}
