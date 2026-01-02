import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Signal {
  id: string;
  name: string;
  type: string;
}

interface DateRange {
  start: string;
  end: string;
}

interface BottomPanelProps {
  readonly dateRange: DateRange;
  readonly isLive: boolean;
  readonly selectedSignals: Signal[];
  readonly onSetDateRange: (range: DateRange) => void;
}

/**
 * BottomPanel Component
 *
 * Dumb component - receives all data and callbacks as props
 * Responsible for its own styling only
 */
export function BottomPanel({
  dateRange,
  isLive,
  selectedSignals,
  onSetDateRange,
}: Readonly<BottomPanelProps>) {
  return (
    <div className="h-72 border-t border-zinc-200 bg-zinc-50/50 p-4 flex gap-4">
      {/* 1. TIMELINE CONTROLS CARD */}
      <Card className="w-1/3 flex flex-col shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Timeline Controls
          </CardTitle>
          <CardDescription className="text-xs">
            {isLive
              ? "Controls disabled during live stream"
              : "Adjust playback range"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="start-time" className="text-xs text-zinc-500">
              Start Time
            </Label>
            <Input
              id="start-time"
              type="datetime-local"
              className="h-8 text-xs"
              disabled={isLive}
              value={dateRange.start.slice(0, 16)}
              onChange={(e) =>
                onSetDateRange({ ...dateRange, start: e.target.value })
              }
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="end-time" className="text-xs text-zinc-500">
              End Time
            </Label>
            <Input
              id="end-time"
              type="datetime-local"
              className="h-8 text-xs"
              disabled={isLive}
              value={dateRange.end.slice(0, 16)}
              onChange={(e) =>
                onSetDateRange({ ...dateRange, end: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. LEGEND TABLE CARD */}
      <Card className="w-2/3 flex flex-col shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-100 bg-zinc-50/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Active Signals
            </CardTitle>
            <span className="text-xs text-zinc-400 font-mono">
              {selectedSignals.length} Selected
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-zinc-50 sticky top-0">
              <TableRow>
                <TableHead className="w-25 text-xs h-9">Signal ID</TableHead>
                <TableHead className="text-xs h-9">Asset Name</TableHead>
                <TableHead className="text-xs h-9">Type</TableHead>
                <TableHead className="text-right text-xs h-9">Legend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedSignals.map((s, index) => (
                <TableRow key={s.id} className="h-10">
                  <TableCell className="font-mono text-xs font-medium text-zinc-700">
                    {s.id}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-600">
                    {s.name}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {s.type}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <span className="text-[10px] text-zinc-400 font-mono hidden group-hover:block">
                        Trace {index + 1}
                      </span>
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full ring-1 ring-zinc-200"
                        style={{
                          backgroundColor: [
                            "#2563eb",
                            "#dc2626",
                            "#16a34a",
                            "#d97706",
                          ][index % 4],
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {selectedSignals.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-zinc-400 text-xs"
                  >
                    No signals selected. Choose from sidebar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
