import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeSelector } from '@/components/ThemeSelector';

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
    <header
      data-testid="header"
      className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm shrink-0"
    >
      <div className="flex items-center gap-4">
        <h2
          data-testid="dashboard-title"
          className="font-semibold text-foreground"
        >
          Asset Dashboard
        </h2>
        <div className="h-6 w-px bg-border"></div>
        <div
          data-testid="signal-count"
          className="text-xs text-muted-foreground"
        >
          {selectedSignalsCount} Signals Selected
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          data-testid="live-status"
          className={`text-sm font-medium ${
            isLive ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {isLive ? 'Live Stream' : 'Historical'}
        </span>
        <Switch
          data-testid="live-toggle"
          checked={isLive}
          onCheckedChange={onToggleLiveMode}
        />
        <div className="h-6 w-px bg-border"></div>
        <ThemeSelector />
        <div className="h-6 w-px bg-border"></div>
        <ThemeToggle />
      </div>
    </header>
  );
}
