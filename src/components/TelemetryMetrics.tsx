import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, Activity, RefreshCw, BarChart3 } from 'lucide-react';

export interface TelemetryMetricsData {
    chartLoadTime: number | null;
    lastFetchDuration: number | null;
    fetchHistory: number[];
    renderCount: number;
    renderHistory: number[];
    avgRenderTime: number;
    signalsLoaded: number;
}

interface MetricCardProps {
    readonly title: string;
    readonly value: string | number;
    readonly unit?: string;
    readonly icon: React.ReactNode;
    readonly history?: number[];
    readonly status?: 'good' | 'warning' | 'critical';
}

function MetricCard({
    title,
    value,
    unit = 'ms',
    icon,
    history = [],
    status = 'good',
}: Readonly<MetricCardProps>) {
    const statusColors = {
        good: 'text-green-500',
        warning: 'text-yellow-500',
        critical: 'text-red-500',
    };

    const barColors = {
        good: 'bg-green-500',
        warning: 'bg-yellow-500',
        critical: 'bg-red-500',
    };

    const maxHistory = Math.max(...history, 1);

    return (
        <div className="flex flex-col gap-2 p-3 bg-card/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {icon}
                <span>{title}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-xl font-mono font-bold ${statusColors[status]}`}>
                    {value === null ? '--' : value}
                </span>
                {value !== null && (
                    <span className="text-xs text-muted-foreground">{unit}</span>
                )}
            </div>
            {history.length > 0 && (
                <div className="flex items-end gap-0.5 h-6">
                    {history.map((h, i) => (
                        <div
                            key={i}
                            className={`w-2 rounded-t ${barColors[status]}`}
                            style={{
                                height: `${(h / maxHistory) * 100}%`,
                                minHeight: '2px',
                                opacity: 0.5 + (i / history.length) * 0.5,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function getLoadTimeStatus(ms: number | null): 'good' | 'warning' | 'critical' {
    if (ms === null) return 'good';
    if (ms < 1000) return 'good';
    if (ms < 3000) return 'warning';
    return 'critical';
}

function getFetchStatus(ms: number | null): 'good' | 'warning' | 'critical' {
    if (ms === null) return 'good';
    if (ms < 500) return 'good';
    if (ms < 1500) return 'warning';
    return 'critical';
}

interface TelemetryMetricsProps {
    readonly metrics: TelemetryMetricsData;
}

/**
 * TelemetryMetrics Component
 *
 * Dumb component - receives metrics as props.
 * Displays performance metrics in a grid layout.
 */
export function TelemetryMetrics({
    metrics,
}: Readonly<TelemetryMetricsProps>) {
    return (
        <Card
            data-testid="telemetry-metrics"
            className="border-0 shadow-none bg-transparent"
        >
            <CardHeader className="py-2 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Performance Metrics
                </CardTitle>
            </CardHeader>
            <CardContent data-testid="telemetry-metrics-content" className="py-2 px-4">
                <div className="grid grid-cols-4 gap-4">
                    <MetricCard
                        title="Chart Load Time"
                        value={metrics.chartLoadTime ?? '--'}
                        icon={<Timer className="w-3 h-3" />}
                        status={getLoadTimeStatus(metrics.chartLoadTime)}
                    />
                    <MetricCard
                        title="Last Fetch"
                        value={metrics.lastFetchDuration ?? '--'}
                        icon={<RefreshCw className="w-3 h-3" />}
                        history={metrics.fetchHistory}
                        status={getFetchStatus(metrics.lastFetchDuration)}
                    />
                    <MetricCard
                        title="Render Count"
                        value={metrics.renderCount}
                        unit="renders"
                        icon={<Activity className="w-3 h-3" />}
                    />
                    <MetricCard
                        title="Avg Render Time"
                        value={metrics.avgRenderTime}
                        icon={<BarChart3 className="w-3 h-3" />}
                        history={metrics.renderHistory}
                        status={getLoadTimeStatus(metrics.avgRenderTime)}
                    />
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Signals Loaded: {metrics.signalsLoaded}</span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> Good
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" /> Warning
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> Critical
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
