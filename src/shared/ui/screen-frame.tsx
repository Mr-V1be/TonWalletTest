import type { ReactNode } from 'react';

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
    <section className="grid gap-7 w-full max-w-[64rem]">
      <header className="grid gap-3">
        <h1 className="m-0 font-headline text-[clamp(2rem,7vw,3rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
          {title}
        </h1>
        {description ? (
          <p className="m-0 text-text-muted max-w-[50rem] text-base leading-[1.7]">
            {description}
          </p>
        ) : null}
      </header>
      <div className="grid gap-5 p-6 bg-surface-low rounded-2xl">
        {children}
      </div>
    </section>
  );
}
