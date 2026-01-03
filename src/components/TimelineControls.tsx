import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';

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
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Current range as timestamps
    const startTime = new Date(dateRange.start).getTime();
    const endTime = new Date(dateRange.end).getTime();

    // Convert to slider values
    const sliderValues = [
        timestampToSlider(startTime, sevenDaysAgo, now),
        timestampToSlider(endTime, sevenDaysAgo, now),
    ];

    const handleSliderChange = (values: number[]) => {
        const newStart = sliderToTimestamp(values[0], sevenDaysAgo, now);
        const newEnd = sliderToTimestamp(values[1], sevenDaysAgo, now);
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
            <CardHeader className="pb-3 pt-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Range
                    {isLive && (
                        <span className="ml-auto text-xs font-normal text-muted-foreground">
                            Disabled during live mode
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Date labels */}
                <div className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Start: {formatDateTime(dateRange.start)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>End: {formatDateTime(dateRange.end)}</span>
                    </div>
                </div>

                {/* Dual-handle Slider */}
                <div className="px-2 py-4">
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
                <div className="flex justify-between text-[10px] text-muted-foreground/60">
                    <span>7 days ago</span>
                    <span>Now</span>
                </div>
            </CardContent>
        </Card>
    );
}
