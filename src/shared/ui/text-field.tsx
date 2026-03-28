import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import styles from '@/shared/ui/core-ui.module.css';

interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
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
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {multiline ? (
        <textarea
          className={styles.fieldInput}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={styles.fieldInput}
          {...props}
        />
      )}
      {hint ? (
        <span className={styles.fieldHint}>{hint}</span>
      ) : null}
    </label>
  );
}
