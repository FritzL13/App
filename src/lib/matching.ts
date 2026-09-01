import type { Kunde, Kandidat } from '../types';

export function fokusStichwoerter(fokus: string): string[] {
  return fokus
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

export function passendeKandidaten(kunde: Kunde, kandidaten: Kandidat[]): Kandidat[] {
  const stichwoerter = fokusStichwoerter(kunde.fokus);
  if (stichwoerter.length === 0) return [];
  return kandidaten.filter((kand) => {
    const beruf = kand.beruf.trim().toLowerCase();
    if (!beruf) return false;
    return stichwoerter.some((s) => beruf.includes(s));
  });
}

export function matchbareKunden(kunden: Kunde[]): Kunde[] {
  return kunden.filter(
    (k) => k.fokus.trim().length > 0 && k.status !== 'Kein Interesse' && k.status !== 'Pausiert',
  );
}
