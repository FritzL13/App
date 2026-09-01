import type { KeyboardEvent, ReactNode } from 'react';

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  if (onClick) {
    function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    }
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={`w-full cursor-pointer rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-3.5 text-left ${className}`}
      >
        {children}
      </div>
    );
  }
  return (
    <div className={`w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-3.5 text-left ${className}`}>
      {children}
    </div>
  );
}
