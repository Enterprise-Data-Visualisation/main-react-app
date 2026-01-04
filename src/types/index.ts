export interface Asset {
  id: string;
  name: string;
  type: string;
  parentId?: string | null;
  children?: Asset[];
}

export interface Signal extends Asset {
  type: 'Signal';
}

export interface Snapshot {
  id: string;
  name: string;
  createdAt: string;
  activeSignalIds: string[];
  hiddenSignalIds: string[];
  dateRange: { start: string; end: string } | string;
  customColors: Record<string, string> | string;
}

export interface DateRange {
  start: string;
  end: string;
}
