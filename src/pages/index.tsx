import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {cn} from '@/lib/utils';
import styles from './index.module.css';

const GUIDES = [
  {
    tag: 'FOR ANALYSTS',
    title: 'User Guide',
    to: '/docs/user-guide',
    desc: 'Work the feed from the UI: triage CVEs, read enrichment, tune what BRIEFR watches, and turn intel into action.',
    chapters: [
      {label: 'Using BRIEFR', to: '/docs/user-guide/using-briefr'},
      {label: 'How it works', to: '/docs/user-guide/how-it-works'},
      {label: 'Troubleshooting', to: '/docs/user-guide/troubleshooting'},
    ],
  },
  {
    tag: 'FOR OPERATORS',
    title: 'Administrator Guide',
    to: '/docs/admin-guide',
    desc: 'Run it in production: install on your own hardware, stand up PostgreSQL, back up, upgrade, and keep it healthy.',
    chapters: [
      {label: 'Self-host BRIEFR', to: '/docs/admin-guide/self-host'},
      {label: 'Operations', to: '/docs/admin-guide/operations'},
      {label: 'PostgreSQL', to: '/docs/admin-guide/postgres'},
    ],
  },
  {
    tag: 'FOR CONTRIBUTORS',
    title: 'Developer Guide',
    to: '/docs/developer-guide',
    desc: 'Understand the machine: architecture, data flow, conventions, and how to extend BRIEFR without breaking it.',
    chapters: [
      {label: 'System design', to: '/docs/developer-guide/system-design'},
      {label: 'Contributor onboarding', to: '/docs/developer-guide/onboarding'},
      {label: 'API Reference', to: '/docs/api-reference'},
    ],
  },
];

const REFERENCE = [
  {
    tag: 'SEC',
    title: 'Security Guide',
    to: '/docs/security-guide',
    desc: 'Hardening checklist, the auth model, how secrets are handled, and how to report a vulnerability.',
  },
  {
    tag: 'API',
    title: 'API Reference',
    to: '/docs/api-reference',
    desc: 'Every endpoint: request and response shapes, authentication, and error semantics.',
  },
  {
    tag: 'INT',
    title: 'Integrations',
    to: '/docs/integrations',
    desc: 'Feeds in, alerts out — the sources BRIEFR pulls from and the systems it pushes to.',
  },
];

const PROJECT = [
  {
    title: 'Roadmap',
    to: '/docs/roadmap',
    desc: 'Where BRIEFR is going, and what is deliberately out of scope.',
  },
  {
    title: 'Release Notes',
    to: '/docs/release-notes',
    desc: 'What changed in each release, in plain language.',
  },
  {
    title: 'FAQ',
    to: '/docs/faq',
    desc: 'Short answers on licensing, requirements, data ownership, and scope.',
  },
];

const ctaClass =
  'h-auto rounded-none font-mono text-[1.167rem] font-bold tracking-[0.08em] uppercase focus-visible:ring-[3px] focus-visible:ring-ring/60';

function SeveritySpine({className}: {className?: string}) {
  return (
    <div
      className={clsx(styles.spine, className)}
      role="presentation"
      aria-hidden="true">
      <span className={styles.spineLow} />
      <span className={styles.spineMed} />
      <span className={styles.spineHigh} />
      <span className={styles.spineCrit} />
    </div>
  );
}

