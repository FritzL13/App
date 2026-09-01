import type { Kunde, Kandidat, KontaktEintrag, KundeStatus, Ziele } from '../types';

export function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function isHeuteOderFrueher(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() <= startOfDay(new Date()).getTime() + 24 * 60 * 60 * 1000 - 1;
}

export function getWeekRange(referenz: Date, offsetWeeks = 0): { start: Date; end: Date } {
  const d = new Date(referenz);
  const tag = (d.getDay() + 6) % 7; // 0 = Montag
  const montag = startOfDay(d);
  montag.setDate(montag.getDate() - tag + offsetWeeks * 7);
  const sonntag = new Date(montag);
  sonntag.setDate(sonntag.getDate() + 6);
  sonntag.setHours(23, 59, 59, 999);
  return { start: montag, end: sonntag };
}

export function istInBereich(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function arbeitstageZwischen(von: Date, bis: Date): number {
  if (bis.getTime() <= von.getTime()) return 0;
  let count = 0;
  const cur = startOfDay(von);
  const end = startOfDay(bis);
  while (cur.getTime() <= end.getTime()) {
    const tag = cur.getDay();
    if (tag !== 0 && tag !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export interface WochenFortschritt {
  kundenkontakte: number;
  kandidatenkontakte: number;
}

export function wochenFortschritt(kontakte: KontaktEintrag[], offsetWeeks = 0): WochenFortschritt {
  const { start, end } = getWeekRange(new Date(), offsetWeeks);
  const inWoche = kontakte.filter((k) => istInBereich(k.datum, start, end));
  return {
    kundenkontakte: inWoche.filter((k) => k.bezugTyp === 'Kunde').length,
    kandidatenkontakte: inWoche.filter((k) => k.bezugTyp === 'Kandidat').length,
  };
}

export function kundenIdsMitKontakt(kontakte: KontaktEintrag[]): Set<string> {
  return new Set(kontakte.filter((k) => k.bezugTyp === 'Kunde').map((k) => k.kundeId));
}

export function istErstkontaktiert(kunde: Kunde, kontakteIds: Set<string>): boolean {
  return kontakteIds.has(kunde.id);
}

export interface Erfolgsquote {
  anzahlErstkontaktiert: number;
  anzahlVertragAktiv: number;
  quote: number | null; // null wenn nicht berechenbar
  ausreichendDaten: boolean; // >= 5 erstkontaktierte Kunden
}

export function tatsaechlicheErfolgsquote(kunden: Kunde[], kontakte: KontaktEintrag[]): Erfolgsquote {
  const kontaktIds = kundenIdsMitKontakt(kontakte);
  const erstkontaktierteKunden = kunden.filter((k) => istErstkontaktiert(k, kontaktIds));
  const anzahlErstkontaktiert = erstkontaktierteKunden.length;
  const anzahlVertragAktiv = erstkontaktierteKunden.filter((k) => k.status === 'Vertrag aktiv').length;
  return {
    anzahlErstkontaktiert,
    anzahlVertragAktiv,
    quote: anzahlErstkontaktiert > 0 ? (anzahlVertragAktiv / anzahlErstkontaktiert) * 100 : null,
    ausreichendDaten: anzahlErstkontaktiert >= 5,
  };
}

export interface Rueckwaertsrechnung {
  aktiveKunden: number;
  restBedarf: number;
  erstkontakteGesamt: number | null;
  arbeitstageBisZiel: number;
  erstkontaktePerArbeitstag: number | null;
}

export function berechneRueckwaertsrechnung(
  aktiveKunden: number,
  hauptzielAnzahl: number | null,
  hauptzielDatum: string | null,
  erfolgsquoteProzent: number,
): Rueckwaertsrechnung {
  const restBedarf = Math.max(0, (hauptzielAnzahl ?? 0) - aktiveKunden);
  const quoteAnteil = erfolgsquoteProzent / 100;

  let erstkontakteGesamt: number | null = null;
  if (quoteAnteil > 0 && restBedarf > 0) {
    erstkontakteGesamt = Math.ceil(restBedarf / quoteAnteil);
  } else if (restBedarf === 0) {
    erstkontakteGesamt = 0;
  }

  const arbeitstageBisZiel = hauptzielDatum
    ? arbeitstageZwischen(new Date(), new Date(hauptzielDatum))
    : 0;

  let erstkontaktePerArbeitstag: number | null = null;
  if (erstkontakteGesamt !== null && arbeitstageBisZiel > 0) {
    erstkontaktePerArbeitstag = Math.ceil(erstkontakteGesamt / arbeitstageBisZiel);
  }

  return {
    aktiveKunden,
    restBedarf,
    erstkontakteGesamt,
    arbeitstageBisZiel,
    erstkontaktePerArbeitstag,
  };
}

export interface EffektiveQuote {
  wert: number;
  quelle: 'tatsaechlich' | 'geschaetzt';
}

export function effektiveErfolgsquote(ziele: Ziele, echte: Erfolgsquote): EffektiveQuote {
  if (ziele.quoteModus === 'auto' && echte.ausreichendDaten && echte.quote !== null) {
    return { wert: echte.quote, quelle: 'tatsaechlich' };
  }
  return { wert: ziele.erfolgsquote, quelle: 'geschaetzt' };
}

export function letzterKontakt(kundeId: string, kontakte: KontaktEintrag[]): KontaktEintrag | null {
  const relevante = kontakte.filter((k) => k.kundeId === kundeId);
  if (relevante.length === 0) return null;
  return relevante.reduce((neuester, k) => (new Date(k.datum) > new Date(neuester.datum) ? k : neuester));
}

export function monateSeit(iso: string): number {
  const dann = new Date(iso);
  const jetzt = new Date();
  return (
    (jetzt.getFullYear() - dann.getFullYear()) * 12 +
    (jetzt.getMonth() - dann.getMonth()) -
    (jetzt.getDate() < dann.getDate() ? 1 : 0)
  );
}

const FUNNEL_ORDER: KundeStatus[] = [
  'Neu identifiziert',
  'Erstkontakt versendet',
  'Rückmeldung erhalten',
  'Termin vereinbart',
  'Angebot erstellt',
  'Vertrag aktiv',
];

export function funnelIndex(status: KundeStatus): number {
  const idx = FUNNEL_ORDER.indexOf(status);
  return idx === -1 ? -1 : idx;
}

export interface ConversionReport {
  erstkontaktiert: number;
  termin: number;
  vertrag: number;
  quoteTermin: number | null;
  quoteVertrag: number | null;
}

export function conversionReport(kunden: Kunde[], kontakte: KontaktEintrag[]): ConversionReport {
  const kontaktIds = kundenIdsMitKontakt(kontakte);
  const erstkontaktiert = kunden.filter(
    (k) => kontaktIds.has(k.id) || funnelIndex(k.status) >= 1,
  ).length;
  const termin = kunden.filter((k) => funnelIndex(k.status) >= 3).length;
  const vertrag = kunden.filter((k) => k.status === 'Vertrag aktiv').length;
  return {
    erstkontaktiert,
    termin,
    vertrag,
    quoteTermin: erstkontaktiert > 0 ? (termin / erstkontaktiert) * 100 : null,
    quoteVertrag: erstkontaktiert > 0 ? (vertrag / erstkontaktiert) * 100 : null,
  };
}

export interface WochenReport {
  kundenkontakte: { diese: number; vorwoche: number };
  kandidatenkontakte: { diese: number; vorwoche: number };
  neueTermine: { diese: number; vorwoche: number };
  neueAktiveKunden: { diese: number; vorwoche: number };
}

export function erstelleWochenReport(kunden: Kunde[], kontakte: KontaktEintrag[]): WochenReport {
  const diese = getWeekRange(new Date(), 0);
  const vorwoche = getWeekRange(new Date(), -1);

  const kontakteImBereich = (typ: 'Kunde' | 'Kandidat', start: Date, end: Date) =>
    kontakte.filter((k) => k.bezugTyp === typ && istInBereich(k.datum, start, end)).length;

  const kundenImStatusSeitBereich = (status: KundeStatus, start: Date, end: Date) =>
    kunden.filter((k) => k.status === status && istInBereich(k.statusSeit, start, end)).length;

  return {
    kundenkontakte: {
      diese: kontakteImBereich('Kunde', diese.start, diese.end),
      vorwoche: kontakteImBereich('Kunde', vorwoche.start, vorwoche.end),
    },
    kandidatenkontakte: {
      diese: kontakteImBereich('Kandidat', diese.start, diese.end),
      vorwoche: kontakteImBereich('Kandidat', vorwoche.start, vorwoche.end),
    },
    neueTermine: {
      diese: kundenImStatusSeitBereich('Termin vereinbart', diese.start, diese.end),
      vorwoche: kundenImStatusSeitBereich('Termin vereinbart', vorwoche.start, vorwoche.end),
    },
    neueAktiveKunden: {
      diese: kundenImStatusSeitBereich('Vertrag aktiv', diese.start, diese.end),
      vorwoche: kundenImStatusSeitBereich('Vertrag aktiv', vorwoche.start, vorwoche.end),
    },
  };
}

export function zaehleNachStatus(kunden: Kunde[]): Record<KundeStatus, number> {
  const result = {} as Record<KundeStatus, number>;
  for (const k of kunden) {
    result[k.status] = (result[k.status] ?? 0) + 1;
  }
  return result;
}

export function sucheKandidaten(kandidaten: Kandidat[], suchtext: string): Kandidat[] {
  const q = suchtext.trim().toLowerCase();
  if (!q) return kandidaten;
  return kandidaten.filter(
    (k) => k.name.toLowerCase().includes(q) || k.beruf.toLowerCase().includes(q) || k.ort.toLowerCase().includes(q),
  );
}
