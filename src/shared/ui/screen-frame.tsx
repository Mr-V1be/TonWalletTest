import type { ReactNode } from 'react';
import styles from '@/shared/ui/core-ui.module.css';

interface ScreenFrameProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function ScreenFrame({
  children,
  title,
  description,
}: ScreenFrameProps) {
  return (
    <section className={styles.frame}>
      <header className={styles.frameHeader}>
        <h1 className={styles.frameTitle}>{title}</h1>
        {description ? (
          <p className={styles.frameLead}>{description}</p>
        ) : null}
      </header>
      <div className={styles.frameBody}>{children}</div>
    </section>
  );
}
