import Link from '@docusaurus/Link';
import styles from './SiteDocsNotice.module.css';

/** Homepage + footer-adjacent notice: official reference vs learning notes. */
export default function SiteDocsNotice(): JSX.Element {
  return (
    <p className={styles.root}>
      <span className={styles.label}>NOTICE</span>
      Official reference for installing and operating BRIEFR.{' '}
      <strong>Learn</strong> and <strong>Pathways</strong> are the
      author&apos;s structured study notes — not a certified course or
      professional security advice.{' '}
      <Link to="/docs/legal/about-this-site">About this site</Link>
      {' · '}
      <Link to="/docs/legal/privacy-policy">Privacy</Link>
      {' · '}
      <Link to="/docs/legal/terms-of-use">Terms</Link>
    </p>
  );
}
