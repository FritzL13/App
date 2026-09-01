import type { Backup, Kunde, Kandidat, KontaktEintrag, Ziele } from '../types';

export function erstelleBackup(
  kunden: Kunde[],
  kandidaten: Kandidat[],
  kontakte: KontaktEintrag[],
  ziele: Ziele,
): Backup {
  return {
    version: 1,
    exportiertAm: new Date().toISOString(),
    kunden,
    kandidaten,
    kontakte,
    ziele,
  };
}

export function downloadBackup(backup: Backup): void {
  const datum = new Date().toISOString().slice(0, 10);
  const dateiname = `vertriebscockpit-backup-${datum}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dateiname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBackup(json: string): Backup {
  const data = JSON.parse(json);
  if (!data || !Array.isArray(data.kunden) || !Array.isArray(data.kandidaten) || !Array.isArray(data.kontakte)) {
    throw new Error('Ungültiges Backup-Format');
  }
  return data as Backup;
}
