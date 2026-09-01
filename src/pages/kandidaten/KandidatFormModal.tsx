import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { IconTrash, IconPhone, IconMail, IconCalendar } from '../../components/Icons';
import type { Kandidat, KontaktEintrag } from '../../types';
import { KANDIDAT_STATUS_LIST } from '../../types';
import { generateId } from '../../lib/id';
import { formatDatum } from '../../lib/format';

const feldKlasse =
  'mt-1 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]';
const labelKlasse = 'block text-xs text-[var(--color-ink)]/60';

function leererKandidat(): Kandidat {
  return {
    id: generateId(),
    name: '',
    beruf: '',
    ort: '',
    verfuegbarAb: null,
    telefon: '',
    email: '',
    status: 'Neu',
    notizen: '',
  };
}

export function KandidatFormModal({
  kandidat,
  kontaktverlauf,
  onClose,
  onSpeichern,
  onLoeschen,
}: {
  kandidat: Kandidat | null;
  kontaktverlauf: KontaktEintrag[];
  onClose: () => void;
  onSpeichern: (kandidat: Kandidat) => Promise<void>;
  onLoeschen?: (id: string) => Promise<void>;
}) {
  const istNeu = kandidat === null;
  const [form, setForm] = useState<Kandidat>(kandidat ?? leererKandidat());
  const [loeschenBestaetigen, setLoeschenBestaetigen] = useState(false);
  const [speichert, setSpeichert] = useState(false);

  async function speichern() {
    if (!form.name.trim()) return;
    setSpeichert(true);
    try {
      await onSpeichern(form);
      onClose();
    } finally {
      setSpeichert(false);
    }
  }

  const verlaufSortiert = [...kontaktverlauf].sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());

  return (
    <Modal title={istNeu ? 'Kandidat:in anlegen' : form.name || 'Kandidat:in bearbeiten'} onClose={onClose}>
      <div className="space-y-4 pb-4">
        <label className={labelKlasse}>
          Name *
          <input className={feldKlasse} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className={labelKlasse}>
            Beruf
            <input className={feldKlasse} value={form.beruf} onChange={(e) => setForm({ ...form, beruf: e.target.value })} />
          </label>
          <label className={labelKlasse}>
            Ort
            <input className={feldKlasse} value={form.ort} onChange={(e) => setForm({ ...form, ort: e.target.value })} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className={labelKlasse}>
            Telefon
            <input className={feldKlasse} value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
          </label>
          <label className={labelKlasse}>
            E-Mail
            <input
              className={feldKlasse}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
        </div>

        {(form.telefon || form.email) && (
          <div className="flex gap-2">
            {form.telefon && (
              <a
                href={`tel:${form.telefon}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-white py-2 text-xs font-medium text-[var(--color-petrol)]"
              >
                <IconPhone width={15} height={15} /> Anrufen
              </a>
            )}
            {form.email && (
              <a
                href={`mailto:${form.email}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-white py-2 text-xs font-medium text-[var(--color-petrol)]"
              >
                <IconMail width={15} height={15} /> E-Mail
              </a>
            )}
          </div>
        )}

        <label className={labelKlasse}>
          Verfügbar ab
          <input
            className={feldKlasse}
            type="date"
            value={form.verfuegbarAb ? form.verfuegbarAb.slice(0, 10) : ''}
            onChange={(e) =>
              setForm({ ...form, verfuegbarAb: e.target.value ? new Date(e.target.value).toISOString() : null })
            }
          />
        </label>

        <div>
          <p className={labelKlasse}>Status</p>
          <select
            className={feldKlasse}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Kandidat['status'] })}
          >
            {KANDIDAT_STATUS_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <label className={labelKlasse}>
          Notizen
          <textarea
            className={feldKlasse}
            rows={3}
            value={form.notizen}
            onChange={(e) => setForm({ ...form, notizen: e.target.value })}
          />
        </label>

        {!istNeu && (
          <div className="space-y-2 border-t border-[var(--color-line)] pt-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)]/70">
              <IconCalendar width={15} height={15} /> Kontaktverlauf
            </h3>
            {verlaufSortiert.length === 0 ? (
              <p className="text-xs text-[var(--color-ink)]/50">Noch kein Kontakt erfasst.</p>
            ) : (
              <div className="space-y-1.5">
                {verlaufSortiert.map((eintrag) => (
                  <div key={eintrag.id} className="rounded-xl bg-white border border-[var(--color-line)] px-3 py-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--color-petrol)]">{eintrag.art}</span>
                      <span className="text-[var(--color-ink)]/45">{formatDatum(eintrag.datum)}</span>
                    </div>
                    {eintrag.notiz && <p className="mt-0.5 text-xs text-[var(--color-ink)]/70">{eintrag.notiz}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={speichern} disabled={speichert || !form.name.trim()}>
            Speichern
          </Button>
        </div>

        {!istNeu && onLoeschen && (
          <div className="border-t border-[var(--color-line)] pt-4">
            {!loeschenBestaetigen ? (
              <button
                type="button"
                onClick={() => setLoeschenBestaetigen(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)]"
              >
                <IconTrash width={14} height={14} /> Kandidat:in löschen
              </button>
            ) : (
              <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-3">
                <p className="mb-2 text-xs text-[var(--color-ink)]/75">
                  Diese:n Kandidat:in inkl. Kontaktverlauf wirklich unwiderruflich löschen?
                </p>
                <div className="flex gap-2">
                  <Button variant="danger" className="flex-1" onClick={() => onLoeschen(form.id)}>
                    Endgültig löschen
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={() => setLoeschenBestaetigen(false)}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
