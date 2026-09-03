import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { KundeKarte } from '../components/KundeKarte';
import { Sparkline } from '../components/Sparkline';
import { IconSettings, IconCheck, IconRefresh } from '../components/Icons';
import { ZielSettingsModal } from './heute/ZielSettingsModal';
import type { Kunde } from '../types';
import type { TabId } from '../types/ui';
import { sortByPrioritaet } from '../lib/priority';
import { tageZwischen } from '../lib/priority';
import {
  tatsaechlicheErfolgsquote,
  effektiveErfolgsquote,
  berechneRueckwaertsrechnung,
  kundenIdsMitKontakt,
  wochenFortschritt,
  isHeuteOderFrueher,
  letzterKontakt,
  monateSeit,
  erstelleWochenReport,
  conversionReport,
  woechentlicherVerlauf,
} from '../lib/analytics';
import { tagestippFuer } from '../lib/tips';
import { plusTageIso } from '../lib/format';
import { zeigeFaelligeErinnerungFallsNoetig } from '../lib/notifications';

export function HeutePage({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const { kunden, kandidaten, kontakte, ziele, speichereKunde, erfasseKontakt } = useStore();
  const [settingsOffen, setSettingsOffen] = useState(false);

  const aktiveKunden = useMemo(() => kunden.filter((k) => k.status === 'Vertrag aktiv').length, [kunden]);
  const echteQuote = useMemo(() => tatsaechlicheErfolgsquote(kunden, kontakte), [kunden, kontakte]);
  const effektiveQuote = useMemo(() => effektiveErfolgsquote(ziele, echteQuote), [ziele, echteQuote]);
  const rueckwaerts = useMemo(
    () => berechneRueckwaertsrechnung(aktiveKunden, ziele.hauptzielAnzahl, ziele.hauptzielDatum, effektiveQuote.wert),
    [aktiveKunden, ziele, effektiveQuote],
  );

  const kontaktIds = useMemo(() => kundenIdsMitKontakt(kontakte), [kontakte]);

  const heuteFaellig = useMemo(
    () => sortByPrioritaet(kunden.filter((k) => isHeuteOderFrueher(k.naechsterKontakt))),
    [kunden],
  );
  const heuteFaelligIds = useMemo(() => new Set(heuteFaellig.map((k) => k.id)), [heuteFaellig]);

  const neueUnternehmen = useMemo(
    () =>
      sortByPrioritaet(
        kunden.filter(
          (k) => k.status === 'Neu identifiziert' && tageZwischen(k.erstelltAm) <= 7 && !kontaktIds.has(k.id),
        ),
      ),
    [kunden, kontaktIds],
  );
  const neueUnternehmenIds = useMemo(() => new Set(neueUnternehmen.map((k) => k.id)), [neueUnternehmen]);

  const tagesquote = rueckwaerts.erstkontaktePerArbeitstag ?? Math.max(1, Math.round(ziele.wocheKunden / 5));
  const empfohlen = useMemo(
    () =>
      sortByPrioritaet(
        kunden.filter(
          (k) => k.status === 'Neu identifiziert' && !heuteFaelligIds.has(k.id) && !neueUnternehmenIds.has(k.id),
        ),
      ).slice(0, tagesquote),
    [kunden, heuteFaelligIds, neueUnternehmenIds, tagesquote],
  );

  const reaktivierung = useMemo(() => {
    const kandidatenPool = kunden
      .filter((k) => k.status === 'Kein Interesse' || k.status === 'Pausiert')
      .map((k) => {
        const letzter = letzterKontakt(k.id, kontakte);
        const bezugsDatum = letzter ? letzter.datum : k.erstelltAm;
        return { kunde: k, monate: monateSeit(bezugsDatum) };
      })
      .filter((eintrag) => eintrag.monate >= 6);
    return sortByPrioritaet(kandidatenPool.map((e) => e.kunde))
      .slice(0, 3)
      .map((k) => kandidatenPool.find((e) => e.kunde.id === k.id)!);
  }, [kunden, kontakte]);

  useEffect(() => {
    zeigeFaelligeErinnerungFallsNoetig(heuteFaellig.length);
  }, [heuteFaellig.length]);

  const wochenFort = useMemo(() => wochenFortschritt(kontakte, 0), [kontakte]);
  const tagestipp = useMemo(() => tagestippFuer(new Date()), []);
  const report = useMemo(() => erstelleWochenReport(kunden, kontakte), [kunden, kontakte]);
  const conversion = useMemo(() => conversionReport(kunden, kontakte), [kunden, kontakte]);
  const verlauf = useMemo(() => woechentlicherVerlauf(kontakte, 8), [kontakte]);
  const verlaufLabels = useMemo(() => verlauf.map((p) => `KW ${p.kalenderwoche}`), [verlauf]);

  async function erledigt(kunde: Kunde) {
    const jetzt = new Date();
    const neuerStatus = kunde.status === 'Neu identifiziert' ? 'Erstkontakt versendet' : kunde.status;
    const geaendert = neuerStatus !== kunde.status;
    await speichereKunde({
      ...kunde,
      status: neuerStatus,
      statusSeit: geaendert ? jetzt.toISOString() : kunde.statusSeit,
      naechsterKontakt: plusTageIso(7, jetzt),
    });
    await erfasseKontakt(kunde.id, 'Kunde', 'Sonstiges', 'Als erledigt markiert (Schnellaktion)', jetzt.toISOString());
  }

  async function reaktivieren(kunde: Kunde) {
    await speichereKunde({
      ...kunde,
      status: 'Neu identifiziert',
      statusSeit: new Date().toISOString(),
      naechsterKontakt: null,
    });
  }

  const zielAnzahl = ziele.hauptzielAnzahl ?? 0;
  const zielAnteil = zielAnzahl > 0 ? aktiveKunden / zielAnzahl : 0;

  return (
    <div>
      <PageHeader
        title="Heute"
        action={
          <button
            type="button"
            onClick={() => setSettingsOffen(true)}
            aria-label="Ziele & Backup"
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10"
          >
            <IconSettings width={20} height={20} />
          </button>
        }
      />

      <div className="space-y-5 px-4 py-4">
        {/* Kundenziel-Fortschritt */}
        <section className="rounded-2xl border border-[var(--color-line)] bg-white p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg text-[var(--color-ink)]">Kundenziel</h2>
            <span className="text-sm font-semibold text-[var(--color-ink)]">
              {aktiveKunden} / {zielAnzahl || '–'}
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar anteil={zielAnteil} />
          </div>

          {zielAnzahl > 0 && (
            <div className="mt-3 space-y-1 text-xs text-[var(--color-ink)]/65">
              {rueckwaerts.restBedarf === 0 ? (
                <p className="font-medium text-[#1f7a4d]">Ziel bereits erreicht 🎉</p>
              ) : (
                <>
                  <p>
                    Noch <strong>{rueckwaerts.restBedarf}</strong> aktive Kunden bis zum Ziel.
                  </p>
                  {rueckwaerts.erstkontakteGesamt !== null && (
                    <p>
                      Dafür braucht es ca. <strong>{rueckwaerts.erstkontakteGesamt}</strong> weitere Erstkontakte
                      {ziele.hauptzielDatum && rueckwaerts.erstkontaktePerArbeitstag !== null && (
                        <> · ca. <strong>{rueckwaerts.erstkontaktePerArbeitstag}</strong> pro Arbeitstag</>
                      )}
                      .
                    </p>
                  )}
                  {effektiveQuote.wert === 0 && (
                    <p className="text-[var(--color-danger)]">
                      Erfolgsquote ist 0 % – Rückwärtsrechnung nicht möglich. Bitte Quote in den Einstellungen prüfen.
                    </p>
                  )}
                </>
              )}
              <p className="pt-1">
                {echteQuote.ausreichendDaten ? (
                  <>
                    Geschätzt: {ziele.erfolgsquote}% · Tatsächlich: {echteQuote.quote!.toFixed(0)}%{' '}
                    <span className="text-[var(--color-ink)]/40">
                      (genutzt: {effektiveQuote.quelle === 'tatsaechlich' ? 'tatsächlich' : 'geschätzt'})
                    </span>
                  </>
                ) : (
                  <>
                    Geschätzte Erfolgsquote: {ziele.erfolgsquote}%{' '}
                    <span className="text-[var(--color-ink)]/40">
                      (tatsächliche Quote ab 5 erstkontaktierten Kunden verfügbar, aktuell {echteQuote.anzahlErstkontaktiert})
                    </span>
                  </>
                )}
              </p>
            </div>
          )}
          {zielAnzahl === 0 && (
            <p className="mt-2 text-xs text-[var(--color-ink)]/50">
              Kein Kundenziel gesetzt – über das Zahnrad oben rechts einrichten.
            </p>
          )}
        </section>

        {/* Wochenziel */}
        <section className="rounded-2xl border border-[var(--color-line)] bg-white p-4 space-y-3">
          <h2 className="text-lg text-[var(--color-ink)]">Wochenziel-Fortschritt</h2>
          <div>
            <div className="mb-1 flex justify-between text-xs text-[var(--color-ink)]/60">
              <span>Kundenkontakte</span>
              <span>
                {wochenFort.kundenkontakte} / {ziele.wocheKunden}
              </span>
            </div>
            <ProgressBar
              anteil={ziele.wocheKunden > 0 ? wochenFort.kundenkontakte / ziele.wocheKunden : wochenFort.kundenkontakte > 0 ? 1 : 0}
              farbe="var(--color-petrol)"
            />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-[var(--color-ink)]/60">
              <span>Kandidatenkontakte</span>
              <span>
                {wochenFort.kandidatenkontakte} / {ziele.wocheKandidaten}
              </span>
            </div>
            <ProgressBar
              anteil={
                ziele.wocheKandidaten > 0
                  ? wochenFort.kandidatenkontakte / ziele.wocheKandidaten
                  : wochenFort.kandidatenkontakte > 0
                    ? 1
                    : 0
              }
              farbe="var(--color-petrol)"
            />
          </div>
        </section>

        {/* Tagestipp */}
        <section className="rounded-2xl border border-[var(--color-petrol)]/30 bg-[var(--color-petrol)]/8 p-4">
          <h2 className="text-sm font-semibold text-[var(--color-petrol)]">Vertriebstipp des Tages</h2>
          <p className="mt-1 text-sm text-[var(--color-ink)]/80">{tagestipp}</p>
        </section>

        {/* Neue Unternehmen ohne Kontakt */}
        <section className="space-y-2">
          <h2 className="text-lg text-[var(--color-ink)]">Neue Unternehmen ohne Kontakt</h2>
          {neueUnternehmen.length === 0 ? (
            <EmptyState text="Keine frischen, noch unkontaktierten Unternehmen." />
          ) : (
            <div className="space-y-2">
              {neueUnternehmen.map((k) => (
                <KundeKarte
                  key={k.id}
                  kunde={k}
                  istNeu
                  aktionen={
                    <Button className="flex items-center gap-1.5" onClick={() => erledigt(k)}>
                      <IconCheck width={16} height={16} /> Erledigt
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Heute fällig */}
        <section className="space-y-2">
          <h2 className="text-lg text-[var(--color-ink)]">Heute fällig</h2>
          {heuteFaellig.length === 0 ? (
            <EmptyState text="Heute steht kein Kontakt an – schau bei den Empfehlungen vorbei." />
          ) : (
            <div className="space-y-2">
              {heuteFaellig.map((k) => (
                <KundeKarte
                  key={k.id}
                  kunde={k}
                  istNeu={neueUnternehmenIds.has(k.id)}
                  aktionen={
                    <Button className="flex items-center gap-1.5" onClick={() => erledigt(k)}>
                      <IconCheck width={16} height={16} /> Erledigt
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Empfohlen */}
        <section className="space-y-2">
          <h2 className="text-lg text-[var(--color-ink)]">Für dein Kundenziel heute empfohlen</h2>
          {empfohlen.length === 0 ? (
            <EmptyState text="Keine weiteren Empfehlungen – über + im Kunden-Tab neue Unternehmen erfassen." />
          ) : (
            <div className="space-y-2">
              {empfohlen.map((k) => (
                <KundeKarte
                  key={k.id}
                  kunde={k}
                  aktionen={
                    <Button className="flex items-center gap-1.5" onClick={() => erledigt(k)}>
                      <IconCheck width={16} height={16} /> Erledigt
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Reaktivierung */}
        <section className="space-y-2">
          <h2 className="text-lg text-[var(--color-ink)]">Reaktivierung: alte Absagen erneut versuchen</h2>
          {reaktivierung.length === 0 ? (
            <EmptyState text="Aktuell keine Kunden zur Reaktivierung fällig." />
          ) : (
            <div className="space-y-2">
              {reaktivierung.map(({ kunde: k, monate }) => (
                <KundeKarte
                  key={k.id}
                  kunde={k}
                  hinweis={`Zuletzt kontaktiert vor ${monate} Monaten – Bedarf könnte sich geändert haben`}
                  aktionen={
                    <Button variant="secondary" className="flex items-center gap-1.5" onClick={() => reaktivieren(k)}>
                      <IconRefresh width={16} height={16} /> Reaktivieren
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Erfolgsreport */}
        <section className="space-y-3 rounded-2xl border border-[var(--color-line)] bg-white p-4">
          <h2 className="text-lg text-[var(--color-ink)]">Erfolgsreport – diese Woche vs. Vorwoche</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <ReportZeile
              label="Kundenkontakte"
              diese={report.kundenkontakte.diese}
              vorwoche={report.kundenkontakte.vorwoche}
              trendWerte={verlauf.map((p) => p.kundenkontakte)}
              trendLabels={verlaufLabels}
              trendFarbe="var(--color-orange)"
            />
            <ReportZeile
              label="Kandidatenkontakte"
              diese={report.kandidatenkontakte.diese}
              vorwoche={report.kandidatenkontakte.vorwoche}
              trendWerte={verlauf.map((p) => p.kandidatenkontakte)}
              trendLabels={verlaufLabels}
              trendFarbe="var(--color-petrol)"
            />
            <ReportZeile label="Neue Termine" diese={report.neueTermine.diese} vorwoche={report.neueTermine.vorwoche} />
            <ReportZeile
              label="Neue aktive Kunden"
              diese={report.neueAktiveKunden.diese}
              vorwoche={report.neueAktiveKunden.vorwoche}
            />
          </div>
          <p className="text-[11px] text-[var(--color-ink)]/40">Verlauf: letzte 8 Wochen, aktuelle Woche hervorgehoben</p>
          <div className="border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-ink)]/65">
            <p className="mb-1 font-semibold text-[var(--color-ink)]/70">Conversion-Rate</p>
            <p>Erstkontakt: {conversion.erstkontaktiert}</p>
            <p>
              → Termin: {conversion.termin} ({conversion.quoteTermin !== null ? conversion.quoteTermin.toFixed(0) : '–'}%)
            </p>
            <p>
              → Vertrag: {conversion.vertrag} ({conversion.quoteVertrag !== null ? conversion.quoteVertrag.toFixed(0) : '–'}%)
            </p>
          </div>
        </section>

        {kunden.length === 0 && kandidaten.length === 0 && (
          <EmptyState text="Noch keine Daten erfasst – über den Kunden- oder Kandidaten-Tab starten." />
        )}
        <button
          type="button"
          onClick={() => onNavigate('kunden')}
          className="w-full rounded-xl border border-[var(--color-line)] bg-white py-2.5 text-sm font-medium text-[var(--color-petrol)]"
        >
          Zu allen Kunden →
        </button>
      </div>

      {settingsOffen && <ZielSettingsModal onClose={() => setSettingsOffen(false)} />}
    </div>
  );
}

function ReportZeile({
  label,
  diese,
  vorwoche,
  trendWerte,
  trendLabels,
  trendFarbe,
}: {
  label: string;
  diese: number;
  vorwoche: number;
  trendWerte?: number[];
  trendLabels?: string[];
  trendFarbe?: string;
}) {
  const delta = diese - vorwoche;
  return (
    <div className="rounded-xl bg-[var(--color-bg)] p-2.5">
      <p className="text-[11px] text-[var(--color-ink)]/55">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-[var(--color-ink)]">{diese}</p>
          <p className={`text-[11px] ${delta >= 0 ? 'text-[#1f7a4d]' : 'text-[var(--color-danger)]'}`}>
            {delta >= 0 ? '+' : ''}
            {delta} ggü. Vorwoche ({vorwoche})
          </p>
        </div>
        {trendWerte && <Sparkline werte={trendWerte} labels={trendLabels} akzent={trendFarbe} />}
      </div>
    </div>
  );
}
