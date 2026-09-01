import type { Kunde, Kandidat } from '../types';
import { formatDatum } from './format';

const TRENNZEICHEN = ';';

function csvFeld(wert: string | number | null): string {
  const text = wert === null ? '' : String(wert);
  if (text.includes(TRENNZEICHEN) || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function zeile(felder: (string | number | null)[]): string {
  return felder.map(csvFeld).join(TRENNZEICHEN);
}

export function kundenZuCsv(kunden: Kunde[]): string {
  const kopf = zeile([
    'Firma',
    'Branche',
    'Ort',
    'Ansprechpartner',
    'Telefon',
    'E-Mail',
    'Potenzial',
    'Status',
    'Status seit',
    'Fokus',
    'Nächster Kontakt',
    'Notizen',
    'Erstellt am',
  ]);
  const zeilen = kunden.map((k) =>
    zeile([
      k.firma,
      k.branche,
      k.ort,
      k.ansprechpartner,
      k.telefon,
      k.email,
      k.potenzial,
      k.status,
      formatDatum(k.statusSeit),
      k.fokus,
      formatDatum(k.naechsterKontakt),
      k.notizen,
      formatDatum(k.erstelltAm),
    ]),
  );
  return '\ufeff' + [kopf, ...zeilen].join('\r\n');
}

export function kandidatenZuCsv(kandidaten: Kandidat[]): string {
  const kopf = zeile(['Name', 'Beruf', 'Ort', 'Verfügbar ab', 'Telefon', 'E-Mail', 'Status', 'Notizen']);
  const zeilen = kandidaten.map((k) =>
    zeile([k.name, k.beruf, k.ort, formatDatum(k.verfuegbarAb), k.telefon, k.email, k.status, k.notizen]),
  );
  return '\ufeff' + [kopf, ...zeilen].join('\r\n');
}

export function downloadCsv(inhalt: string, dateiname: string): void {
  const blob = new Blob([inhalt], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dateiname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
