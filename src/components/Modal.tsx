import type { ReactNode } from 'react';
import { IconClose } from './Icons';

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="mx-auto flex max-h-[92svh] w-full max-w-[480px] flex-col rounded-t-3xl bg-[var(--color-bg)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3.5">
          <h2 className="text-xl text-[var(--color-ink)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-full p-1.5 text-[var(--color-ink)]/60 hover:bg-[var(--color-line)]/60"
          >
            <IconClose width={20} height={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && (
          <div className="border-t border-[var(--color-line)] px-4 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
