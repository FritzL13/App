import type { ReactNode } from 'react';

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-ink)] px-4 py-3.5">
      <h1 className="text-2xl leading-none text-white">{title}</h1>
      {action}
    </div>
  );
}
