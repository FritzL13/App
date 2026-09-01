import type { ReactNode } from 'react';
import type { Kandidat } from '../types';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { formatDatum } from '../lib/format';

export function KandidatKarte({
  kandidat,
  onClick,
  aktionen,
}: {
  kandidat: Kandidat;
  onClick?: () => void;
  aktionen?: ReactNode;
}) {
  return (
    <Card onClick={onClick} className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--color-ink)]">{kandidat.name}</p>
          <p className="truncate text-xs text-[var(--color-ink)]/60">
            {kandidat.beruf || 'Beruf unbekannt'} · {kandidat.ort || 'Ort unbekannt'}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={kandidat.status} />
        {kandidat.verfuegbarAb && (
          <span className="text-[11px] text-[var(--color-ink)]/55">Verfügbar ab {formatDatum(kandidat.verfuegbarAb)}</span>
        )}
      </div>
      {aktionen && <div className="flex gap-2 pt-1">{aktionen}</div>}
    </Card>
  );
}
