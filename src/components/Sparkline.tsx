const HOEHE = 32;
const BALKEN_BREITE = 7;
const LUECKE = 2;
const RADIUS = 2;
const MIN_HOEHE = 2;

function balkenPfad(x: number, hoeheWert: number): string {
  const h = Math.max(MIN_HOEHE, hoeheWert);
  const y = HOEHE - h;
  const w = BALKEN_BREITE;
  const r = Math.min(RADIUS, h);
  return [
    `M ${x} ${HOEHE}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `L ${x + w} ${HOEHE}`,
    'Z',
  ].join(' ');
}

export function Sparkline({
  werte,
  labels,
  akzent = 'var(--color-orange)',
}: {
  werte: number[];
  labels?: string[];
  akzent?: string;
}) {
  const max = Math.max(1, ...werte);
  const breite = werte.length * BALKEN_BREITE + (werte.length - 1) * LUECKE;

  return (
    <svg width={breite} height={HOEHE} viewBox={`0 0 ${breite} ${HOEHE}`} role="img" aria-label="Verlauf der letzten Wochen">
      {werte.map((wert, i) => {
        const x = i * (BALKEN_BREITE + LUECKE);
        const istAktuell = i === werte.length - 1;
        const hoeheWert = (wert / max) * (HOEHE - MIN_HOEHE);
        return (
          <path
            key={i}
            d={balkenPfad(x, hoeheWert)}
            fill={istAktuell ? akzent : 'var(--color-ink)'}
            opacity={istAktuell ? 1 : 0.16}
          >
            {labels?.[i] && <title>{`${labels[i]}: ${wert}`}</title>}
          </path>
        );
      })}
    </svg>
  );
}
