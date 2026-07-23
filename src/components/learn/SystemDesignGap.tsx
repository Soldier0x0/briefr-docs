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

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactNode {
  return (
    <section>
      <h3 className={sectionHeading}>{title}</h3>
      {children}
    </section>
  );
}

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
        <SectionBlock title="What it covers">
          <ul className="list-disc pl-4 space-y-1 text-sm">
            {covers.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </SectionBlock>

        <Separator />

        <SectionBlock title="Why it matters">
          <p className="text-sm">{whyItMatters}</p>
        </SectionBlock>

        <Separator />

        <SectionBlock title="In BRIEFR">
          <div className="text-sm">{inBriefr}</div>
        </SectionBlock>

        <Separator />

        <SectionBlock title="Why BRIEFR skips or limits this">
          <p className="text-sm">{whyNot}</p>
        </SectionBlock>

        <Separator />

        <SectionBlock title="When you would need it">
          <p className="text-sm">{whenNeeded}</p>
        </SectionBlock>

        <Separator />

        <SectionBlock title="Learn externally">
          <ul className="space-y-1.5 text-sm">
            {resources.map((r, i) => (
              <li key={i}>
                {r.href ? (
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--brf-link)] hover:underline">
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
        </SectionBlock>
      </CardContent>

      <CardFooter className="border-t border-border pt-4">
        <Button variant="outline" size="sm" asChild>
          <a href={nextHref}>{nextLabel} →</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
