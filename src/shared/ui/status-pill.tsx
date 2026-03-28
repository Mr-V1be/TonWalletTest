import type { PropsWithChildren } from 'react';
import { capitalize } from '@/shared/lib/capitalize';
import styles from '@/shared/ui/core-ui.module.css';

type PillTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger';

interface StatusPillProps
  extends PropsWithChildren {
  tone?: PillTone;
}

export function StatusPill({
  children,
  tone = 'neutral',
}: StatusPillProps) {
  const classes = [
    styles.pill,
    styles[`pill${capitalize(tone)}`],
  ].join(' ');

  return <span className={classes}>{children}</span>;
}
