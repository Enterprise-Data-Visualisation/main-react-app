import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTelemetry } from '@/contexts/TelemetryContext';
import {
  Timer,
  Activity,
  RefreshCw,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

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
              className={`w-2 rounded-t ${barColors[status]} opacity-${50 + Math.floor((i / history.length) * 50)}`}
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

export function TelemetryPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { metrics } = useTelemetry();

  // Keyboard shortcut Ctrl+T to toggle
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        setIsExpanded((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      data-testid="telemetry-panel"
      className="border-t border-border bg-background"
    >
      {/* Toggle Button */}
      <Button
        data-testid="telemetry-toggle"
        variant="ghost"
        size="sm"
        className="w-full flex items-center justify-center gap-2 h-8 rounded-none hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse Telemetry' : 'Expand Telemetry'}
      >
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Telemetry</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
        {/* Quick metrics in collapsed state */}
        {!isExpanded && metrics.chartLoadTime !== null && (
          <span className="text-xs text-muted-foreground ml-2 font-mono">
            Load: {metrics.chartLoadTime}ms | Fetches:{' '}
            {metrics.fetchHistory.length}
          </span>
        )}
      </Button>

      {/* Expanded Panel */}
      {isExpanded && (
        <Card
          data-testid="telemetry-content"
          className="border-0 rounded-none shadow-none"
        >
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance Metrics
              <span className="text-xs font-normal text-muted-foreground ml-auto">
                Ctrl+T to toggle
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent data-testid="telemetry-metrics" className="py-2 px-4">
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
      )}
    </div>
  );
}
