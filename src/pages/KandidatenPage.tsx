import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { FAB } from '../components/FAB';
import { Button } from '../components/Button';
import { KandidatKarte } from '../components/KandidatKarte';
import { SchnellnotizModal } from '../components/SchnellnotizModal';
import { IconSearch } from '../components/Icons';
import { KandidatFormModal } from './kandidaten/KandidatFormModal';
import type { Kandidat } from '../types';
import { sucheKandidaten } from '../lib/analytics';

export function KandidatenPage() {
  const { kandidaten, kontakte, speichereKandidat, entferneKandidat, erfasseKontakt } = useStore();
  const [suche, setSuche] = useState('');
  const [bearbeiteterKandidat, setBearbeiteterKandidat] = useState<Kandidat | null | undefined>(undefined);
  const [schnellnotizFuer, setSchnellnotizFuer] = useState<Kandidat | null>(null);

  const gefiltert = useMemo(() => sucheKandidaten(kandidaten, suche), [kandidaten, suche]);

  const kontaktverlaufFuerBearbeitet = bearbeiteterKandidat
    ? kontakte.filter((k) => k.kundeId === bearbeiteterKandidat.id)
    : [];

  return (
    <div>
      <PageHeader title="Kandidaten" />

      <div className="space-y-4 px-4 py-4">
        <div className="relative">
          <IconSearch
            width={16}
            height={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink)]/40"
          />
          <input
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Suche nach Name, Beruf oder Ort…"
            className="w-full rounded-xl border border-[var(--color-line)] bg-white py-2.5 pl-9 pr-3 text-sm text-[var(--color-ink)]"
          />
        </div>

        {kandidaten.length === 0 ? (
          <EmptyState text="Noch keine Kandidat:innen erfasst – über + hinzufügen." />
        ) : gefiltert.length === 0 ? (
          <EmptyState text="Keine Kandidat:innen gefunden – Suche anpassen." />
        ) : (
          <div className="space-y-2">
            {gefiltert.map((k) => (
              <KandidatKarte
                key={k.id}
                kandidat={k}
                onClick={() => setBearbeiteterKandidat(k)}
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

      <FAB onClick={() => setBearbeiteterKandidat(null)} label="Kandidat:in anlegen" />

      {bearbeiteterKandidat !== undefined && (
        <KandidatFormModal
          kandidat={bearbeiteterKandidat}
          kontaktverlauf={kontaktverlaufFuerBearbeitet}
          onClose={() => setBearbeiteterKandidat(undefined)}
          onSpeichern={speichereKandidat}
          onLoeschen={async (id) => {
            await entferneKandidat(id);
            setBearbeiteterKandidat(undefined);
          }}
        />
      )}

      {schnellnotizFuer && (
        <SchnellnotizModal
          titel={`Kontakt erfassen – ${schnellnotizFuer.name}`}
          onClose={() => setSchnellnotizFuer(null)}
          onSubmit={(art, notiz) => erfasseKontakt(schnellnotizFuer.id, 'Kandidat', art, notiz)}
        />
      )}
    </div>
  );
}
