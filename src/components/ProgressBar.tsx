export function ProgressBar({ anteil, farbe = 'var(--color-orange)' }: { anteil: number; farbe?: string }) {
  const prozent = Math.max(0, Math.min(100, anteil * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
      <div className="h-full rounded-full transition-all" style={{ width: `${prozent}%`, background: farbe }} />
    </div>
  );
}