function SectionHead({kicker}: {kicker: string}) {
  return (
    <div className={styles.sectionHead}>
      <span className={styles.sectionKicker}>{kicker}</span>
      <span className={styles.sectionRule} />
    </div>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Documentation"
      description="BRIEFR documentation — self-hosted CVE intelligence and detection engineering. User, administrator, developer, and security guides plus a full API reference.">
      <main className={styles.main}>
        {/* ---- Dispatch header: the briefing cover sheet ---- */}
        <header className={styles.hero}>
          <div className={styles.dispatch}>
            <span>BRIEFR — DOCUMENTATION</span>
            <span>CLASS: PUBLIC</span>
            <span>LICENSE: AGPL-3.0</span>
            <span>REV 2026.07</span>
          </div>

          <h1 className={styles.masthead}>
            Learn<span className={styles.tick}>.</span> Deploy
            <span className={styles.tick}>.</span> Build
            <span className={styles.tick}>.</span>
          </h1>

          <p className={styles.sub}>
            BRIEFR is a self-hosted CVE intelligence and detection-engineering
            platform. Track the vulnerabilities that matter to your stack,
            enrich them into decisions, and ship detections — on your own
            hardware, on your own terms.
          </p>

          <div className={styles.ctas}>
            <Button asChild className={cn(ctaClass, 'px-[26px] py-3')}>
              <Link to="/docs/user-guide">Get started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className={cn(
                ctaClass,
                'border-border bg-transparent px-6 py-[11px] text-secondary-foreground hover:border-primary hover:bg-transparent hover:text-secondary-foreground',
              )}>
              <Link to="/docs/admin-guide/self-host">Self-host guide</Link>
            </Button>
            <Link
              className={styles.ctaPlain}
              href="https://github.com/Soldier0x0/briefr">
              GitHub ↗
            </Link>
          </div>

          <SeveritySpine className={styles.heroSpine} />
        </header>

        {/* ---- Field guides: one per audience ---- */}
        <section className={cn(styles.section, '@container')}>
          <SectionHead kicker="FIELD GUIDES" />
          <div className="grid grid-cols-1 gap-5 @3xl:grid-cols-3">
            {GUIDES.map((g) => (
              <Card
                key={g.title}
                className="@container flex flex-col rounded-md border-border bg-card py-0 shadow-none transition-transform hover:-translate-y-0.5">
                <CardHeader className="gap-2 px-[26px] pt-[26px]">
                  <Badge
                    variant="outline"
                    className="w-fit rounded-none border-transparent px-0 font-mono tracking-widest text-primary">
                    {g.tag}
                  </Badge>
                  <CardTitle className="font-[family-name:var(--brf-font-display)] text-2xl font-normal leading-tight">
                    <Link
                      to={g.to}
                      className="text-secondary-foreground no-underline hover:text-accent-foreground hover:no-underline">
                      {g.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-[0.94rem] leading-relaxed text-muted-foreground">
                    {g.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto border-t border-border px-[26px] pb-[18px] pt-0">
                  <ol className="m-0 flex list-none flex-col p-0">
                    {g.chapters.map((c, i) => (
                      <li
                        key={c.to}
                        className="border-b border-border last:border-0">
                        <Link
                          to={c.to}
                          className="flex items-baseline gap-3.5 py-2.5 text-[0.88rem] text-foreground no-underline hover:text-accent-foreground hover:no-underline">
                          <span className="font-mono text-xs text-muted-foreground">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ---- Reference shelf ---- */}
        <section className={cn(styles.section, '@container')}>
          <SectionHead kicker="REFERENCE" />
          <div className="grid grid-cols-1 gap-5 @3xl:grid-cols-3">
            {REFERENCE.map((r) => (
              <Link
                key={r.title}
                to={r.to}
                className="text-inherit no-underline hover:text-inherit hover:no-underline">
                <Card className="flex h-full flex-row items-start gap-4 rounded-md border-border bg-card px-[22px] py-[22px] shadow-none transition-transform hover:-translate-y-0.5">
                  <Badge
                    variant="outline"
                    className="shrink-0 rounded-none border-border font-mono tracking-wider text-primary">
                    {r.tag}
                  </Badge>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <CardTitle className="text-[1.02rem] font-semibold leading-snug text-secondary-foreground">
                      {r.title}
                    </CardTitle>
                    <CardDescription className="text-[0.86rem] leading-relaxed text-muted-foreground">
                      {r.desc}
                    </CardDescription>
                  </div>
                  <span
                    className={cn(styles.rowArrow, 'shrink-0 self-center')}
                    aria-hidden="true">
                    →
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* ---- Project index ---- */}
        <section className={clsx(styles.section, styles.sectionLast)}>
          <SectionHead kicker="PROJECT" />
          <Card className="gap-0 rounded-md border-border bg-transparent py-0 shadow-none">
            <ul className="m-0 list-none p-0">
              {PROJECT.map((p) => (
                <li key={p.title} className="border-b border-border last:border-0">
                  <Link
                    to={p.to}
                    className="grid grid-cols-1 items-baseline gap-2 px-1 py-[18px] text-inherit no-underline transition-colors hover:bg-secondary/40 hover:text-inherit hover:no-underline @container sm:grid-cols-[220px_1fr_auto] sm:gap-6">
                    <span className="font-[family-name:var(--brf-font-display)] text-[1.3rem] font-normal text-secondary-foreground">
                      {p.title}
                    </span>
                    <span className="text-[0.9rem] text-muted-foreground">
                      {p.desc}
                    </span>
                    <span
                      className={cn(styles.rowArrow, 'hidden sm:inline')}
                      aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </main>
    </Layout>
  );
}
