import { useState, useEffect } from 'react';
import { useSignalStore } from '../store';
import {
  LayoutTemplate,
  Check,
  Loader2,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Search,
  Folder,
  ChevronRight,
  Home,
  Save,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Asset, Snapshot } from '../types';

// Interfaces
interface SidebarProps {
  readonly activeSignalIds: string[];
  readonly onToggleSignal: (id: string) => void;
}

import { config } from '../config';

// Helper for GraphQL Fetch
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
  if (json?.errors) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

// Queries
const SEARCH_ASSETS_QUERY = `
  query SearchAssets($query: String!) {
    searchAssets(query: $query) {
      id
      name
      type
    }
  }
`;

const GET_CHILDREN_QUERY = `
  query GetChildren($parentId: ID) {
    assets(parentId: $parentId) {
      id
      name
      type
    }
  }
`;

const GET_ASSET_PATH_QUERY = `
  query GetAssetPath($id: ID!) {
    getAssetPath(id: $id) {
      id
      name
    }
  }
`;

const GET_SNAPSHOTS_QUERY = `
  query GetSnapshots {
    snapshots {
      id
      name
      createdAt
      activeSignalIds
      hiddenSignalIds
      dateRange
      customColors
    }
  }
`;

const DELETE_SNAPSHOT_MUTATION = `
  mutation DeleteSnapshot($id: ID!) {
    deleteSnapshot(id: $id)
  }
`;

// --- Fetch Helper Functions (Extracted to reduce complexity) ---

async function fetchSearchResults(query: string) {
  if (query.trim().length <= 1) return [];
  const data = await fetchGraphQL(SEARCH_ASSETS_QUERY, { query });
  return data.searchAssets;
}

async function fetchBrowseResults(parentId: string | null) {
  const data = await fetchGraphQL(GET_CHILDREN_QUERY, { parentId });
  return data.assets;
}

async function fetchAssetPath(id: string | null) {
  if (!id) return [];
  const data = await fetchGraphQL(GET_ASSET_PATH_QUERY, { id });
  return data.getAssetPath;
}

// Helper: Empty State Message
function getEmptyStateMessage(viewMode: 'BROWSE' | 'SEARCH', query: string) {
  if (viewMode === 'BROWSE') return 'No assets found.';
  if (query.trim().length < 2) return 'Type to search...';
  return 'No results found.';
}

// Sub-component: AssetItem
function AssetItem({
  asset,
  isSelected,
  isCollapsed,
  onInteraction,
}: Readonly<{
  asset: Asset;
  isSelected: boolean;
  isCollapsed: boolean;
  onInteraction: (asset: Asset) => void;
}>) {
  const isSignal = asset.type === 'Signal';

  return (
    <Button
      variant="ghost"
      className={cn(
        'w-full justify-start h-auto py-2 px-2 text-sm font-normal',
        isSelected && isSignal
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-muted-foreground hover:text-foreground'
      )}
      onClick={() => onInteraction(asset)}
      title={asset.name}
    >
      <div className="flex items-center w-full gap-2">
        <div className="shrink-0">
          {isSignal ? (
            <div
              className={cn(
                'w-4 h-4 border rounded flex items-center justify-center transition-colors',
                isSelected
                  ? 'bg-sidebar-primary border-sidebar-primary text-white'
                  : 'border-sidebar-border'
              )}
            >
              {isSelected && <Check size={10} />}
            </div>
          ) : (
            <Folder className="h-4 w-4 text-sidebar-primary/70" />
          )}
        </div>
        {!isCollapsed && (
          <div className="flex-1 text-left min-w-0">
            <div className="truncate font-medium">{asset.name}</div>
            <div className="text-[10px] text-muted-foreground/70 truncate">
              {asset.type}
            </div>
          </div>
        )}
        {!isCollapsed && !isSignal && (
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 ml-auto" />
        )}
      </div>
    </Button>
  );
}

// Sub-component: AssetsTab
interface AssetsTabProps {
  isCollapsed: boolean;
  viewMode: 'BROWSE' | 'SEARCH';
  searchQuery: string;
  debouncedSearchQuery: string;
  handleSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentParentId: string | null;
  handleBreadcrumbClick: (id: string | null) => void;
  path: Asset[];
  isLoading: boolean;
  error: string | null;
  assets: Asset[];
  activeSignalIds: string[];
  handleItemClick: (asset: Asset) => void;
}

