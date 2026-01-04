import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';

interface DateRange {
  start: string;
  end: string;
}

interface TimelineControlsProps {
  readonly dateRange: DateRange;
  readonly isLive: boolean;
  readonly onSetDateRange: (range: DateRange) => void;
}

// Helper to format date for display
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Convert slider value (0-100) to timestamp within the range
function sliderToTimestamp(
  value: number,
  minTime: number,
  maxTime: number
): number {
  return minTime + (value / 100) * (maxTime - minTime);
}

// Convert timestamp to slider value (0-100)
function timestampToSlider(
  timestamp: number,
  minTime: number,
  maxTime: number
): number {
  if (maxTime === minTime) return 50;
  return ((timestamp - minTime) / (maxTime - minTime)) * 100;
}

/**
 * TimelineControls Component
 *
 * Dumb component - receives all data and callbacks as props.
 * Provides a dual-handle slider for quick time range selection.
 */
export function TimelineControls({
  dateRange,
  isLive,
  onSetDateRange,
}: Readonly<TimelineControlsProps>) {
  // Define the overall timeline bounds (e.g., last 7 days to now)
  // Update 'now' every minute to prevent the slider from becoming stale relative to real time
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

  // Current range as timestamps
  const startTime = new Date(dateRange.start).getTime();
  const endTime = new Date(dateRange.end).getTime();

  // Convert to slider values
  const sliderValues = [
    timestampToSlider(startTime, oneYearAgo, now),
    timestampToSlider(endTime, oneYearAgo, now),
  ];

  const handleSliderChange = (values: number[]) => {
    const newStart = sliderToTimestamp(values[0], oneYearAgo, now);
    const newEnd = sliderToTimestamp(values[1], oneYearAgo, now);
    onSetDateRange({
      start: new Date(newStart).toISOString(),
      end: new Date(newEnd).toISOString(),
    });
  };

  return (
    <Card
      data-testid="timeline-controls"
      className="border-0 shadow-none bg-transparent"
    >
      <CardContent className="space-y-2 p-0">
        {/* Date labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <div className="flex items-center gap-1">
            <span>{formatDateTime(dateRange.start)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{formatDateTime(dateRange.end)}</span>
          </div>
        </div>

        {/* Dual-handle Slider */}
        <div className="px-1 py-1">
          <Slider
            data-testid="timeline-slider"
            value={sliderValues}
            onValueChange={handleSliderChange}
            min={0}
            max={100}
            step={0.1}
            disabled={isLive}
            className="w-full"
          />
        </div>

        {/* Timeline bounds */}
        <div className="flex justify-between text-[9px] text-muted-foreground/50">
          <span>-1y</span>
          <span>Now</span>
        </div>
      </CardContent>
    </Card>
  );
}
