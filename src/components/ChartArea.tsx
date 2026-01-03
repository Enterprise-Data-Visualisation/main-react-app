import { useRef, useCallback, useEffect } from 'react';
import { useTelemetry } from '@/contexts/TelemetryContext';

interface ChartAreaProps {
  readonly dashUrl: string;
  readonly hasSignalsSelected: boolean;
}

/**
 * ChartArea Component
 *
 * Dumb component - displays chart based on props
 * Responsible for its own styling only
 * Instrumented for telemetry: tracks iframe load time
 */
export function ChartArea({
  dashUrl,
  hasSignalsSelected,
}: Readonly<ChartAreaProps>) {
  const { recordChartLoad, recordRender, setSignalsLoaded, startTimer } =
    useTelemetry();
  const loadTimerRef = useRef<(() => number) | null>(null);

  // Start timer when URL changes (new chart load)
  useEffect(() => {
    if (hasSignalsSelected) {
      loadTimerRef.current = startTimer();
      recordRender(0); // Record render attempt
    }
  }, [dashUrl, hasSignalsSelected, startTimer, recordRender]);

  // Handle iframe load complete
  const handleIframeLoad = useCallback(() => {
    if (loadTimerRef.current) {
      const duration = loadTimerRef.current();
      recordChartLoad(duration);
      loadTimerRef.current = null;
    }
  }, [recordChartLoad]);

  // Update signals loaded count
  useEffect(() => {
    const signalCount = hasSignalsSelected
      ? dashUrl.split('signal_id=')[1]?.split('&')[0]?.split(',').length || 0
      : 0;
    setSignalsLoaded(signalCount);
  }, [dashUrl, hasSignalsSelected, setSignalsLoaded]);

  return (
    <div
      data-testid="chart-area"
      className="flex-1 bg-background relative min-h-0"
    >
      <div
        data-testid="chart-container"
        className="w-full h-full bg-card shadow-sm overflow-hidden"
      >
        {hasSignalsSelected ? (
          <iframe
            data-testid="chart-iframe"
            src={dashUrl}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
            title="chart"
            onLoad={handleIframeLoad}
          />
        ) : (
          <div
            data-testid="empty-chart-state"
            className="w-full h-full flex items-center justify-center text-muted-foreground"
          >
            Select a signal from the sidebar
          </div>
        )}
      </div>
    </div>
  );
}
