import { useRef, useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { IconDownload, IconUpload } from '../../components/Icons';
import { useStore } from '../../lib/store';
import type { Ziele } from '../../types';
import { erstelleBackup, downloadBackup, parseBackup } from '../../lib/backup';
import { kundenZuCsv, kandidatenZuCsv, downloadCsv } from '../../lib/csv';
import { heuteIso } from '../../lib/format';
import {
  werdenErinnerungenUnterstuetzt,
  erinnerungenSindAktiv,
  setzeErinnerungenAktiv,
  berechtigungsStatus,
  berechtigungAnfordern,
} from '../../lib/notifications';

export function ZielSettingsModal({ onClose }: { onClose: () => void }) {
  const { ziele, aktualisiereZiele, kunden, kandidaten, kontakte, ersetzeAlleDaten } = useStore();
  const [form, setForm] = useState<Ziele>(ziele);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFehler, setImportFehler] = useState<string | null>(null);
  const [importErfolg, setImportErfolg] = useState(false);
  const [erinnerungenAktiv, setErinnerungenAktivState] = useState(erinnerungenSindAktiv());
  const [berechtigung, setBerechtigung] = useState(berechtigungsStatus());

  async function erinnerungenUmschalten() {
    if (erinnerungenAktiv) {
      setzeErinnerungenAktiv(false);
      setErinnerungenAktivState(false);
      return;
    }
    if (berechtigungsStatus() !== 'granted') {
      const ergebnis = await berechtigungAnfordern();
      setBerechtigung(ergebnis);
      if (ergebnis !== 'granted') return;
    }
    setzeErinnerungenAktiv(true);
    setErinnerungenAktivState(true);
  }

  function speichern() {
    aktualisiereZiele(form);
    onClose();
  }

  function exportieren() {
    const backup = erstelleBackup(kunden, kandidaten, kontakte, ziele);
    downloadBackup(backup);
  }

  function kundenCsvExportieren() {
    downloadCsv(kundenZuCsv(kunden), `kunden-${heuteIso()}.csv`);
  }

  function kandidatenCsvExportieren() {
    downloadCsv(kandidatenZuCsv(kandidaten), `kandidaten-${heuteIso()}.csv`);
  }

  function importierenKlick() {
    fileInputRef.current?.click();
  }

  async function onFileGewaehlt(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportFehler(null);
    setImportErfolg(false);
    try {
      const text = await file.text();
      const backup = parseBackup(text);
      const bestaetigt = window.confirm('Aktuelle Daten werden überschrieben – fortfahren?');
      if (!bestaetigt) return;
      await ersetzeAlleDaten({
        kunden: backup.kunden,
        kandidaten: backup.kandidaten,
        kontakte: backup.kontakte,
        ziele: backup.ziele,
      });
      setForm(backup.ziele);
      setImportErfolg(true);
    } catch {
      setImportFehler('Die Datei konnte nicht gelesen werden. Bitte eine gültige Backup-JSON-Datei wählen.');
    }
  }

  return (
    <Modal title="Ziele & Backup" onClose={onClose}>
      <div className="space-y-5">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-ink)]/70">Wochenziele</h3>
          <label className="block text-xs text-[var(--color-ink)]/60">
            Kundenkontakte pro Woche
            <input
              type="number"
              min={0}
              value={form.wocheKunden}
              onChange={(e) => setForm({ ...form, wocheKunden: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
            />
          </label>
          <label className="block text-xs text-[var(--color-ink)]/60">
            Kandidatenkontakte pro Woche
            <input
              type="number"
              min={0}
              value={form.wocheKandidaten}
              onChange={(e) => setForm({ ...form, wocheKandidaten: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
            />
          </label>
        </section>

        {werdenErinnerungenUnterstuetzt() && (
          <section className="space-y-2 border-t border-[var(--color-line)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]/70">Erinnerungen</h3>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-line)] bg-white px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--color-ink)]">"Heute fällig" beim Öffnen melden</p>
                <p className="text-[11px] text-[var(--color-ink)]/50">Einmal täglich, nur solange die App im Browser offen ist.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={erinnerungenAktiv}
                onClick={erinnerungenUmschalten}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  erinnerungenAktiv ? 'bg-[var(--color-orange)]' : 'bg-[var(--color-line)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                    erinnerungenAktiv ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            {berechtigung === 'denied' && (
              <p className="text-[11px] text-[var(--color-danger)]">
                Benachrichtigungen sind im Browser blockiert. Bitte in den Browser-Einstellungen für diese Seite erlauben.
              </p>
            )}
          </section>
        )}

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-ink)]/70">Hauptziel</h3>
          <label className="block text-xs text-[var(--color-ink)]/60">
            Zielanzahl aktive Kunden
            <input
              type="number"
              min={0}
              value={form.hauptzielAnzahl ?? ''}
              onChange={(e) =>
                setForm({ ...form, hauptzielAnzahl: e.target.value === '' ? null : Number(e.target.value) })
              }
              className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
            />
          </label>
          <label className="block text-xs text-[var(--color-ink)]/60">
            Zieldatum
            <input
              type="date"
              value={form.hauptzielDatum ? form.hauptzielDatum.slice(0, 10) : ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  hauptzielDatum: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
              className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
            />
          </label>
          <label className="block text-xs text-[var(--color-ink)]/60">
            Geschätzte Erfolgsquote (%) – Erstkontakt → Vertrag
            <input
              type="number"
              min={0}
              max={100}
              value={form.erfolgsquote}
              onChange={(e) => setForm({ ...form, erfolgsquote: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
            />
          </label>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setForm({ ...form, quoteModus: 'auto' })}
              className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold ${
                form.quoteModus === 'auto'
                  ? 'border-[var(--color-petrol)] bg-[var(--color-petrol)] text-white'
                  : 'border-[var(--color-line)] bg-white text-[var(--color-ink)]/60'
              }`}
            >
              Automatisch (tatsächlich sobald möglich)
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, quoteModus: 'geschaetzt' })}
              className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold ${
                form.quoteModus === 'geschaetzt'
                  ? 'border-[var(--color-petrol)] bg-[var(--color-petrol)] text-white'
                  : 'border-[var(--color-line)] bg-white text-[var(--color-ink)]/60'
              }`}
            >
              Immer Schätzung nutzen
            </button>
          </div>
        </section>

        <Button className="w-full" onClick={speichern}>
          Speichern
        </Button>

        <section className="space-y-2 border-t border-[var(--color-line)] pt-4">
          <h3 className="text-sm font-semibold text-[var(--color-ink)]/70">Backup & Datensicherheit</h3>
          <p className="text-xs text-[var(--color-ink)]/55">
            Alle Daten liegen nur auf diesem Gerät. Exportiere regelmäßig ein Backup.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex flex-1 items-center justify-center gap-1.5" onClick={exportieren}>
              <IconDownload width={16} height={16} /> Exportieren
            </Button>
            <Button variant="ghost" className="flex flex-1 items-center justify-center gap-1.5" onClick={importierenKlick}>
              <IconUpload width={16} height={16} /> Importieren
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={onFileGewaehlt} />
          {importFehler && <p className="text-xs text-[var(--color-danger)]">{importFehler}</p>}
          {importErfolg && <p className="text-xs text-[#1f7a4d]">Import erfolgreich – Daten wurden ersetzt.</p>}

          <p className="pt-2 text-xs text-[var(--color-ink)]/55">
            CSV-Export für Excel & Co. (JSON-Backup ist die vollständige Sicherung, CSV nur zum Weiterverarbeiten).
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex flex-1 items-center justify-center gap-1.5"
              onClick={kundenCsvExportieren}
              disabled={kunden.length === 0}
            >
              <IconDownload width={16} height={16} /> Kunden CSV
            </Button>
            <Button
              variant="ghost"
              className="flex flex-1 items-center justify-center gap-1.5"
              onClick={kandidatenCsvExportieren}
              disabled={kandidaten.length === 0}
            >
              <IconDownload width={16} height={16} /> Kandidaten CSV
            </Button>
          </div>
        </section>
      </div>
    </Modal>
  );
}
