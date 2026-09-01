import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { IconCopy } from '../components/Icons';
import { VORLAGE_SITUATIONEN, generiereText, type VorlageSituation } from '../lib/templates';
import { sortByPrioritaet } from '../lib/priority';

export function VorlagenPage() {
  const { kunden } = useStore();
  const kundenSortiert = useMemo(() => sortByPrioritaet(kunden), [kunden]);
  const [kundeId, setKundeId] = useState<string>('');
  const [situation, setSituation] = useState<VorlageSituation>('E-Mail Erstansprache');
  const [kopiert, setKopiert] = useState(false);

  const kunde = kundenSortiert.find((k) => k.id === kundeId) ?? null;
  const text = kunde ? generiereText(kunde, situation) : '';

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(text);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch {
      setKopiert(false);
    }
  }

  return (
    <div>
      <PageHeader title="Vorlagen" />
      <div className="space-y-4 px-4 py-4">
        {kunden.length === 0 ? (
          <EmptyState text="Noch keine Kunden erfasst – im Kunden-Tab über + hinzufügen." />
        ) : (
          <>
            <label className="block text-xs text-[var(--color-ink)]/60">
              Kunde
              <select
                value={kundeId}
                onChange={(e) => setKundeId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm text-[var(--color-ink)]"
              >
                <option value="">– Kunde wählen –</option>
                {kundenSortiert.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.firma}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-[var(--color-ink)]/60">
              Situation
              <select
                value={situation}
                onChange={(e) => setSituation(e.target.value as VorlageSituation)}
                className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm text-[var(--color-ink)]"
              >
                {VORLAGE_SITUATIONEN.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            {kunde ? (
              <div className="space-y-3">
                <div className="whitespace-pre-wrap rounded-2xl border border-[var(--color-line)] bg-white p-4 text-sm leading-relaxed text-[var(--color-ink)]">
                  {text}
                </div>
                <Button className="flex w-full items-center justify-center gap-1.5" onClick={kopieren}>
                  <IconCopy width={16} height={16} /> {kopiert ? 'Kopiert!' : 'Text kopieren'}
                </Button>
              </div>
            ) : (
              <EmptyState text="Zuerst einen Kunden auswählen, um den Text zu generieren." />
            )}
          </>
        )}
      </div>
    </div>
  );
}
