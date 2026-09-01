export function formatDatum(iso: string | null): string {
  if (!iso) return '–';
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDatumKurz(iso: string | null): string {
  if (!iso) return '–';
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

export function heuteIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function plusTageIso(tage: number, von: Date = new Date()): string {
  const d = new Date(von);
  d.setDate(d.getDate() + tage);
  return d.toISOString();
}
