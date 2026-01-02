import { Switch } from "@/components/ui/switch";

interface HeaderProps {
  readonly selectedSignalsCount: number;
  readonly isLive: boolean;
  readonly onToggleLiveMode: () => void;
}

/**
 * Header Component
 *
 * Dumb component - receives all data and callbacks as props
 * Responsible for its own styling only
 */
export function Header({
  selectedSignalsCount,
  isLive,
  onToggleLiveMode,
}: Readonly<HeaderProps>) {
  return (
    <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shadow-sm shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-zinc-800">Asset Dashboard</h2>
        <div className="h-6 w-px bg-zinc-200"></div>
        <div className="text-xs text-zinc-500">
          {selectedSignalsCount} Signals Selected
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-medium ${
            isLive ? "text-red-500" : "text-zinc-600"
          }`}
        >
          {isLive ? "Live Stream" : "Historical"}
        </span>
        <Switch checked={isLive} onCheckedChange={onToggleLiveMode} />
      </div>
    </header>
  );
}
