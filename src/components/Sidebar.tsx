import { useState } from 'react';
import {
  LayoutTemplate,
  Check,
  Loader2,
  ArrowLeftFromLine,
  ArrowRightFromLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      data-testid="sidebar"
      className={cn(
        'h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300 ease-in-out relative',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div
        data-testid="sidebar-header"
        className={cn(
          'h-14 flex items-center border-b border-sidebar-border px-3',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <LayoutTemplate className="text-sidebar-primary shrink-0" />
            <h1
              data-testid="app-title"
              className="font-bold text-lg tracking-tight whitespace-nowrap animate-in fade-in duration-200"
            >
              MTSS Monitor
            </h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ArrowRightFromLine size={16} />
          ) : (
            <ArrowLeftFromLine size={16} />
          )}
        </Button>
      </div>

      <div
        data-testid="signal-browser"
        className="flex-1 overflow-y-auto overflow-x-hidden p-2"
      >
        {!isCollapsed && (
          <h2
            data-testid="signal-browser-title"
            className="text-xs font-semibold text-muted-foreground uppercase mb-3 px-2 mt-2 animate-in fade-in"
          >
            Signal Browser
          </h2>
        )}

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
                  className={cn(
                    'w-full justify-start h-auto py-2 px-2 transition-colors',
                    isSelected
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground'
                  )}
                  onClick={() => onToggleSignal(signal.id)}
                  title={isCollapsed ? signal.name : undefined}
                >
                  <div className="flex items-center w-full gap-3">
                    {!isCollapsed && (
                      <div
                        data-testid={`signal-checkbox-${signal.id}`}
                        className={cn(
                          'flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors',
                          isSelected
                            ? 'bg-sidebar-primary border-sidebar-primary'
                            : 'border-sidebar-border'
                        )}
                      >
                        {isSelected && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>
                    )}
                    {!isCollapsed && (
                      <div className="flex-1 text-left overflow-hidden animate-in fade-in duration-200">
                        <div
                          data-testid={`signal-name-${signal.id}`}
                          className="text-sm font-medium leading-none truncate"
                        >
                          {signal.name}
                        </div>
                        <div
                          data-testid={`signal-location-${signal.id}`}
                          className="text-[10px] text-muted-foreground mt-1 truncate"
                        >
                          {signal.location}
                        </div>
                      </div>
                    )}
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
