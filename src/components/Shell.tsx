import { useSignalStore } from "../store";
import { useGraphql } from "../hooks/useGraphQL";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomPanel } from "./BottomPanel";
import { CollapsibleBottomPanel } from "./CollapsibleBottomPanel";
import type { GetSignalsData } from "@/types";
import { ChartArea } from "./ChartArea";

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
  // State management
  const {
    activeSignalIds,
    isLive,
    toggleLiveMode,
    dateRange,
    setDateRange,
    toggleSignal,
  } = useSignalStore();

  // Data fetching
  const { loading, error, data } =
    useGraphql<GetSignalsData>(GET_SIGNALS_QUERY);

  // Derived data
  const selectedSignals =
    data?.getSignals.filter((s) => activeSignalIds.includes(s.id)) || [];

  // Build URL with signal IDs and metadata (including colors)
  const COLORS = [
    "#3b82f6", // chart-1: Blue
    "#a855f7", // chart-2: Purple
    "#0ea5e9", // chart-3: Cyan
    "#10b981", // chart-4: Emerald/Teal
    "#f59e0b", // chart-5: Amber
  ];
  const signalsParam = activeSignalIds.join(",");
  const signalsMetadata = selectedSignals.map((s, idx) => ({
    id: s.id,
    name: s.name,
    color: COLORS[idx % COLORS.length],
  }));

  const dashUrl = `http://localhost:8050/?signal_id=${signalsParam}&signals=${encodeURIComponent(
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

        {/* BOTTOM: Timeline & Legend (Collapsible) */}
        <CollapsibleBottomPanel title="Timeline & Legend" defaultOpen={true}>
          <BottomPanel
            dateRange={dateRange}
            isLive={isLive}
            selectedSignals={selectedSignals}
            onSetDateRange={setDateRange}
          />
        </CollapsibleBottomPanel>
      </main>
    </div>
  );
}
