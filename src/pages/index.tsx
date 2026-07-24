import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const GUIDES = [
  {
    tag: 'FOR LEARNERS',
    title: 'Pathways',
    to: '/docs/pathways',
    desc: 'Choose your angle: security analyst, architect/builder, or system-design learner. Each path links into the chapters that match your role.',
    chapters: [
      {label: 'Security analyst', to: '/docs/how-briefr-works/intel-lifecycle/collect'},
      {label: 'Architect / builder', to: '/docs/how-briefr-works/how-its-built/ingestion-scheduler'},
      {label: 'System design', to: '/docs/how-briefr-works/system-design/'},
    ],
  },
  {
    tag: 'FOR LEARNERS',
    title: 'How BRIEFR Works',
    to: '/docs/how-briefr-works',
    desc: 'Understand what BRIEFR actually does: the intel lifecycle from feed to brief, the system design, and how each subsystem is built.',
    chapters: [
      {label: 'Intel lifecycle', to: '/docs/how-briefr-works/intel-lifecycle/collect'},
      {label: 'How it\'s built', to: '/docs/how-briefr-works/how-its-built/ingestion-scheduler'},
      {label: 'System design', to: '/docs/how-briefr-works/system-design/'},
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
    draft: true,
  },
  {
    tag: 'API',
    title: 'API Reference',
    to: '/docs/api-reference',
    desc: 'Every endpoint: request and response shapes, authentication, and error semantics.',
    draft: false,
  },
  {
    tag: 'INT',
    title: 'Integrations',
    to: '/docs/integrations',
    desc: 'Feeds in, alerts out — the sources BRIEFR pulls from and the systems it pushes to.',
    draft: true,
  },
];

const PROJECT = [
  {
    title: 'Roadmap',
    to: '/docs/roadmap',
    desc: 'Where BRIEFR is going, and what is deliberately out of scope.',
    draft: false,
  },
  {
    title: 'Release Notes',
    to: '/docs/release-notes',
    desc: 'What changed in each release, in plain language.',
    draft: true,
  },
  {
    title: 'FAQ',
    to: '/docs/faq',
    desc: 'Short answers on licensing, requirements, data ownership, and scope.',
    draft: false,
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

function DraftMark() {
  return <span className={styles.draft}>DRAFT</span>;
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
            <span>LICENSE: Apache-2.0</span>
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
            <Link className={styles.ctaPrimary} to="/docs/user-guide">
              Get started
            </Link>
            <Link className={styles.ctaGhost} to="/docs/pathways">
              Pick a pathway
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

        {/* ---- Field guides: one per audience ---- */}
        <section className={styles.section}>
          <SectionHead kicker="FIELD GUIDES" />
          <div className={styles.guideGrid}>
            {GUIDES.map((g) => (
              <article key={g.title} className={styles.guideCard}>
                <span className={styles.cardTag}>{g.tag}</span>
                <h2 className={styles.cardTitle}>
                  <Link to={g.to}>{g.title}</Link>
                </h2>
                <p className={styles.cardDesc}>{g.desc}</p>
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
              </article>
            ))}
          </div>
        </section>

        {/* ---- Reference shelf ---- */}
        <section className={styles.section}>
          <SectionHead kicker="REFERENCE" />
          <div className={styles.refGrid}>
            {REFERENCE.map((r) => (
              <Link key={r.title} to={r.to} className={styles.refCard}>
                <span className={styles.refTag}>{r.tag}</span>
                <span className={styles.refBody}>
                  <span className={styles.refTitle}>
                    {r.title}
                    {/* breakable space so the badge can wrap on tiny screens */}
                    {r.draft && <>{' '}<DraftMark /></>}
                  </span>
                  <span className={styles.refDesc}>{r.desc}</span>
                </span>
                <span className={styles.rowArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ---- Project index ---- */}
        <section className={clsx(styles.section, styles.sectionLast)}>
          <SectionHead kicker="PROJECT" />
          <ul className={styles.projectList}>
            {PROJECT.map((p) => (
              <li key={p.title}>
                <Link to={p.to} className={styles.projectRow}>
                  <span className={styles.projectTitle}>
                    {p.title}
                    {p.draft && <>{' '}<DraftMark /></>}
                  </span>
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
