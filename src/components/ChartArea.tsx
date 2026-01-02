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
    <div className="flex-1 bg-background p-4 relative min-h-0">
      <div className="w-full h-full bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {hasSignalsSelected ? (
          <iframe
            src={dashUrl}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
            title="chart"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Select a signal from the sidebar
          </div>
        )}
      </div>
    </div>
  );
}
