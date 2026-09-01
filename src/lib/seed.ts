import type { Kunde, Kandidat } from '../types';
import { generateId } from './id';

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function isoDaysFromNow(days: number): string {
  return isoDaysAgo(-days);
}

interface SeedKundeInput {
  firma: string;
  branche: string;
  ort: string;
  fokus: string;
  potenzial: 1 | 2 | 3 | 4 | 5;
  status: Kunde['status'];
  erstelltVorTagen: number;
  statusSeitVorTagen: number;
  naechsterKontaktInTagen: number | null;
}

const SEED_INPUT: SeedKundeInput[] = [
  {
    firma: 'Thomas Raude Metallbau GmbH & Co. KG',
    branche: 'Metallbau/Stahlkonstruktion',
    ort: 'Bentwisch',
    fokus: 'Schlosser, Metallbauer',
    potenzial: 4,
    status: 'Neu identifiziert',
    erstelltVorTagen: 3,
    statusSeitVorTagen: 3,
    naechsterKontaktInTagen: null,
  },
  {
    firma: 'SPECHT Glas- und Metallbau GmbH',
    branche: 'Glas-/Metallbau',
    ort: 'Rostock',
    fokus: 'Metallbauer, Monteure',
    potenzial: 3,
    status: 'Erstkontakt versendet',
    erstelltVorTagen: 20,
    statusSeitVorTagen: 10,
    naechsterKontaktInTagen: 5,
  },
  {
    firma: 'AKC Cutting GmbH',
    branche: 'Metallbearbeitung',
    ort: 'Rostock',
    fokus: 'Zerspaner, Anlagenbediener',
    potenzial: 3,
    status: 'Rückmeldung erhalten',
    erstelltVorTagen: 30,
    statusSeitVorTagen: 5,
    naechsterKontaktInTagen: 3,
  },
  {
    firma: 'Metallbau Nickel',
    branche: 'Industrie/Metallbau, Werften',
    ort: 'Sarmstorf/Güstrow',
    fokus: 'Schweißer, Schlosser, Industriemontage',
    potenzial: 5,
    status: 'Termin vereinbart',
    erstelltVorTagen: 25,
    statusSeitVorTagen: 2,
    naechsterKontaktInTagen: 2,
  },
  {
    firma: 'Stahl- und Metallbau Schröder GmbH',
    branche: 'Metallbau',
    ort: 'Thürkow',
    fokus: 'Schlosser',
    potenzial: 2,
    status: 'Kein Interesse',
    erstelltVorTagen: 250,
    statusSeitVorTagen: 220,
    naechsterKontaktInTagen: null,
  },
  {
    firma: 'Maass Logistik Rostock GmbH',
    branche: 'Logistik/Transport',
    ort: 'Rostock',
    fokus: 'Lagerhelfer, Staplerfahrer, LKW-Fahrer',
    potenzial: 4,
    status: 'Vertrag aktiv',
    erstelltVorTagen: 100,
    statusSeitVorTagen: 60,
    naechsterKontaktInTagen: 30,
  },
  {
    firma: 'Arkona Spedition & Logistik GmbH',
    branche: 'Spedition/Logistik',
    ort: 'Rostock',
    fokus: 'Lagerhelfer, Fahrer',
    potenzial: 3,
    status: 'Neu identifiziert',
    erstelltVorTagen: 45,
    statusSeitVorTagen: 45,
    naechsterKontaktInTagen: null,
  },
  {
    firma: 'Behrendt Umzüge & Spedition',
    branche: 'Spedition/Umzüge/Montage',
    ort: 'Bargeshagen bei Rostock',
    fokus: 'Möbelmonteure, Umzugshelfer, Fahrer',
    potenzial: 3,
    status: 'Pausiert',
    erstelltVorTagen: 300,
    statusSeitVorTagen: 200,
    naechsterKontaktInTagen: null,
  },
  {
    firma: 'Nordex Energy (Standort GVZ Rostock)',
    branche: 'Produktion/Windenergie',
    ort: 'Rostock',
    fokus: 'Produktionshelfer, Elektroniker, Mechatroniker',
    potenzial: 4,
    status: 'Angebot erstellt',
    erstelltVorTagen: 15,
    statusSeitVorTagen: 4,
    naechsterKontaktInTagen: 0,
  },
];

export const SEED_KUNDEN: Kunde[] = SEED_INPUT.map((input) => ({
  id: generateId(),
  firma: input.firma,
  branche: input.branche,
  ort: input.ort,
  ansprechpartner: '',
  telefon: '',
  email: '',
  potenzial: input.potenzial,
  status: input.status,
  statusSeit: isoDaysAgo(input.statusSeitVorTagen),
  fokus: input.fokus,
  naechsterKontakt:
    input.naechsterKontaktInTagen === null ? null : isoDaysFromNow(input.naechsterKontaktInTagen),
  notizen: '',
  erstelltAm: isoDaysAgo(input.erstelltVorTagen),
}));

interface SeedKandidatInput {
  name: string;
  beruf: string;
  ort: string;
  status: Kandidat['status'];
  verfuegbarInTagen: number | null;
}

const SEED_KANDIDAT_INPUT: SeedKandidatInput[] = [
  { name: 'Marko Peters', beruf: 'Schlosser', ort: 'Rostock', status: 'Neu', verfuegbarInTagen: 14 },
  { name: 'Jens Wittmaack', beruf: 'Metallbauer', ort: 'Bentwisch', status: 'Kontaktiert', verfuegbarInTagen: 0 },
  { name: 'Sven Kruse', beruf: 'Schweißer', ort: 'Güstrow', status: 'Vorstellungsgespräch', verfuegbarInTagen: 7 },
  { name: 'Anke Bahlmann', beruf: 'Staplerfahrer', ort: 'Rostock', status: 'Neu', verfuegbarInTagen: 0 },
  { name: 'Toni Radtke', beruf: 'Lagerhelfer', ort: 'Laage', status: 'Vermittelt', verfuegbarInTagen: null },
  { name: 'Doreen Wulff', beruf: 'Elektroniker', ort: 'Rostock', status: 'Neu', verfuegbarInTagen: 21 },
];

export const SEED_KANDIDATEN: Kandidat[] = SEED_KANDIDAT_INPUT.map((input) => ({
  id: generateId(),
  name: input.name,
  beruf: input.beruf,
  ort: input.ort,
  verfuegbarAb: input.verfuegbarInTagen === null ? null : isoDaysFromNow(input.verfuegbarInTagen),
  telefon: '',
  email: '',
  status: input.status,
  notizen: '',
}));
