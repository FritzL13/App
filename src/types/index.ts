export type KundeStatus =
  | 'Neu identifiziert'
  | 'Erstkontakt versendet'
  | 'Rückmeldung erhalten'
  | 'Termin vereinbart'
  | 'Angebot erstellt'
  | 'Vertrag aktiv'
  | 'Kein Interesse'
  | 'Pausiert';

export const KUNDE_STATUS_LIST: KundeStatus[] = [
  'Neu identifiziert',
  'Erstkontakt versendet',
  'Rückmeldung erhalten',
  'Termin vereinbart',
  'Angebot erstellt',
  'Vertrag aktiv',
  'Kein Interesse',
  'Pausiert',
];

export interface Kunde {
  id: string;
  firma: string;
  branche: string;
  ort: string;
  ansprechpartner: string;
  telefon: string;
  email: string;
  potenzial: 1 | 2 | 3 | 4 | 5;
  status: KundeStatus;
  statusSeit: string; // ISO-Datum
  fokus: string; // gesuchte Qualifikationen, kommagetrennt
  naechsterKontakt: string | null; // ISO-Datum
  notizen: string;
  erstelltAm: string; // ISO-Datum
}

export type KontaktArt = 'Anruf' | 'E-Mail' | 'Termin' | 'Sonstiges';

export interface KontaktEintrag {
  id: string;
  kundeId: string; // oder kandidatId
  bezugTyp: 'Kunde' | 'Kandidat';
  datum: string; // ISO-Datum
  art: KontaktArt;
  notiz: string;
}

export type KandidatStatus =
  | 'Neu'
  | 'Kontaktiert'
  | 'Vorstellungsgespräch'
  | 'Vermittelt'
  | 'Nicht verfügbar';

export const KANDIDAT_STATUS_LIST: KandidatStatus[] = [
  'Neu',
  'Kontaktiert',
  'Vorstellungsgespräch',
  'Vermittelt',
  'Nicht verfügbar',
];

export interface Kandidat {
  id: string;
  name: string;
  beruf: string;
  ort: string;
  verfuegbarAb: string | null;
  telefon: string;
  email: string;
  status: KandidatStatus;
  notizen: string;
}

export interface Ziele {
  wocheKunden: number;
  wocheKandidaten: number;
  hauptzielAnzahl: number | null;
  hauptzielDatum: string | null;
  erfolgsquote: number; // Prozent, Erstkontakt -> Vertrag (manuelle Schätzung)
  quoteModus: 'auto' | 'geschaetzt'; // auto = tatsächliche Quote nutzen sobald genug Daten vorliegen
}

export interface Backup {
  version: 1;
  exportiertAm: string;
  kunden: Kunde[];
  kandidaten: Kandidat[];
  kontakte: KontaktEintrag[];
  ziele: Ziele;
}
