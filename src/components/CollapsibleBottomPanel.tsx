import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import type { ReactNode } from 'react';

interface CollapsibleBottomPanelProps {
  readonly title: string;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}

export function CollapsibleBottomPanel({
  title,
  defaultOpen = true,
  children,
}: Readonly<CollapsibleBottomPanelProps>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-t border-border bg-card flex flex-col"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-none h-8 px-4 hover:bg-muted"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-0' : '-rotate-90'
            }`}
          />
          <span className="ml-2 text-xs font-semibold text-foreground uppercase tracking-wider">
            {title}
          </span>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="flex-1 overflow-hidden border-t border-border bg-background">
        <div className="w-full h-full overflow-y-auto p-0">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
