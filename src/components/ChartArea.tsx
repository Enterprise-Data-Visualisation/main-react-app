interface ChartAreaProps {
  readonly dashUrl: string;
  readonly hasSignalsSelected: boolean;
}

/**
 * ChartArea Component
 *
 * Dumb component - displays chart based on props
 * Responsible for its own styling only
 */
export function ChartArea({
  dashUrl,
  hasSignalsSelected,
}: Readonly<ChartAreaProps>) {
  return (
    <div className="flex-1 bg-zinc-100 p-4 relative min-h-0">
      <div className="w-full h-full bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        {hasSignalsSelected ? (
          <iframe
            src={dashUrl}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
            title="chart"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            Select a signal from the sidebar
          </div>
        )}
      </div>
    </div>
  );
}
