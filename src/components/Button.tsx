import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT_KLASSEN: Record<Variant, string> = {
  primary: 'bg-[var(--color-orange)] text-white',
  secondary: 'bg-[var(--color-petrol)] text-white',
  ghost: 'bg-transparent text-[var(--color-ink)] border border-[var(--color-line)]',
  danger: 'bg-[var(--color-danger)] text-white',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40 ${VARIANT_KLASSEN[variant]} ${className}`}
      {...props}
    />
  );
}
