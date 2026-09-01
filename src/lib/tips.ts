export const VERTRIEBSTIPPS: string[] = [
  'Ruf lieber einmal zu viel an als einmal zu wenig – die meisten Abschlüsse entstehen erst nach dem dritten bis fünften Kontakt.',
  'Frag beim Erstkontakt konkret nach Auftragsspitzen oder Krankheitsausfällen – das öffnet oft die Tür für Zeitarbeit.',
  'Notiere dir nach jedem Gespräch sofort eine Kurznotiz – nach drei Tagen erinnerst du dich nur noch an die Hälfte.',
  'Ein "Kein Interesse" heute heißt nicht "nie" – Bedarf ändert sich, hak nach ein paar Monaten nochmal nach.',
  'Persönliche Ansprache schlägt Standardtext: nenne konkrete Branche und Region im ersten Satz.',
  'Termine am Vormittag haben in der Produktion/Logistik oft bessere Erreichbarkeit als am Nachmittag.',
  'Bleib bei Absagen freundlich – Personalverantwortliche wechseln öfter den Betrieb, als man denkt.',
  'Frag aktiv nach Empfehlungen: "Kennen Sie jemanden in Ihrem Netzwerk, der auch Unterstützung braucht?"',
  'Kombiniere Kunden- und Kandidatengespräche: ein passendes Profil in der Tasche öffnet oft schneller Türen.',
  'Kurz vor Feierabend erreichst du oft Entscheider, die tagsüber nicht ans Telefon gehen.',
];

export function tagestippFuer(datum: Date = new Date()): string {
  const start = new Date(datum.getFullYear(), 0, 0);
  const diff = datum.getTime() - start.getTime();
  const tagDesJahres = Math.floor(diff / (1000 * 60 * 60 * 24));
  return VERTRIEBSTIPPS[tagDesJahres % VERTRIEBSTIPPS.length];
}
