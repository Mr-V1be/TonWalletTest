import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'quiet';

interface ActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white',
  secondary: 'bg-surface-soft text-text',
  quiet: 'bg-[rgba(28,32,40,0.72)] text-accent-strong',
};

export function ActionButton({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center min-h-[45px] px-5 border-0 rounded-lg font-headline font-extrabold cursor-pointer text-center',
        'transition-[background-color,filter,opacity] duration-150 ease-out',
        'enabled:hover:brightness-90 disabled:opacity-55 disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
