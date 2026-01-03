import { Activity, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Signal {
  id: string;
  name: string;
  location: string;
  type: string;
}

interface SidebarProps {
  readonly signals: Signal[];
  readonly activeSignalIds: string[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly onToggleSignal: (id: string) => void;
}

/**
 * Sidebar Component
 *
 * Dumb component - receives all data and callbacks as props
 * Responsible for its own styling only
 */
export function Sidebar({
  signals,
  activeSignalIds,
  loading,
  error,
  onToggleSignal,
}: Readonly<SidebarProps>) {
  return (
    <aside
      data-testid="sidebar"
      className="w-64 h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border"
    >
      <div
        data-testid="sidebar-header"
        className="p-4 border-b border-sidebar-border flex items-center gap-2"
      >
        <Activity className="text-sidebar-primary" />
        <h1
          data-testid="app-title"
          className="font-bold text-lg tracking-tight"
        >
          MTSS Monitor
        </h1>
      </div>

      <div data-testid="signal-browser" className="flex-1 overflow-y-auto p-2">
        <h2
          data-testid="signal-browser-title"
          className="text-xs font-semibold text-muted-foreground uppercase mb-3 px-2 mt-2"
        >
          Signal Browser
        </h2>

        {loading && !signals.length && (
          <div
            data-testid="loading-spinner"
            className="p-4 text-muted-foreground"
          >
            <Loader2 className="animate-spin w-4 h-4" />
          </div>
        )}
        {error && (
          <div
            data-testid="error-message"
            className="p-4 text-destructive text-xs"
          >
            {error}
          </div>
        )}
        {!error && signals.length > 0 && (
          <div data-testid="signal-list" className="space-y-1">
            {signals.map((signal) => {
              const isSelected = activeSignalIds.includes(signal.id);
              return (
                <Button
                  key={signal.id}
                  data-testid={`signal-button-${signal.id}`}
                  data-selected={isSelected}
                  variant={isSelected ? 'secondary' : 'ghost'}
                  className={`w-full justify-start h-auto py-3 px-3 ${
                    isSelected
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => onToggleSignal(signal.id)}
                >
                  <div className="flex items-center w-full gap-3">
                    <div
                      data-testid={`signal-checkbox-${signal.id}`}
                      className={`flex items-center justify-center w-4 h-4 rounded border ${
                        isSelected
                          ? 'bg-sidebar-primary border-sidebar-primary'
                          : 'border-sidebar-border'
                      }`}
                    >
                      {isSelected && <Check size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 text-left">
                      <div
                        data-testid={`signal-name-${signal.id}`}
                        className="text-sm font-medium leading-none"
                      >
                        {signal.name}
                      </div>
                      <div
                        data-testid={`signal-location-${signal.id}`}
                        className="text-[10px] text-muted-foreground mt-1"
                      >
                        {signal.location}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
