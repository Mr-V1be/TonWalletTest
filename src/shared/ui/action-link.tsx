import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { capitalize } from '@/shared/lib/capitalize';
import styles from '@/shared/ui/core-ui.module.css';

type LinkVariant =
  | 'primary'
  | 'secondary'
  | 'quiet';

interface ActionLinkProps {
  children: ReactNode;
  to: string;
  variant?: LinkVariant;
}

export function ActionLink({
  children,
  to,
  variant = 'primary',
}: ActionLinkProps) {
  const classes = [
    styles.button,
    styles[`button${capitalize(variant)}`],
  ].join(' ');

  return (
    <Link
      to={to}
      className={classes}
    >
      {children}
    </Link>
  );
}
