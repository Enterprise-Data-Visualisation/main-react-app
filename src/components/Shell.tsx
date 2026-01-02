import { useSignalStore } from "../store";
import { useGraphql } from "../hooks/useGraphQL";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomPanel } from "./BottomPanel";
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
    "#2563eb",
    "#dc2626",
    "#16a34a",
    "#d97706",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#f59e0b",
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
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
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

        {/* BOTTOM: Timeline & Legend */}
        <BottomPanel
          dateRange={dateRange}
          isLive={isLive}
          selectedSignals={selectedSignals}
          onSetDateRange={setDateRange}
        />
      </main>
    </div>
  );
}