function AssetsTab({
  isCollapsed,
  viewMode,
  searchQuery,
  handleSearchInput,
  currentParentId,
  handleBreadcrumbClick,
  path,
  isLoading,
  error,
  assets,
  activeSignalIds,
  handleItemClick,
}: Readonly<AssetsTabProps>) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search Bar */}
      {!isCollapsed && (
        <div className="p-3 border-b border-sidebar-border bg-sidebar/50">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="pl-8 bg-background/50 border-sidebar-border text-sm"
            />
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      {!isCollapsed && viewMode === 'BROWSE' && (
        <div className="px-3 py-2 flex items-center flex-wrap gap-1 text-xs border-b border-sidebar-border bg-muted/20">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => handleBreadcrumbClick(null)}
            disabled={!currentParentId}
          >
            <Home className="h-3 w-3" />
          </Button>

          {path.map((item) => (
            <div key={item.id} className="flex items-center">
              <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
              <button
                type="button"
                className={cn(
                  'cursor-pointer hover:underline hover:text-primary truncate max-w-[80px] bg-transparent border-0 p-0 text-left',
                  item.id === currentParentId && 'font-bold'
                )}
                onClick={() => handleBreadcrumbClick(item.id)}
              >
                {item.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading && (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin h-5 w-5 text-sidebar-primary" />
            </div>
          )}

          {error && (
            <div className="text-center p-4 text-sm text-destructive">
              Error: {error}
            </div>
          )}

          {!isLoading && !error && assets?.length === 0 && (
            <div className="text-center p-4 text-sm text-muted-foreground">
              {getEmptyStateMessage(viewMode, searchQuery)}
            </div>
          )}

          {!isLoading &&
            assets?.map((asset) => (
              <AssetItem
                key={asset.id}
                asset={asset}
                isSelected={activeSignalIds.includes(asset.id)}
                isCollapsed={isCollapsed}
                onInteraction={handleItemClick}
              />
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Sub-component: SnapshotsTab
interface SnapshotsTabProps {
  isLoading: boolean;
  snapshots: Snapshot[];
  fetchSnapshots: () => void;
  handleDeleteSnapshot: (id: string, e: React.MouseEvent) => void;
  handleLoadSnapshot: (snapshot: Snapshot) => void;
}

function SnapshotsTab({
  isLoading,
  snapshots,
  fetchSnapshots,
  handleDeleteSnapshot,
  handleLoadSnapshot,
}: Readonly<SnapshotsTabProps>) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-2">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin h-5 w-5 text-sidebar-primary" />
          </div>
        )}

        {!isLoading && snapshots?.length === 0 && (
          <div className="text-center p-6 text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Save className="h-8 w-8 opacity-20" />
            <p>No saved views yet.</p>
            <p className="text-xs opacity-70">
              Save your current view using the button in the header.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSnapshots}
              className="mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-2" /> Refresh
            </Button>
          </div>
        )}

        {snapshots?.map((snap) => (
          <div
            key={snap.id}
            className="group flex flex-col gap-1 p-3 rounded-md border border-sidebar-border bg-sidebar/30 hover:bg-sidebar/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm truncate">{snap.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={(e) => handleDeleteSnapshot(snap.id, e)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-[10px] text-muted-foreground">
              {new Date(snap.createdAt).toLocaleDateString()}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {snap.activeSignalIds.length} signals
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="w-full mt-1 h-7 text-xs"
              onClick={() => handleLoadSnapshot(snap)}
            >
              Load View
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function Sidebar({
  activeSignalIds,
  onToggleSignal,
}: Readonly<SidebarProps>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'BROWSE' | 'SEARCH'>('BROWSE');
  const [activeTab, setActiveTab] = useState('assets');

  // Store Actions
  const restoreSnapshot = useSignalStore((state) => state.restoreSnapshot);

  // Data State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [path, setPath] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce Search Query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Helper to get assets and path based on view mode
  async function fetchAssetsForView(
    viewMode: 'BROWSE' | 'SEARCH',
    debouncedSearchQuery: string,
    currentParentId: string | null
  ): Promise<{ assets: Asset[]; path?: Asset[] }> {
    if (viewMode === 'SEARCH') {
      if (debouncedSearchQuery.trim().length > 1) {
        const results = await fetchSearchResults(debouncedSearchQuery);
        return { assets: results };
      }
      return { assets: [] };
    }

    // Browse Mode
    const [assets, path] = await Promise.all([
      fetchBrowseResults(currentParentId),
      fetchAssetPath(currentParentId),
    ]);

    return { assets, path };
  }

  // Fetch Logic: Refactored to reduce complexity
  useEffect(() => {
    if (activeTab !== 'assets') return;

    let active = true;

    const runFetch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { assets: fetchedAssets, path: fetchedPath } =
          await fetchAssetsForView(
            viewMode,
            debouncedSearchQuery,
            currentParentId
          );

        if (active) {
          setAssets(fetchedAssets);
          if (fetchedPath) setPath(fetchedPath);
        }
      } catch (err: unknown) {
        if (active) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred');
          }
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    runFetch();
    return () => {
      active = false;
    };
  }, [currentParentId, debouncedSearchQuery, viewMode, activeTab]);

  const fetchSnapshots = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGraphQL(GET_SNAPSHOTS_QUERY);
      setSnapshots(data.snapshots || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'snapshots') {
      fetchSnapshots();
    }
  }, [activeTab]);

  const handleDeleteSnapshot = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!globalThis.confirm('Are you sure you want to delete this snapshot?'))
      return;
    try {
      await fetchGraphQL(DELETE_SNAPSHOT_MUTATION, { id });
      fetchSnapshots(); // Reload
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert('Failed to delete: ' + err.message);
      } else {
        alert('Failed to delete: An unknown error occurred');
      }
    }
  };

  const handleLoadSnapshot = (snapshot: Snapshot) => {
    restoreSnapshot(snapshot);
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 1) {
      setViewMode('SEARCH');
    } else {
      setViewMode('BROWSE');
    }
  };

  const handleItemClick = (asset: Asset) => {
    if (asset.type === 'Signal') {
      onToggleSignal(asset.id);
    } else {
      // Drill down
      setCurrentParentId(asset.id);
      setViewMode('BROWSE');
      setSearchQuery(''); // Clear search on drill down
    }
  };

  const handleBreadcrumbClick = (id: string | null) => {
    setCurrentParentId(id);
    setViewMode('BROWSE');
  };

  return (
    <aside
      data-testid="sidebar"
      className={cn(
        'h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300 ease-in-out relative',
        isCollapsed ? 'w-16' : 'w-80'
      )}
    >
      <div
        data-testid="sidebar-header"
        className={cn(
          'h-14 flex items-center border-b border-sidebar-border px-3 gap-2',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <LayoutTemplate className="text-sidebar-primary shrink-0" />
            <h1 className="font-bold text-lg tracking-tight whitespace-nowrap">
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

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        {!isCollapsed && (
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-sidebar-border bg-transparent p-0 h-10">
            <TabsTrigger
              value="assets"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted/10 h-full"
            >
              Assets
            </TabsTrigger>
            <TabsTrigger
              value="snapshots"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted/10 h-full"
            >
              Saved Views
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent
          value="assets"
          className="flex-1 flex flex-col min-h-0 m-0 data-[state=inactive]:hidden"
        >
          <AssetsTab
            isCollapsed={isCollapsed}
            viewMode={viewMode}
            searchQuery={searchQuery}
            debouncedSearchQuery={debouncedSearchQuery}
            handleSearchInput={handleSearchInput}
            currentParentId={currentParentId}
            handleBreadcrumbClick={handleBreadcrumbClick}
            path={path}
            isLoading={isLoading}
            error={error}
            assets={assets}
            activeSignalIds={activeSignalIds}
            handleItemClick={handleItemClick}
          />
        </TabsContent>

        <TabsContent
          value="snapshots"
          className="flex-1 flex flex-col min-h-0 m-0 data-[state=inactive]:hidden"
        >
          <SnapshotsTab
            isLoading={isLoading}
            snapshots={snapshots}
            fetchSnapshots={fetchSnapshots}
            handleDeleteSnapshot={handleDeleteSnapshot}
            handleLoadSnapshot={handleLoadSnapshot}
          />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
