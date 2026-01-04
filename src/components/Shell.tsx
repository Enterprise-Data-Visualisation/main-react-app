import { useState, useEffect } from 'react';
import { useSignalStore } from '../store';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CollapsibleBottomPanel } from './CollapsibleBottomPanel';
import { TimelineControls } from './TimelineControls';
import { LegendTable } from './LegendTable';
import { TelemetryMetrics } from './TelemetryMetrics';
import { TelemetryProvider, useTelemetry } from '@/contexts/TelemetryContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Timer, List, Activity } from 'lucide-react';
import { ChartArea } from './ChartArea';
import type { Signal } from '../types';
import { config } from '../config';

// Helper for GraphQL Fetch (Duplicate of Sidebar, could be a shared util)
async function fetchGraphQL(
  query: string,
  variables: Record<string, unknown> = {}
) {
  const response = await fetch(config.GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

const GET_ASSETS_BY_IDS_QUERY = `
  query GetAssetsByIds($ids: [ID!]!) {
    getAssetsByIds(ids: $ids) {
      id
      name
      type
    }
  }
`;

// Inner component that uses telemetry context
function ShellContent() {
  // State management
  const {
    activeSignalIds,
    hiddenSignalIds,
    toggleSignalVisibility,
    isLive,
    toggleLiveMode,
    dateRange,
    setDateRange,
    toggleSignal,
    customColors,
    setSignalColor,
    highlightedSignalId,
    setHighlightedSignal,
  } = useSignalStore();

  // Tab state
  const [activeTab, setActiveTab] = useState('timeline');

  // Get telemetry metrics from context
  const { metrics } = useTelemetry();

  // Data fetching (Fetch details for selected signals only)
  const [selectedSignals, setSelectedSignals] = useState<Signal[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      if (activeSignalIds.length === 0) {
        if (active) setSelectedSignals([]);
        return;
      }

      setError(null);
      try {
        const data = await fetchGraphQL(GET_ASSETS_BY_IDS_QUERY, {
          ids: activeSignalIds,
        });
        if (active) setSelectedSignals(data.getAssetsByIds);
      } catch (err: unknown) {
        if (active) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred');
          }
        }
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [activeSignalIds]);

  // Build URL with signal IDs and metadata (including colors)
  const COLORS = [
    '#3b82f6', // chart-1: Blue
    '#a855f7', // chart-2: Purple
    '#0ea5e9', // chart-3: Cyan
    '#10b981', // chart-4: Emerald/Teal
    '#f59e0b', // chart-5: Amber
  ];

  // Logic: "Hide" button simply excludes the signal from the Dash URL.
  // The Sidebar toggle adds/removes to activeSignalIds.
  // The LegendTable shows activeSignalIds (via selectedSignals), and uses hiddenSignalIds to toggle visibility.
  const visibleSignalIds = activeSignalIds.filter(
    (id) => !hiddenSignalIds.includes(id)
  );
  const signalsParam = visibleSignalIds.join(',');

  const signalsMetadata = selectedSignals.map((s: Signal, idx: number) => ({
    id: s.id,
    name: s.name,
    color: customColors[s.id] || COLORS[idx % COLORS.length],
    // If hidden, Dash app doesn't receive it via signalParam, so it shouldn't plot.
    // Metadata can include all selected signals or just visible ones.
    // If we only send visible IDs in signal_id param, Dash should handle it.
  }));

  // Theme context
  const { themeName, theme } = useTheme();

  // Use environment variable for Dash URL (dev vs prod)
  const baseUrl = config.DASH_URL;
  const tzOffset = new Date().getTimezoneOffset();
  const dashUrl = `${baseUrl}/?signal_id=${signalsParam}&signals=${encodeURIComponent(
    JSON.stringify(signalsMetadata)
  )}&live=${isLive}&theme=${themeName}&mode=${theme}&start=${encodeURIComponent(
    dateRange.start
  )}&end=${encodeURIComponent(
    dateRange.end
  )}&tz=${tzOffset}&highlight=${highlightedSignalId || ''}`;

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      {/* LEFT: Sidebar */}
      <Sidebar
        activeSignalIds={activeSignalIds}
        onToggleSignal={toggleSignal}
      />

      {/* RIGHT: Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-background/95">
        {/* TOP: Header */}
        <Header
          selectedSignalsCount={activeSignalIds.length}
          isLive={isLive}
          onToggleLiveMode={toggleLiveMode}
        />

        {/* MIDDLE: Chart Area */}
        <ChartArea
          dashUrl={dashUrl}
          hasSignalsSelected={visibleSignalIds.length > 0} // Only show chart if there are VISIBLE signals
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

            <TabsContent value="timeline" className="px-4 py-2">
              <TimelineControls
                dateRange={dateRange}
                isLive={isLive}
                onSetDateRange={setDateRange}
              />
            </TabsContent>

            <TabsContent value="legend" className="px-4 py-2">
              {error && (
                <div className="text-destructive text-sm mb-2">
                  Failed to load signal details: {error}
                </div>
              )}
              <LegendTable
                selectedSignals={selectedSignals}
                customColors={customColors}
                highlightedId={highlightedSignalId}
                hiddenIds={hiddenSignalIds}
                onToggle={toggleSignal} // Remains as Remove
                onHighlight={setHighlightedSignal}
                onColorChange={setSignalColor}
                onToggleVisibility={toggleSignalVisibility}
              />
            </TabsContent>

            <TabsContent value="telemetry" className="px-4 py-2">
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
