import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

type LinkVariant =
  | 'primary'
  | 'secondary'
  | 'quiet';

interface ActionLinkProps {
  children: ReactNode;
  to: string;
  variant?: LinkVariant;
}

const variantClasses: Record<LinkVariant, string> = {
  primary: 'bg-accent text-white',
  secondary: 'bg-surface-soft text-text',
  quiet: 'bg-[rgba(28,32,40,0.72)] text-accent-strong',
};

export function ActionLink({
  children,
  to,
  variant = 'primary',
}: ActionLinkProps) {
  return (
    <Link
      to={to}
      className={[
        'inline-flex items-center justify-center min-h-[45px] px-5 rounded-lg font-headline font-extrabold text-center',
        'transition-[background-color,filter,opacity] duration-150 ease-out hover:brightness-90',
        variantClasses[variant],
      ].join(' ')}
    >
      {children}
    </Link>
  );
}
