const AKTIV_KEY = 'vertriebscockpit-erinnerungen-aktiv';
const LETZTE_ERINNERUNG_KEY = 'vertriebscockpit-letzte-erinnerung';

export function werdenErinnerungenUnterstuetzt(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function erinnerungenSindAktiv(): boolean {
  return localStorage.getItem(AKTIV_KEY) === 'true';
}

export function setzeErinnerungenAktiv(aktiv: boolean): void {
  localStorage.setItem(AKTIV_KEY, aktiv ? 'true' : 'false');
}

export function berechtigungsStatus(): NotificationPermission | 'nicht-unterstuetzt' {
  if (!werdenErinnerungenUnterstuetzt()) return 'nicht-unterstuetzt';
  return Notification.permission;
}

export async function berechtigungAnfordern(): Promise<NotificationPermission> {
  if (!werdenErinnerungenUnterstuetzt()) return 'denied';
  return Notification.requestPermission();
}

function heuteDatumsstring(): string {
  return new Date().toISOString().slice(0, 10);
}

export function wurdeHeuteSchonErinnert(): boolean {
  return localStorage.getItem(LETZTE_ERINNERUNG_KEY) === heuteDatumsstring();
}

function markiereHeuteAlsErinnert(): void {
  localStorage.setItem(LETZTE_ERINNERUNG_KEY, heuteDatumsstring());
}

export function zeigeFaelligeErinnerungFallsNoetig(anzahlFaellig: number): void {
  if (anzahlFaellig <= 0) return;
  if (!erinnerungenSindAktiv()) return;
  if (!werdenErinnerungenUnterstuetzt() || Notification.permission !== 'granted') return;
  if (wurdeHeuteSchonErinnert()) return;

  new Notification('Vertriebscockpit Rostock', {
    body:
      anzahlFaellig === 1
        ? '1 Kontakt ist heute fällig.'
        : `${anzahlFaellig} Kontakte sind heute fällig.`,
    icon: '/icon-192.png',
    tag: 'heute-faellig',
  });
  markiereHeuteAlsErinnert();
}
