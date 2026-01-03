import { useState } from 'react';
import { useSignalStore } from '../store';
import { useGraphql } from '../hooks/useGraphQL';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CollapsibleBottomPanel } from './CollapsibleBottomPanel';
import { TimelineControls } from './TimelineControls';
import { LegendTable } from './LegendTable';
import { TelemetryMetrics } from './TelemetryMetrics';
import { TelemetryProvider, useTelemetry } from '@/contexts/TelemetryContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Timer, List, Activity } from 'lucide-react';
import type { GetSignalsData } from '@/types';
import { ChartArea } from './ChartArea';

const GET_SIGNALS_QUERY = `
  query GetSignals {
    getSignals {
      id
      name
      location
      type
    }
  }
`;

// Inner component that uses telemetry context
function ShellContent() {
  // State management
  const {
    activeSignalIds,
    isLive,
    toggleLiveMode,
    dateRange,
    setDateRange,
    toggleSignal,
  } = useSignalStore();

  // Tab state
  const [activeTab, setActiveTab] = useState('timeline');

  // Get telemetry metrics from context
  const { metrics } = useTelemetry();

  // Data fetching
  const { loading, error, data } =
    useGraphql<GetSignalsData>(GET_SIGNALS_QUERY);

  // Derived data
  const selectedSignals =
    data?.getSignals.filter((s) => activeSignalIds.includes(s.id)) || [];

  // Build URL with signal IDs and metadata (including colors)
  const COLORS = [
    '#3b82f6', // chart-1: Blue
    '#a855f7', // chart-2: Purple
    '#0ea5e9', // chart-3: Cyan
    '#10b981', // chart-4: Emerald/Teal
    '#f59e0b', // chart-5: Amber
  ];
  const signalsParam = activeSignalIds.join(',');
  const signalsMetadata = selectedSignals.map((s, idx) => ({
    id: s.id,
    name: s.name,
    color: COLORS[idx % COLORS.length],
  }));

  const dashUrl = `https://main-dash-app.onrender.com/?signal_id=${signalsParam}&signals=${encodeURIComponent(
    JSON.stringify(signalsMetadata)
  )}&live=${isLive}&start=${encodeURIComponent(
    dateRange.start
  )}&end=${encodeURIComponent(dateRange.end)}`;

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      {/* LEFT: Sidebar */}
      <Sidebar
        signals={data?.getSignals || []}
        activeSignalIds={activeSignalIds}
        loading={loading}
        error={error}
        onToggleSignal={toggleSignal}
      />

      {/* RIGHT: Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* TOP: Header */}
        <Header
          selectedSignalsCount={activeSignalIds.length}
          isLive={isLive}
          onToggleLiveMode={toggleLiveMode}
        />

        {/* MIDDLE: Chart Area */}
        <ChartArea
          dashUrl={dashUrl}
          hasSignalsSelected={activeSignalIds.length > 0}
        />

        {/* BOTTOM: Tabbed Panel (Collapsible) */}
        <CollapsibleBottomPanel title="Controls & Details" defaultOpen={true}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full h-full"
          >
            <TabsList data-testid="bottom-panel-tabs">
              <TabsTrigger value="timeline" data-testid="tab-timeline">
                <Timer className="mr-2 h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="legend" data-testid="tab-legend">
                <List className="mr-2 h-4 w-4" />
                Legend
              </TabsTrigger>
              <TabsTrigger value="telemetry" data-testid="tab-telemetry">
                <Activity className="mr-2 h-4 w-4" />
                Telemetry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="px-4 pb-4">
              <TimelineControls
                dateRange={dateRange}
                isLive={isLive}
                onSetDateRange={setDateRange}
              />
            </TabsContent>

            <TabsContent value="legend" className="px-4 pb-4">
              <LegendTable selectedSignals={selectedSignals} />
            </TabsContent>

            <TabsContent value="telemetry" className="px-4 pb-4">
              <TelemetryMetrics metrics={metrics} />
            </TabsContent>
          </Tabs>
        </CollapsibleBottomPanel>
      </main>
    </div>
  );
}

/**
 * Shell Component
 *
 * Responsible for:
 * - Managing all application state via Zustand
 * - Fetching data
 * - Deciding layout structure
 * - Passing props down to dumb components
 */
export function Shell() {
  return (
    <TelemetryProvider>
      <ShellContent />
    </TelemetryProvider>
  );
}
