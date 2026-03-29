import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  multiline?: boolean;
}

export function TextField({
  hint,
  label,
  multiline = false,
  ...props
}: TextFieldProps) {
  return (
    <label className="grid gap-2">
      {label ? (
        <span className="font-headline text-[0.86rem] font-bold text-text-muted">
          {label}
        </span>
      ) : null}
      {multiline ? (
        <textarea
          className="min-h-32 p-4 bg-[rgba(38,42,51,0.92)] text-text border border-[rgba(63,72,81,0.25)] rounded-[0.75rem] outline-none placeholder:text-text-soft focus:border-[rgba(63,72,81,0.25)] resize-none"
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className="min-h-[3.65rem] px-4 py-3 bg-[rgba(38,42,51,0.92)] text-text border border-[rgba(63,72,81,0.25)] rounded-[0.75rem] outline-none placeholder:text-text-soft focus:border-[rgba(63,72,81,0.25)]"
          {...props}
        />
      )}
      {hint ? (
        <span className="text-text-soft text-[0.82rem]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
