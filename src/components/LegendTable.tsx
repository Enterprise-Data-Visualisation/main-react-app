import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Focus, EyeOff, X } from 'lucide-react';

interface Signal {
  id: string;
  name: string;
  type: string;
}

interface LegendTableProps {
  readonly selectedSignals: Signal[];
  readonly customColors: Record<string, string>;
  readonly highlightedId: string | null;
  readonly hiddenIds: string[];
  readonly onToggle: (id: string) => void;
  readonly onHighlight: (id: string | null) => void;
  readonly onColorChange: (id: string, color: string) => void;
  readonly onToggleVisibility: (id: string) => void;
}

const DEFAULT_COLORS = ['#3b82f6', '#a855f7', '#0ea5e9', '#10b981', '#f59e0b'];

export function LegendTable({
  selectedSignals,
  customColors,
  highlightedId,
  hiddenIds,
  onToggle, // Remove
  onHighlight,
  onColorChange,
  onToggleVisibility,
}: Readonly<LegendTableProps>) {
  return (
    <Card
      data-testid="legend-table"
      className="border-0 shadow-none bg-transparent"
    >
      <CardContent className="p-0">
        <div className="rounded-md border border-border/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="h-6 hover:bg-transparent">
                <TableHead className="w-16 text-[10px] h-6 font-mono font-bold px-2">
                  ID
                </TableHead>
                <TableHead className="text-[10px] h-6 font-bold px-2">
                  Name
                </TableHead>
                <TableHead className="text-[10px] h-6 font-bold px-2">
                  Type
                </TableHead>
                <TableHead className="text-right text-[10px] h-6 w-24 px-2">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedSignals.map((signal, index) => {
                const color =
                  customColors[signal.id] ||
                  DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                const isHighlighted = highlightedId === signal.id;
                const isHidden = hiddenIds.includes(signal.id);
                // Dim if highlighted (others dimmed) OR if hidden
                const isDimmed = (highlightedId && !isHighlighted) || isHidden;

                return (
                  <TableRow
                    key={signal.id}
                    className={`h-8 hover:bg-muted/30 transition-opacity ${
                      isDimmed ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    <TableCell className="font-mono text-[10px] font-medium py-0 px-2 leading-8">
                      {signal.id}
                    </TableCell>
                    <TableCell className="text-[10px] py-0 px-2 leading-8">
                      {signal.name}
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground py-0 px-2 leading-8">
                      {signal.type}
                    </TableCell>
                    <TableCell className="text-right py-1 px-2">
                      <div className="flex justify-end gap-1 items-center h-full">
                        {/* Highlight Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-5 w-5 ${
                            isHighlighted
                              ? 'text-primary bg-primary/10'
                              : 'text-muted-foreground'
                          }`}
                          onClick={() =>
                            onHighlight(isHighlighted ? null : signal.id)
                          }
                          title="Highlight Signal"
                        >
                          <Focus className="h-3 w-3" />
                        </Button>

                        {/* Visibility Toggle */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-5 w-5 ${
                            isHidden
                              ? 'text-muted-foreground/50'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => onToggleVisibility(signal.id)}
                          title={isHidden ? 'Show Signal' : 'Hide Signal'}
                        >
                          {isHidden ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted-foreground hover:text-destructive"
                          onClick={() => onToggle(signal.id)}
                          title="Remove Signal"
                        >
                          <X className="h-3 w-3" />
                        </Button>

                        {/* Color Picker */}
                        <div className="relative flex items-center justify-center p-0.5 border rounded hover:bg-muted cursor-pointer h-5 w-5">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <input
                            type="color"
                            value={color}
                            onChange={(e) =>
                              onColorChange(signal.id, e.target.value)
                            }
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            title="Change Color"
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {selectedSignals.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-16 text-center text-muted-foreground text-[10px]"
                  >
                    No signals selected
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
