import type {ReactNode} from 'react';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {CoverageBadge} from './CoverageBadge';

export type SystemDesignGapProps = {
  topic: string;
  covers: string[];
  whyItMatters: string;
  inBriefr: ReactNode;
  whyNot: string;
  whenNeeded: string;
  resources: {label: string; href?: string; note?: string}[];
  nextHref: string;
  nextLabel: string;
};

const sectionHeading =
  'text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2';

export function SystemDesignGap({
  topic,
  covers,
  whyItMatters,
  inBriefr,
  whyNot,
  whenNeeded,
  resources,
  nextHref,
  nextLabel,
}: SystemDesignGapProps): ReactNode {
  return (
    <Card className="my-6">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CoverageBadge coverage="gap" />
          <CardTitle className="text-base">{topic}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <section>
          <p className={sectionHeading}>What it covers</p>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            {covers.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <Separator />

        <section>
          <p className={sectionHeading}>Why it matters</p>
          <p className="text-sm">{whyItMatters}</p>
        </section>

        <Separator />

        <section>
          <p className={sectionHeading}>In BRIEFR</p>
          <div className="text-sm">{inBriefr}</div>
        </section>

        <Separator />

        <section>
          <p className={sectionHeading}>Why BRIEFR skips or limits this</p>
          <p className="text-sm">{whyNot}</p>
        </section>

        <Separator />

        <section>
          <p className={sectionHeading}>When you would need it</p>
          <p className="text-sm">{whenNeeded}</p>
        </section>

        <Separator />

        <section>
          <p className={sectionHeading}>Learn externally</p>
          <ul className="space-y-1.5 text-sm">
            {resources.map((r, i) => (
              <li key={i}>
                {r.href ? (
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--brf-link)] hover:underline"
                  >
                    {r.label}
                  </a>
                ) : (
                  <span>{r.label}</span>
                )}
                {r.note && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    — {r.note}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </CardContent>

      <CardFooter className="border-t border-border pt-4">
        <Button variant="outline" size="sm" asChild>
          <a href={nextHref}>{nextLabel} →</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
