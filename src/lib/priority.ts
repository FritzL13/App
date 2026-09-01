import type { Kunde } from '../types';

export function tageZwischen(isoVon: string, isoBis: Date = new Date()): number {
  const von = new Date(isoVon);
  const ms = isoBis.getTime() - von.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function prioritaetsScore(kunde: Kunde): number {
  const tageSeitStatusaenderung = tageZwischen(kunde.statusSeit);
  return kunde.potenzial * 10 + Math.min(tageSeitStatusaenderung, 60);
}

export function sortByPrioritaet(kunden: Kunde[]): Kunde[] {
  return [...kunden].sort((a, b) => prioritaetsScore(b) - prioritaetsScore(a));
}

export function istLangeUnbearbeitet(kunde: Kunde, schwelleTage = 14): boolean {
  return tageZwischen(kunde.statusSeit) > schwelleTage;
}
