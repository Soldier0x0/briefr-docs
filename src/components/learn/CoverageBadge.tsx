import type {ReactNode} from 'react';
import {Badge} from '@/components/ui/badge';

export type Coverage = 'briefr' | 'partial' | 'gap';

const LABELS: Record<Coverage, string> = {
  briefr: 'BRIEFR',
  partial: 'Partial',
  gap: 'Gap',
};

export function CoverageBadge({coverage}: {coverage: Coverage}): ReactNode {
  switch (coverage) {
    case 'briefr':
      return (
        <Badge variant="default" aria-label={`Coverage: ${LABELS[coverage]}`}>
          {LABELS[coverage]}
        </Badge>
      );
    case 'partial':
      return (
        <Badge
          variant="outline"
          className="border-[var(--brf-link)] text-[var(--brf-link)]"
          aria-label={`Coverage: ${LABELS[coverage]}`}>
          {LABELS[coverage]}
        </Badge>
      );
    case 'gap':
      return (
        <Badge
          variant="outline"
          className="text-muted-foreground"
          aria-label={`Coverage: ${LABELS[coverage]}`}>
          {LABELS[coverage]}
        </Badge>
      );
    default: {
      const _exhaustive: never = coverage;
      throw new Error(`Unhandled coverage: ${_exhaustive}`);
    }
  }
}
