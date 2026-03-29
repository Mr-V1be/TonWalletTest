import type { PropsWithChildren } from 'react';

type PillTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger';

interface StatusPillProps
  extends PropsWithChildren {
  tone?: PillTone;
}

const toneClasses: Record<PillTone, string> = {
  neutral: 'bg-surface-soft text-text-muted',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
};

export function StatusPill({
  children,
  tone = 'neutral',
}: StatusPillProps) {
  return (
    <span
      className={[
        'inline-flex items-center h-5 px-2 rounded-full text-[0.68rem] font-extrabold leading-none',
        toneClasses[tone],
      ].join(' ')}
    >
      {children}
    </span>
  );
}
