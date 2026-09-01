import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Kunde, Kandidat, KontaktEintrag, KontaktArt, Ziele } from '../types';
import * as db from './db';
import { generateId } from './id';
import { getZiele, setZiele as persistZiele } from './settings';

interface StoreState {
  kunden: Kunde[];
  kandidaten: Kandidat[];
  kontakte: KontaktEintrag[];
  ziele: Ziele;
  geladen: boolean;
}

interface StoreApi extends StoreState {
  speichereKunde: (kunde: Kunde) => Promise<void>;
  entferneKunde: (id: string) => Promise<void>;
  speichereKandidat: (kandidat: Kandidat) => Promise<void>;
  entferneKandidat: (id: string) => Promise<void>;
  erfasseKontakt: (
    bezugId: string,
    bezugTyp: 'Kunde' | 'Kandidat',
    art: KontaktArt,
    notiz: string,
    datum?: string,
  ) => Promise<void>;
  aktualisiereZiele: (ziele: Ziele) => void;
  ladeAlles: () => Promise<void>;
  ersetzeAlleDaten: (data: {
    kunden: Kunde[];
    kandidaten: Kandidat[];
    kontakte: KontaktEintrag[];
    ziele: Ziele;
  }) => Promise<void>;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>({
    kunden: [],
    kandidaten: [],
    kontakte: [],
    ziele: getZiele(),
    geladen: false,
  });

  const ladeAlles = useCallback(async () => {
    await db.ensureSeeded();
    const [kunden, kandidaten, kontakte] = await Promise.all([
      db.getAlleKunden(),
      db.getAlleKandidaten(),
      db.getAlleKontakte(),
    ]);
    setState((s) => ({ ...s, kunden, kandidaten, kontakte, geladen: true }));
  }, []);

  useEffect(() => {
    ladeAlles();
  }, [ladeAlles]);

  const speichereKunde = useCallback(async (kunde: Kunde) => {
    await db.putKunde(kunde);
    setState((s) => {
      const existiert = s.kunden.some((k) => k.id === kunde.id);
      const kunden = existiert
        ? s.kunden.map((k) => (k.id === kunde.id ? kunde : k))
        : [...s.kunden, kunde];
      return { ...s, kunden };
    });
  }, []);

  const entferneKunde = useCallback(async (id: string) => {
    await db.deleteKunde(id);
    setState((s) => ({
      ...s,
      kunden: s.kunden.filter((k) => k.id !== id),
      kontakte: s.kontakte.filter((k) => k.kundeId !== id),
    }));
  }, []);

  const speichereKandidat = useCallback(async (kandidat: Kandidat) => {
    await db.putKandidat(kandidat);
    setState((s) => {
      const existiert = s.kandidaten.some((k) => k.id === kandidat.id);
      const kandidaten = existiert
        ? s.kandidaten.map((k) => (k.id === kandidat.id ? kandidat : k))
        : [...s.kandidaten, kandidat];
      return { ...s, kandidaten };
    });
  }, []);

  const entferneKandidat = useCallback(async (id: string) => {
    await db.deleteKandidat(id);
    setState((s) => ({
      ...s,
      kandidaten: s.kandidaten.filter((k) => k.id !== id),
      kontakte: s.kontakte.filter((k) => k.kundeId !== id),
    }));
  }, []);

  const erfasseKontakt = useCallback(
    async (
      bezugId: string,
      bezugTyp: 'Kunde' | 'Kandidat',
      art: KontaktArt,
      notiz: string,
      datum?: string,
    ) => {
      const eintrag: KontaktEintrag = {
        id: generateId(),
        kundeId: bezugId,
        bezugTyp,
        datum: datum ?? new Date().toISOString(),
        art,
        notiz,
      };
      await db.putKontakt(eintrag);
      setState((s) => ({ ...s, kontakte: [...s.kontakte, eintrag] }));
    },
    [],
  );

  const aktualisiereZiele = useCallback((ziele: Ziele) => {
    persistZiele(ziele);
    setState((s) => ({ ...s, ziele }));
  }, []);

  const ersetzeAlleDaten = useCallback(
    async (data: { kunden: Kunde[]; kandidaten: Kandidat[]; kontakte: KontaktEintrag[]; ziele: Ziele }) => {
      await db.replaceAllData(data);
      persistZiele(data.ziele);
      setState({
        kunden: data.kunden,
        kandidaten: data.kandidaten,
        kontakte: data.kontakte,
        ziele: data.ziele,
        geladen: true,
      });
    },
    [],
  );

  const value = useMemo<StoreApi>(
    () => ({
      ...state,
      speichereKunde,
      entferneKunde,
      speichereKandidat,
      entferneKandidat,
      erfasseKontakt,
      aktualisiereZiele,
      ladeAlles,
      ersetzeAlleDaten,
    }),
    [
      state,
      speichereKunde,
      entferneKunde,
      speichereKandidat,
      entferneKandidat,
      erfasseKontakt,
      aktualisiereZiele,
      ladeAlles,
      ersetzeAlleDaten,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore muss innerhalb von StoreProvider verwendet werden');
  return ctx;
}
