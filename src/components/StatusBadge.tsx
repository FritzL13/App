import type { KundeStatus, KandidatStatus } from '../types';

const KUNDE_FARBEN: Record<KundeStatus, string> = {
  'Neu identifiziert': 'bg-[var(--color-line)] text-[var(--color-ink)]',
  'Erstkontakt versendet': 'bg-[#e4eef0] text-[var(--color-petrol)]',
  'Rückmeldung erhalten': 'bg-[#d9e9eb] text-[var(--color-petrol)]',
  'Termin vereinbart': 'bg-[#ffe4d1] text-[#b04c0f]',
  'Angebot erstellt': 'bg-[#ffd9bd] text-[#b04c0f]',
  'Vertrag aktiv': 'bg-[#1f7a4d]/12 text-[#1f7a4d]',
  'Kein Interesse': 'bg-[#c23b2e]/10 text-[#c23b2e]',
  Pausiert: 'bg-[#101826]/8 text-[#101826]/60',
};

const KANDIDAT_FARBEN: Record<KandidatStatus, string> = {
  Neu: 'bg-[var(--color-line)] text-[var(--color-ink)]',
  Kontaktiert: 'bg-[#e4eef0] text-[var(--color-petrol)]',
  Vorstellungsgespräch: 'bg-[#ffe4d1] text-[#b04c0f]',
  Vermittelt: 'bg-[#1f7a4d]/12 text-[#1f7a4d]',
  'Nicht verfügbar': 'bg-[#101826]/8 text-[#101826]/60',
};

export function StatusBadge({ status }: { status: KundeStatus | KandidatStatus }) {
  const klasse = KUNDE_FARBEN[status as KundeStatus] ?? KANDIDAT_FARBEN[status as KandidatStatus];
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${klasse}`}>
      {status}
    </span>
  );
}

export function NeuBadge() {
  return (
    <span className="inline-block whitespace-nowrap rounded-full bg-[var(--color-orange)] px-2 py-0.5 text-[11px] font-bold text-white">
      NEU
    </span>
  );
}
