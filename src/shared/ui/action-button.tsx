import type { ButtonHTMLAttributes } from 'react';
import { capitalize } from '@/shared/lib/capitalize';
import styles from '@/shared/ui/core-ui.module.css';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'quiet';

interface ActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function ActionButton({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ActionButtonProps) {
  const classes = [
    styles.button,
    styles[`button${capitalize(variant)}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      {...props}
    />
  );
}
