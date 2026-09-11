import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import styles from './ArchifyDiagram.module.css';

type Props = {
  id: string;
  title: string;
  height?: number;
};

const LOAD_MS = 8000;

export default function ArchifyDiagram({
  id,
  title,
  height = 560,
}: Props): ReactNode {
  const [failed, setFailed] = useState(false);
  const okRef = useRef(false);
  const htmlSrc = `/diagrams/${id}.html?theme=dark&present=1&embed=1`;
  const svgSrc = `/diagrams/${id}.svg`;

  useEffect(() => {
    okRef.current = false;
    setFailed(false);
    const timer = window.setTimeout(() => {
      if (!okRef.current) setFailed(true);
    }, LOAD_MS);
    return () => window.clearTimeout(timer);
  }, [id]);

  const onLoad = useCallback((event: {currentTarget: HTMLIFrameElement}) => {
    const doc = event.currentTarget.contentDocument;
    if (doc?.querySelector('svg')) {
      okRef.current = true;
      return;
    }
    setFailed(true);
  }, []);

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
          onLoad={onLoad}
        />
      )}
      <img className={styles.fallback} src={svgSrc} alt={title} />
      <noscript>
        <img src={svgSrc} alt={title} />
      </noscript>
    </figure>
  );
}
