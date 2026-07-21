import type {ReactNode} from 'react';
import {briefrBlobUrl, briefrTreeUrl} from './pin';
import styles from './styles.module.css';

export type CodeRef = {
  path: string;
  label?: string;
  kind?: 'blob' | 'tree';
};

type Props = {
  items: CodeRef[];
  children?: ReactNode;
};

export default function InTheCode({items, children}: Props): ReactNode {
  return (
    <aside className={styles.box} aria-label="In the code">
      <p className={styles.kicker}>In the code</p>
      {children}
      <ul className={styles.list}>
        {items.map((item) => {
          const href =
            item.kind === 'tree'
              ? briefrTreeUrl(item.path)
              : briefrBlobUrl(item.path);
          return (
            <li key={item.path}>
              <a href={href} target="_blank" rel="noreferrer">
                {item.label ?? item.path}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
