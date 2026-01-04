import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { useSignalStore } from '../store';

interface HeaderProps {
  readonly selectedSignalsCount: number;
  readonly isLive: boolean;
  readonly onToggleLiveMode: () => void;
}

// Helper for GraphQL Fetch (Duplicate for now)
import { config } from '../config';

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

const SAVE_SNAPSHOT_MUTATION = `
  mutation SaveSnapshot($name: String!, $activeSignalIds: [String]!, $hiddenSignalIds: [String]!, $dateRange: String!, $customColors: String) {
    saveSnapshot(name: $name, activeSignalIds: $activeSignalIds, hiddenSignalIds: $hiddenSignalIds, dateRange: $dateRange, customColors: $customColors) {
      id
    }
  }
`;

/**
 * Header Component
 */
export function Header({
  selectedSignalsCount,
  isLive,
  onToggleLiveMode,
}: Readonly<HeaderProps>) {
  const [isSaving, setIsSaving] = useState(false);

  // Get Store State for Saving
  const activeSignalIds = useSignalStore((state) => state.activeSignalIds);
  const hiddenSignalIds = useSignalStore((state) => state.hiddenSignalIds);
  const dateRange = useSignalStore((state) => state.dateRange);
  const customColors = useSignalStore((state) => state.customColors);

  const handleSaveView = async () => {
    const name = globalThis.prompt('Enter a name for this view:');
    if (!name) return;

    setIsSaving(true);
    try {
      await fetchGraphQL(SAVE_SNAPSHOT_MUTATION, {
        name,
        activeSignalIds,
        hiddenSignalIds,
        dateRange: JSON.stringify(dateRange),
        customColors: JSON.stringify(customColors),
      });
      alert('View saved successfully!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert('Failed to save view: ' + err.message);
      } else {
        alert('Failed to save view: An unknown error occurred');
      }
    } finally {
      setIsSaving(false);
    }
  };

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
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveView}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save View
        </Button>
        <div className="h-6 w-px bg-border"></div>

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
