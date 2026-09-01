# Vertriebscockpit Rostock

Lokale Web-App für Vertrieb/Recruiting bei einem Personaldienstleister im Raum Rostock. Läuft komplett im Browser, kein Server, kein Login. Alle Daten liegen ausschließlich im IndexedDB des Geräts (Ziele in localStorage) – daher regelmäßig über „Ziele & Backup" ein Backup exportieren.

## Tech-Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- IndexedDB über [`idb`](https://github.com/jakearchibald/idb) für Kunden, Kandidaten und Kontakteinträge
- Selbst gehostete Fonts (`@fontsource`) für vollständige Offline-Fähigkeit

## Entwicklung

```bash
npm install
npm run dev
```

Für einen Produktions-Build:

```bash
npm run build
npm run preview
```

## Projektstruktur

- `src/types` – Datenmodell (Kunde, Kandidat, KontaktEintrag, Ziele)
- `src/lib` – Datenlogik: IndexedDB-Anbindung, Priorisierung, Analytics, Vorlagen, Backup
- `src/components` – wiederverwendbare UI-Bausteine
- `src/pages` – die fünf Reiter (Heute, Kunden, Kandidaten, Matching, Vorlagen) inkl. zugehöriger Modals
