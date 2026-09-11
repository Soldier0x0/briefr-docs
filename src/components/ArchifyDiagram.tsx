import {useCallback, useState, type ReactNode} from 'react';
import styles from './ArchifyDiagram.module.css';

type Props = {
  id: string;
  title: string;
  height?: number;
};

export default function ArchifyDiagram({
  id,
  title,
  height = 560,
}: Props): ReactNode {
  const [failed, setFailed] = useState(false);
  const htmlSrc = `/diagrams/${id}.html?theme=dark&present=1&embed=1`;
  const svgSrc = `/diagrams/${id}.svg`;
  const onError = useCallback(() => setFailed(true), []);

  return (
    <figure className={styles.figure} data-failed={failed ? 'true' : 'false'}>
      {!failed && (
        <iframe
          className={styles.frame}
          src={htmlSrc}
          title={title}
          height={height}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin"
          onError={onError}
        />
      )}
      <img className={styles.fallback} src={svgSrc} alt={title} />
      <noscript>
        <img src={svgSrc} alt={title} />
      </noscript>
    </figure>
  );
}
