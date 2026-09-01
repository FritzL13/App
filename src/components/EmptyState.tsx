export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-white/50 px-4 py-6 text-center text-sm text-[var(--color-ink)]/60">
      {text}
    </div>
  );
}
