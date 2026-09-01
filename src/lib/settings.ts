import type { Ziele } from '../types';

const STORAGE_KEY = 'vertriebscockpit-ziele';

export const DEFAULT_ZIELE: Ziele = {
  wocheKunden: 15,
  wocheKandidaten: 10,
  hauptzielAnzahl: 20,
  hauptzielDatum: null,
  erfolgsquote: 20,
  quoteModus: 'auto',
};

export function getZiele(): Ziele {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ZIELE };
    const parsed = JSON.parse(raw) as Partial<Ziele>;
    return { ...DEFAULT_ZIELE, ...parsed };
  } catch {
    return { ...DEFAULT_ZIELE };
  }
}

export function setZiele(ziele: Ziele): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ziele));
}
