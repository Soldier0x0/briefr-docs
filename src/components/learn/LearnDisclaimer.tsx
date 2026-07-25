import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import styles from './LearnDisclaimer.module.css';

/**
 * Callout for Pathways / Learn / System Design pages — not a certified course.
 */
export default function LearnDisclaimer(): ReactNode {
  return (
    <aside className={styles.root} aria-label="About the learning content">
      <p className={styles.kicker}>LEARNING CONTENT — READ FIRST</p>
      <p className={styles.body}>
        The <strong>Learn</strong> and <strong>Pathways</strong> sections are
        structured study notes — how the author learned BRIEFR and how similar
        systems are often designed. They are shared so others can explore the
        tool and codebase, <strong>not</strong> an accredited curriculum,
        certification prep, or substitute for formal training, vendor
        documentation, or your organization&apos;s security judgment.
      </p>
      <p className={styles.body}>
        Reference guides (User, Admin, API, Troubleshooting) describe
        production behavior. For runtime truth, prefer{' '}
        <Link to="/docs/product-status">Product status</Link> and those guides.{' '}
        <Link to="/docs/legal/about-this-site">About this documentation</Link>{' '}
        explains the split.
      </p>
    </aside>
  );
}
