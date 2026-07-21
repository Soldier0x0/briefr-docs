import type {ReactNode} from 'react';
import styles from './styles.module.css';

type Props = {children: ReactNode};

export default function TryItYourself({children}: Props): ReactNode {
  return (
    <aside className={styles.box} aria-label="Try it yourself">
      <p className={styles.kicker}>Try it yourself (optional)</p>
      <p className={styles.note}>
        Recommended if you already self-host BRIEFR. Not required to finish
        this chapter — the docs never ask for your API keys.
      </p>
      <div>{children}</div>
    </aside>
  );
}
