import type { ReactNode } from 'react';
import type { Kunde } from '../types';
import { Card } from './Card';
import { StatusBadge, NeuBadge } from './StatusBadge';
import { PotenzialDots } from './PotenzialDots';
import { formatDatum } from '../lib/format';
import { istLangeUnbearbeitet, tageZwischen } from '../lib/priority';

export function KundeKarte({
  kunde,
  istNeu = false,
  hinweis,
  aktionen,
  onClick,
}: {
  kunde: Kunde;
  istNeu?: boolean;
  hinweis?: ReactNode;
  aktionen?: ReactNode;
  onClick?: () => void;
}) {
  const langeUnbearbeitet = istLangeUnbearbeitet(kunde);

  return (
    <Card onClick={onClick} className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate font-semibold text-[var(--color-ink)]">{kunde.firma}</span>
            {istNeu && <NeuBadge />}
          </div>
          <p className="truncate text-xs text-[var(--color-ink)]/60">
            {kunde.branche || 'Branche unbekannt'} · {kunde.ort || 'Ort unbekannt'}
          </p>
        </div>
        <PotenzialDots wert={kunde.potenzial} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={kunde.status} />
        {kunde.naechsterKontakt && (
          <span className="text-[11px] text-[var(--color-ink)]/55">
            Nächster Kontakt: {formatDatum(kunde.naechsterKontakt)}
          </span>
        )}
      </div>

      {langeUnbearbeitet && (
        <p className="text-[11px] font-medium text-[var(--color-orange)]">
          seit {tageZwischen(kunde.statusSeit)} Tagen ohne Fortschritt
        </p>
      )}

      {hinweis && <p className="text-xs text-[var(--color-ink)]/60">{hinweis}</p>}

      {aktionen && <div className="flex gap-2 pt-1">{aktionen}</div>}
    </Card>
  );
}
