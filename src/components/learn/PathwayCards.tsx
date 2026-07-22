import type {ReactNode} from 'react';
import {Badge} from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export type PathwayCard = {
  title: string;
  blurb: string;
  to: string;
  completeness: 'complete' | 'hybrid';
};

export type PathwayCardsProps = {
  cards: PathwayCard[];
};

function CompletenessBadge({
  completeness,
}: {
  completeness: 'complete' | 'hybrid';
}): ReactNode {
  switch (completeness) {
    case 'complete':
      return <Badge variant="secondary">Complete</Badge>;
    case 'hybrid':
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Hybrid
        </Badge>
      );
    default: {
      const _exhaustive: never = completeness;
      throw new Error(`Unhandled completeness: ${_exhaustive}`);
    }
  }
}

export function PathwayCards({cards}: PathwayCardsProps): ReactNode {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 my-6">
      {cards.map((card) => (
        <a
          key={card.to}
          href={card.to}
          className="no-underline group"
          style={{color: 'inherit'}}
        >
          <Card className="h-full transition-colors group-hover:border-[var(--brf-accent)]">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">
                  {card.title}
                </CardTitle>
                <CompletenessBadge completeness={card.completeness} />
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription>{card.blurb}</CardDescription>
            </CardContent>
            <CardFooter>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-[var(--brf-accent-strong)] transition-colors">
                Start →
              </span>
            </CardFooter>
          </Card>
        </a>
      ))}
    </div>
  );
}
