export function PotenzialDots({ wert, groesse = 'sm' }: { wert: 1 | 2 | 3 | 4 | 5; groesse?: 'sm' | 'md' }) {
  const dim = groesse === 'sm' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5';
  return (
    <div className="flex items-center gap-0.5" aria-label={`Potenzial ${wert} von 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`${dim} rounded-full ${i <= wert ? 'bg-[var(--color-orange)]' : 'bg-[var(--color-line)]'}`}
        />
      ))}
    </div>
  );
}

export function PotenzialAuswahl({
  wert,
  onChange,
}: {
  wert: 1 | 2 | 3 | 4 | 5;
  onChange: (wert: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {([1, 2, 3, 4, 5] as const).map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition ${
            i <= wert
              ? 'border-[var(--color-orange)] bg-[var(--color-orange)] text-white'
              : 'border-[var(--color-line)] bg-white text-[var(--color-ink)]/50'
          }`}
        >
          {i}
        </button>
      ))}
    </div>
  );
}
