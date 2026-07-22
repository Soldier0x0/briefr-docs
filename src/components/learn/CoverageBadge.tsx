import type {ReactNode} from 'react';
import {Badge} from '@/components/ui/badge';

export type Coverage = 'briefr' | 'partial' | 'gap';

export function CoverageBadge({coverage}: {coverage: Coverage}): ReactNode {
  switch (coverage) {
    case 'briefr':
      return <Badge variant="default">briefr</Badge>;
    case 'partial':
      return (
        <Badge
          variant="outline"
          className="border-[var(--brf-link)] text-[var(--brf-link)]"
        >
          partial
        </Badge>
      );
    case 'gap':
      return (
        <Badge variant="outline" className="text-muted-foreground">
          gap
        </Badge>
      );
    default: {
      const _exhaustive: never = coverage;
      throw new Error(`Unhandled coverage: ${_exhaustive}`);
    }
  }
}
