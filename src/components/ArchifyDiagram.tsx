import catalog from '../../diagrams/catalog.json';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import styles from './ArchifyDiagram.module.css';

type Props = {
  id: string;
  title: string;
};

const LOAD_MS = 8000;
const FALLBACK_BOX: [number, number] = [1080, 560];

function viewBoxFor(id: string): [number, number] {
  const entry = catalog.diagrams.find((d) => d.id === id);
  const box = entry?.viewBox;
  if (box && box.length === 2 && box[0] > 0 && box[1] > 0) {
    return [box[0], box[1]];
  }
  return FALLBACK_BOX;
}

export default function ArchifyDiagram({id, title}: Props): ReactNode {
  const [failed, setFailed] = useState(false);
  const okRef = useRef(false);
  const htmlSrc = `/diagrams/${id}?theme=dark&present=1&embed=1`;
  const svgSrc = `/diagrams/${id}.svg`;
  const [w, h] = viewBoxFor(id);

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
    <figure
      className={styles.figure}
      data-failed={failed ? 'true' : 'false'}
      style={
        {
          '--archify-w': String(w),
          '--archify-h': String(h),
        } as CSSProperties
      }
    >
      {!failed && (
        <iframe
          className={styles.frame}
          src={htmlSrc}
          title={title}
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
