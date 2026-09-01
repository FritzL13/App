import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { FAB } from '../components/FAB';
import { Button } from '../components/Button';
import { KundeKarte } from '../components/KundeKarte';
import { SchnellnotizModal } from '../components/SchnellnotizModal';
import { IconSearch, IconUpload } from '../components/Icons';
import { KundeFormModal } from './kunden/KundeFormModal';
import { LeadImportModal } from './kunden/LeadImportModal';
import type { Kunde, KundeStatus } from '../types';
import { KUNDE_STATUS_LIST } from '../types';
import { sortByPrioritaet } from '../lib/priority';
import { tageZwischen } from '../lib/priority';
import { kundenIdsMitKontakt, zaehleNachStatus } from '../lib/analytics';
import { plusTageIso } from '../lib/format';

export function KundenPage() {
  const { kunden, kontakte, speichereKunde, entferneKunde, erfasseKontakt } = useStore();
  const [suche, setSuche] = useState('');
  const [statusFilter, setStatusFilter] = useState<KundeStatus | null>(null);
  const [bearbeiteterKunde, setBearbeiteterKunde] = useState<Kunde | null | undefined>(undefined);
  const [schnellnotizFuer, setSchnellnotizFuer] = useState<Kunde | null>(null);
  const [importOffen, setImportOffen] = useState(false);

  const kontaktIds = useMemo(() => kundenIdsMitKontakt(kontakte), [kontakte]);
  const statusZahlen = useMemo(() => zaehleNachStatus(kunden), [kunden]);

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase();
    let liste = kunden;
    if (statusFilter) liste = liste.filter((k) => k.status === statusFilter);
    if (q) liste = liste.filter((k) => k.firma.toLowerCase().includes(q) || k.ort.toLowerCase().includes(q));
    return sortByPrioritaet(liste);
  }, [kunden, suche, statusFilter]);

  function istNeu(k: Kunde) {
    return !kontaktIds.has(k.id) && tageZwischen(k.erstelltAm) <= 7;
  }

  async function kontaktSpeichern(kunde: Kunde, art: Parameters<typeof erfasseKontakt>[2], notiz: string) {
    await erfasseKontakt(kunde.id, 'Kunde', art, notiz);
    await speichereKunde({ ...kunde, naechsterKontakt: plusTageIso(7) });
  }

  const kontaktverlaufFuerBearbeitet = bearbeiteterKunde
    ? kontakte.filter((k) => k.kundeId === bearbeiteterKunde.id)
    : [];

  return (
    <div>
      <PageHeader
        title="Kunden"
        action={
          <button
            type="button"
            onClick={() => setImportOffen(true)}
            aria-label="Lead-Import"
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10"
          >
            <IconUpload width={20} height={20} />
          </button>
        }
      />

      <div className="space-y-4 px-4 py-4">
        {/* Akquise-Trichter */}
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
          {KUNDE_STATUS_LIST.map((status) => {
            const aktiv = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(aktiv ? null : status)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                  aktiv
                    ? 'border-[var(--color-orange)] bg-[var(--color-orange)] text-white'
                    : 'border-[var(--color-line)] bg-white text-[var(--color-ink)]/70'
                }`}
              >
                {status}
                <span className={aktiv ? 'text-white/80' : 'text-[var(--color-ink)]/40'}>
                  {statusZahlen[status] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Suche */}
        <div className="relative">
          <IconSearch
            width={16}
            height={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink)]/40"
          />
          <input
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Suche nach Firma oder Ort…"
            className="w-full rounded-xl border border-[var(--color-line)] bg-white py-2.5 pl-9 pr-3 text-sm text-[var(--color-ink)]"
          />
        </div>

        {/* Liste */}
        {kunden.length === 0 ? (
          <EmptyState text="Noch keine Kunden erfasst – über + hinzufügen." />
        ) : gefiltert.length === 0 ? (
          <EmptyState text="Keine Kunden gefunden – Suche oder Filter anpassen." />
        ) : (
          <div className="space-y-2">
            {gefiltert.map((k) => (
              <KundeKarte
                key={k.id}
                kunde={k}
                istNeu={istNeu(k)}
                onClick={() => setBearbeiteterKunde(k)}
                aktionen={
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSchnellnotizFuer(k);
                    }}
                  >
                    Kontakt erfassen
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>

      <FAB onClick={() => setBearbeiteterKunde(null)} label="Kunde anlegen" />

      {bearbeiteterKunde !== undefined && (
        <KundeFormModal
          kunde={bearbeiteterKunde}
          kontaktverlauf={kontaktverlaufFuerBearbeitet}
          onClose={() => setBearbeiteterKunde(undefined)}
          onSpeichern={speichereKunde}
          onLoeschen={async (id) => {
            await entferneKunde(id);
            setBearbeiteterKunde(undefined);
          }}
        />
      )}

      {schnellnotizFuer && (
        <SchnellnotizModal
          titel={`Kontakt erfassen – ${schnellnotizFuer.firma}`}
          onClose={() => setSchnellnotizFuer(null)}
          onSubmit={(art, notiz) => kontaktSpeichern(schnellnotizFuer, art, notiz)}
        />
      )}

      {importOffen && (
        <LeadImportModal
          bestehendeKunden={kunden}
          onClose={() => setImportOffen(false)}
          onImport={async (neueKunden) => {
            for (const k of neueKunden) {
              await speichereKunde(k);
            }
          }}
        />
      )}
    </div>
  );
}
