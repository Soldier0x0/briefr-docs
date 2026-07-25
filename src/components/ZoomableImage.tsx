import type {ComponentProps, ReactNode} from 'react';
import {useCallback, useEffect, useId, useRef, useState} from 'react';
import clsx from 'clsx';
import styles from './ZoomableImage.module.css';

type ImgProps = ComponentProps<'img'>;

export default function ZoomableImage(props: ImgProps): ReactNode {
  const {src, alt, title, className, ...rest} = props;
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  if (!src) {
    return <img {...props} />;
  }

  const label = alt || title || 'Expand image';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={clsx(styles.trigger, className)}
        onClick={() => setOpen(true)}
        aria-label={`${label} — expand`}>
        <img
          {...rest}
          src={src}
          alt={alt}
          title={title}
          className={styles.thumb}
          loading="lazy"
        />
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClose={close}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (
            target === dialogRef.current ||
            target.classList.contains(styles.backdrop)
          ) {
            close();
          }
        }}>
        <div className={styles.backdrop}>
          <button
            type="button"
            className={styles.close}
            onClick={close}
            aria-label="Close image">
            ×
          </button>
          <figure className={styles.figure}>
            <img
              src={src}
              alt={alt}
              className={styles.full}
              onClick={(event) => event.stopPropagation()}
            />
            {(alt || title) && (
              <figcaption id={titleId}>{alt || title}</figcaption>
            )}
          </figure>
        </div>
      </dialog>
    </>
  );
}
