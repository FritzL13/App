import { IconPlus } from './Icons';

export function FAB({ onClick, label = 'Neu anlegen' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-orange)] text-white shadow-lg active:scale-95"
      style={{ right: 'max(1rem, calc((100vw - 480px) / 2 + 1rem))' }}
    >
      <IconPlus />
    </button>
  );
}
