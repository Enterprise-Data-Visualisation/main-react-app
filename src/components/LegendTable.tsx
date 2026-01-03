import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { List } from 'lucide-react';

interface Signal {
    id: string;
    name: string;
    type: string;
}

interface LegendTableProps {
    readonly selectedSignals: Signal[];
}

const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

/**
 * LegendTable Component
 *
 * Dumb component - receives selected signals as props.
 * Displays the active signals table with legend colors.
 */
export function LegendTable({
    selectedSignals,
}: Readonly<LegendTableProps>) {
    return (
        <Card
            data-testid="legend-table"
            className="border-0 shadow-none bg-transparent"
        >
            <CardHeader className="pb-3 pt-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <List className="w-4 h-4" />
                        Active Signals
                    </CardTitle>
                    <span className="text-xs text-muted-foreground font-mono">
                        {selectedSignals.length} Selected
                    </span>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-card/50">
                        <TableRow>
                            <TableHead className="w-24 text-xs h-9">Signal ID</TableHead>
                            <TableHead className="text-xs h-9">Asset Name</TableHead>
                            <TableHead className="text-xs h-9">Type</TableHead>
                            <TableHead className="text-right text-xs h-9 w-16">
                                Color
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedSignals.map((signal, index) => (
                            <TableRow key={signal.id} className="h-10">
                                <TableCell className="font-mono text-xs font-medium text-foreground">
                                    {signal.id}
                                </TableCell>
                                <TableCell className="text-xs text-foreground">
                                    {signal.name}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {signal.type}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end">
                                        <span
                                            className="inline-block w-3 h-3 rounded-full ring-1 ring-border"
                                            style={{
                                                backgroundColor: COLORS[index % COLORS.length],
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
                                    className="h-24 text-center text-muted-foreground text-xs"
                                >
                                    No signals selected. Choose from sidebar.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
