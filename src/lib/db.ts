import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Kunde, Kandidat, KontaktEintrag } from '../types';
import { SEED_KUNDEN, SEED_KANDIDATEN } from './seed';

const DB_NAME = 'vertriebscockpit';
const DB_VERSION = 1;

interface CockpitDB extends DBSchema {
  kunden: {
    key: string;
    value: Kunde;
    indexes: { firma: string };
  };
  kandidaten: {
    key: string;
    value: Kandidat;
  };
  kontakte: {
    key: string;
    value: KontaktEintrag;
    indexes: { kundeId: string };
  };
}

let dbPromise: Promise<IDBPDatabase<CockpitDB>> | null = null;

function getDB(): Promise<IDBPDatabase<CockpitDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CockpitDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('kunden')) {
          const kundenStore = db.createObjectStore('kunden', { keyPath: 'id' });
          kundenStore.createIndex('firma', 'firma');
        }
        if (!db.objectStoreNames.contains('kandidaten')) {
          db.createObjectStore('kandidaten', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('kontakte')) {
          const kontakteStore = db.createObjectStore('kontakte', { keyPath: 'id' });
          kontakteStore.createIndex('kundeId', 'kundeId');
        }
      },
    });
  }
  return dbPromise;
}

export async function ensureSeeded(): Promise<void> {
  const db = await getDB();
  const [kundenCount, kandidatenCount] = await Promise.all([
    db.count('kunden'),
    db.count('kandidaten'),
  ]);
  if (kundenCount === 0) {
    const tx = db.transaction('kunden', 'readwrite');
    await Promise.all([...SEED_KUNDEN.map((k) => tx.store.put(k)), tx.done]);
  }
  if (kandidatenCount === 0) {
    const tx = db.transaction('kandidaten', 'readwrite');
    await Promise.all([...SEED_KANDIDATEN.map((k) => tx.store.put(k)), tx.done]);
  }
}

// Kunden
export async function getAlleKunden(): Promise<Kunde[]> {
  const db = await getDB();
  return db.getAll('kunden');
}

export async function putKunde(kunde: Kunde): Promise<void> {
  const db = await getDB();
  await db.put('kunden', kunde);
}

export async function deleteKunde(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['kunden', 'kontakte'], 'readwrite');
  await tx.objectStore('kunden').delete(id);
  const kontakteIdx = tx.objectStore('kontakte').index('kundeId');
  let cursor = await kontakteIdx.openCursor(IDBKeyRange.only(id));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// Kandidaten
export async function getAlleKandidaten(): Promise<Kandidat[]> {
  const db = await getDB();
  return db.getAll('kandidaten');
}

export async function putKandidat(kandidat: Kandidat): Promise<void> {
  const db = await getDB();
  await db.put('kandidaten', kandidat);
}

export async function deleteKandidat(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['kandidaten', 'kontakte'], 'readwrite');
  await tx.objectStore('kandidaten').delete(id);
  const kontakteIdx = tx.objectStore('kontakte').index('kundeId');
  let cursor = await kontakteIdx.openCursor(IDBKeyRange.only(id));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// Kontakte
export async function getAlleKontakte(): Promise<KontaktEintrag[]> {
  const db = await getDB();
  return db.getAll('kontakte');
}

export async function putKontakt(kontakt: KontaktEintrag): Promise<void> {
  const db = await getDB();
  await db.put('kontakte', kontakt);
}

export async function getKontakteFuer(bezugId: string): Promise<KontaktEintrag[]> {
  const db = await getDB();
  return db.getAllFromIndex('kontakte', 'kundeId', bezugId);
}

// Backup
export async function replaceAllData(data: {
  kunden: Kunde[];
  kandidaten: Kandidat[];
  kontakte: KontaktEintrag[];
}): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['kunden', 'kandidaten', 'kontakte'], 'readwrite');
  await tx.objectStore('kunden').clear();
  await tx.objectStore('kandidaten').clear();
  await tx.objectStore('kontakte').clear();
  await Promise.all([
    ...data.kunden.map((k) => tx.objectStore('kunden').put(k)),
    ...data.kandidaten.map((k) => tx.objectStore('kandidaten').put(k)),
    ...data.kontakte.map((k) => tx.objectStore('kontakte').put(k)),
  ]);
  await tx.done;
}
