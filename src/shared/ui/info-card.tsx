import type { ReactNode } from 'react';

type CardTone =
  | 'neutral'
  | 'warning';

interface InfoCardProps {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  tone?: CardTone;
}

export function InfoCard({
  children,
  title,
  eyebrow,
  tone = 'neutral',
}: InfoCardProps) {
  return (
    <section
      className={[
        'grid gap-4 p-5 rounded-2xl',
        tone === 'warning'
          ? 'bg-[rgba(27,32,41,0.96)]'
          : 'bg-surface-low',
      ].join(' ')}
    >
      {eyebrow ? (
        <p
          className={[
            'm-0 font-mono text-[0.72rem] font-extrabold uppercase tracking-[0.18em]',
            tone === 'warning' ? 'text-warning' : 'text-text-soft',
          ].join(' ')}
        >
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="m-0 font-headline text-[1.22rem] leading-[1.1]">
          {title}
        </h2>
      ) : null}
      <div className="grid gap-3 leading-[1.5]">{children}</div>
    </section>
  );
}
