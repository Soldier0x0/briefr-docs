import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {Badge} from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import styles from './index.module.css';

const GUIDES = [
  {
    tag: 'FOR LEARNERS',
    title: 'How BRIEFR Works',
    to: '/docs/how-briefr-works/pathways',
    desc: 'Understand what BRIEFR actually does: the intel lifecycle from feed to brief, the system design, and how each subsystem is built.',
    chapters: [
      {label: 'Pathways', to: '/docs/how-briefr-works/pathways'},
      {label: 'Intel lifecycle', to: '/docs/how-briefr-works/intel-lifecycle/collect'},
      {label: "How it's built", to: '/docs/how-briefr-works/how-its-built/ingestion-scheduler'},
    ],
  },
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
      {label: 'API overview', to: '/docs/api-guide'},
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
    title: 'Getting started',
    to: '/docs/getting-started',
    desc: 'Linear checklist from first read to running BRIEFR in production.',
  },
  {
    title: 'Product status',
    to: '/docs/product-status',
    desc: 'Digest of what is true in production today.',
  },
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
        <header className={styles.hero}>
          <div className={styles.dispatch}>
            <span>BRIEFR — DOCUMENTATION</span>
            <span>CLASS: PUBLIC</span>
            <span>LICENSE: BSL-1.1</span>
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
            <Link className={styles.ctaPrimary} to="/docs/getting-started">
              Get started
            </Link>
            <Link className={styles.ctaGhost} to="/docs/how-briefr-works">
              How BRIEFR Works
            </Link>
            <Link className={styles.ctaGhost} to="/docs/admin-guide/self-host">
              Self-host guide
            </Link>
            <Link
              className={styles.ctaPlain}
              href="https://github.com/Soldier0x0/briefr">
              GitHub ↗
            </Link>
          </div>

          <SeveritySpine className={styles.heroSpine} />
        </header>

        <section className={styles.section}>
          <SectionHead kicker="FIELD GUIDES" />
          <div className={styles.guideGrid}>
            {GUIDES.map((g) => (
              <Card
                key={g.title}
                className="h-full border-[var(--brf-hairline)] bg-[var(--brf-surface)] shadow-none transition-colors hover:border-[var(--brf-hairline-2)]">
                <CardHeader className="gap-3 pb-0">
                  <Badge
                    variant="outline"
                    className="w-fit border-[var(--brf-hairline-2)] font-mono text-[0.66rem] tracking-[0.18em] text-[var(--brf-accent)] uppercase">
                    {g.tag}
                  </Badge>
                  <CardTitle className="font-[family-name:var(--brf-font-display)] text-[1.65rem] font-normal tracking-tight">
                    <Link to={g.to} className="text-[var(--brf-bright)] hover:text-[var(--brf-accent-strong)] hover:no-underline">
                      {g.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-[0.94rem] leading-relaxed text-[var(--brf-text)]">
                    {g.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ol className={styles.chapters}>
                    {g.chapters.map((c, i) => (
                      <li key={c.to}>
                        <Link to={c.to}>
                          <span className={styles.chapterIndex}>
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

        <section className={styles.section}>
          <SectionHead kicker="REFERENCE" />
          <div className={styles.refGrid}>
            {REFERENCE.map((r) => (
              <Link
                key={r.title}
                to={r.to}
                className={styles.refCardLink}>
                <Card className="h-full border-[var(--brf-hairline)] bg-[var(--brf-surface)] shadow-none transition-colors hover:border-[var(--brf-accent)]">
                  <CardHeader className="flex-row items-start gap-4 space-y-0">
                    <Badge
                      variant="outline"
                      className="shrink-0 border-[var(--brf-hairline-2)] font-mono text-[0.66rem] tracking-[0.14em] text-[var(--brf-accent)] uppercase">
                      {r.tag}
                    </Badge>
                    <div className="min-w-0 flex-1 space-y-2">
                      <CardTitle className="text-base text-[var(--brf-bright)]">
                        {r.title}
                      </CardTitle>
                      <CardDescription className="text-[0.86rem] leading-relaxed">
                        {r.desc}
                      </CardDescription>
                    </div>
                    <span className={styles.rowArrow} aria-hidden="true">
                      →
                    </span>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className={clsx(styles.section, styles.sectionLast)}>
          <SectionHead kicker="PROJECT" />
          <ul className={styles.projectList}>
            {PROJECT.map((p) => (
              <li key={p.title}>
                <Link to={p.to} className={styles.projectRow}>
                  <span className={styles.projectTitle}>{p.title}</span>
                  <span className={styles.projectDesc}>{p.desc}</span>
                  <span className={styles.rowArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </Layout>
  );
}
