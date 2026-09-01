import { useMemo } from 'react';
import { useStore } from '../lib/store';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { matchbareKunden, passendeKandidaten } from '../lib/matching';
import { sortByPrioritaet } from '../lib/priority';

export function MatchingPage() {
  const { kunden, kandidaten } = useStore();

  const kundenMitFokus = useMemo(() => sortByPrioritaet(matchbareKunden(kunden)), [kunden]);

  return (
    <div>
      <PageHeader title="Matching" />
      <div className="space-y-3 px-4 py-4">
        {kundenMitFokus.length === 0 ? (
          <EmptyState text="Noch keine Kunden mit hinterlegtem Fokus – bei einem Kunden Qualifikationen eintragen." />
        ) : (
          kundenMitFokus.map((kunde) => {
            const treffer = passendeKandidaten(kunde, kandidaten);
            return (
              <Card key={kunde.id} className="space-y-2.5">
                <div>
                  <p className="font-semibold text-[var(--color-ink)]">{kunde.firma}</p>
                  <p className="text-xs text-[var(--color-ink)]/60">
                    {kunde.ort || 'Ort unbekannt'} · gesucht: {kunde.fokus}
                  </p>
                </div>
                {treffer.length === 0 ? (
                  <p className="rounded-lg bg-[var(--color-orange)]/8 px-2.5 py-1.5 text-xs font-medium text-[var(--color-orange)]">
                    Kein passender Kandidat – Recruiting nötig
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {treffer.map((k) => (
                      <div
                        key={k.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--color-ink)]">{k.name}</p>
                          <p className="truncate text-xs text-[var(--color-ink)]/55">{k.beruf}</p>
                        </div>
                        <StatusBadge status={k.status} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
