import type {ReactNode} from 'react';
import styles from './styles.module.css';

type Props = {children: ReactNode};

export default function AtEnterpriseScale({children}: Props): ReactNode {
  return (
    <aside
      className={`${styles.box} ${styles.boxEnterprise}`}
      aria-label="At enterprise scale"
    >
      <p className={`${styles.kicker} ${styles.kickerEnterprise}`}>
        At enterprise scale
      </p>
      <div>{children}</div>
    </aside>
  );
}
