import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import type { Kunde } from '../../types';
import { generateId } from '../../lib/id';

function parsePotenzial(wert: string): 1 | 2 | 3 | 4 | 5 {
  const n = Math.round(Number(wert));
  if (n >= 1 && n <= 5) return n as 1 | 2 | 3 | 4 | 5;
  return 3;
}

interface ImportZeile {
  firma: string;
  branche: string;
  ort: string;
  fokus: string;
  potenzial: 1 | 2 | 3 | 4 | 5;
  telefon: string;
  notizen: string;
}

function parseZeilen(text: string): ImportZeile[] {
  return text
    .split('\n')
    .map((z) => z.trim())
    .filter((z) => z.length > 0)
    .map((zeile) => {
      const teile = zeile.split(';').map((t) => t.trim());
      const [firma = '', branche = '', ort = '', fokus = '', potenzial = '3', telefon = '', notizen = ''] = teile;
      return { firma, branche, ort, fokus, potenzial: parsePotenzial(potenzial), telefon, notizen };
    })
    .filter((z) => z.firma.length > 0);
}

export function LeadImportModal({
  bestehendeKunden,
  onClose,
  onImport,
}: {
  bestehendeKunden: Kunde[];
  onClose: () => void;
  onImport: (kunden: Kunde[]) => Promise<void>;
}) {
  const [text, setText] = useState('');
  const [importiert, setImportiert] = useState<{ anzahl: number; duplikate: number } | null>(null);

  const bestehendeNamen = new Set(bestehendeKunden.map((k) => k.firma.trim().toLowerCase()));
  const zeilen = parseZeilen(text);
  const neueZeilen = zeilen.filter((z) => !bestehendeNamen.has(z.firma.toLowerCase()));
  const duplikate = zeilen.length - neueZeilen.length;

  async function importieren() {
    const jetzt = new Date().toISOString();
    const gesehen = new Set<string>();
    const neueKunden: Kunde[] = [];
    for (const z of neueZeilen) {
      const key = z.firma.toLowerCase();
      if (gesehen.has(key)) continue;
      gesehen.add(key);
      neueKunden.push({
        id: generateId(),
        firma: z.firma,
        branche: z.branche,
        ort: z.ort,
        ansprechpartner: '',
        telefon: z.telefon,
        email: '',
        potenzial: z.potenzial,
        status: 'Neu identifiziert',
        statusSeit: jetzt,
        fokus: z.fokus,
        naechsterKontakt: null,
        notizen: z.notizen,
        erstelltAm: jetzt,
      });
    }
    await onImport(neueKunden);
    setImportiert({ anzahl: neueKunden.length, duplikate: zeilen.length - neueKunden.length });
    setText('');
  }

  return (
    <Modal title="Lead-Import" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-[var(--color-ink)]/60">
          Eine Zeile pro Unternehmen im Format:
          <br />
          <code className="text-[11px]">Firma;Branche;Ort;Fokus;Potenzial;Telefon;Notizen</code>
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={'Muster GmbH;Metallbau;Rostock;Schlosser;4;0381 123456;Interessiert an Aushilfen'}
          className="w-full rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
        />
        {zeilen.length > 0 && (
          <p className="text-xs text-[var(--color-ink)]/60">
            {zeilen.length} Zeile(n) erkannt · {neueZeilen.length} neu · {duplikate} bereits vorhanden (Duplikat)
          </p>
        )}
        <Button className="w-full" onClick={importieren} disabled={neueZeilen.length === 0}>
          {neueZeilen.length > 0 ? `${neueZeilen.length} Kunde(n) importieren` : 'Kunden importieren'}
        </Button>
        {importiert && (
          <p className="text-xs text-[#1f7a4d]">
            {importiert.anzahl} Kunde(n) importiert
            {importiert.duplikate > 0 && `, ${importiert.duplikate} Duplikat(e) übersprungen`}.
          </p>
        )}
      </div>
    </Modal>
  );
}
