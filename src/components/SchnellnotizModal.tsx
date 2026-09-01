import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import type { KontaktArt } from '../types';

const ARTEN: KontaktArt[] = ['Anruf', 'E-Mail', 'Termin', 'Sonstiges'];

export function SchnellnotizModal({
  titel,
  onClose,
  onSubmit,
}: {
  titel: string;
  onClose: () => void;
  onSubmit: (art: KontaktArt, notiz: string) => Promise<void>;
}) {
  const [art, setArt] = useState<KontaktArt>('Anruf');
  const [notiz, setNotiz] = useState('');
  const [speichert, setSpeichert] = useState(false);

  async function speichern() {
    setSpeichert(true);
    try {
      await onSubmit(art, notiz.trim());
      onClose();
    } finally {
      setSpeichert(false);
    }
  }

  return (
    <Modal title={titel} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs text-[var(--color-ink)]/60">Art des Kontakts</p>
          <div className="grid grid-cols-4 gap-1.5">
            {ARTEN.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setArt(a)}
                className={`rounded-xl border px-1 py-2 text-xs font-medium ${
                  art === a
                    ? 'border-[var(--color-orange)] bg-[var(--color-orange)] text-white'
                    : 'border-[var(--color-line)] bg-white text-[var(--color-ink)]/60'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <label className="block text-xs text-[var(--color-ink)]/60">
          Notiz zum Ergebnis
          <textarea
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            rows={3}
            placeholder="z. B. Bedarf an Schlossern ab November, Angebot folgt"
            className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
          />
        </label>
        <p className="text-[11px] text-[var(--color-ink)]/45">
          Der nächste Kontakttermin wird automatisch auf in 7 Tagen gesetzt.
        </p>
        <Button className="w-full" onClick={speichern} disabled={speichert}>
          Kontakt speichern
        </Button>
      </div>
    </Modal>
  );
}
