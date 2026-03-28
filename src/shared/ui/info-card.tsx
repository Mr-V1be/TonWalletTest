import type { ReactNode } from 'react';
import styles from '@/shared/ui/core-ui.module.css';

type CardTone =
  | 'neutral'
  | 'warning';

interface InfoCardProps {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  tone?: CardTone;
}

export function InfoCard({
  children,
  title,
  eyebrow,
  tone = 'neutral',
}: InfoCardProps) {
  const classes = [
    styles.card,
    tone === 'warning' ? styles.cardWarning : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes}>
      {eyebrow ? (
        <p className={styles.eyebrow}>{eyebrow}</p>
      ) : null}
      <h2 className={styles.cardTitle}>{title}</h2>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}
