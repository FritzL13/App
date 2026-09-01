import type { Kunde } from '../types';

export type VorlageSituation =
  | 'E-Mail Erstansprache'
  | 'Telefonleitfaden Erstanruf'
  | 'Bedarfsanalyse-Fragen'
  | 'Follow-up'
  | 'Angebotsbegleittext';

export const VORLAGE_SITUATIONEN: VorlageSituation[] = [
  'E-Mail Erstansprache',
  'Telefonleitfaden Erstanruf',
  'Bedarfsanalyse-Fragen',
  'Follow-up',
  'Angebotsbegleittext',
];

function ansprache(kunde: Kunde): string {
  return kunde.ansprechpartner ? kunde.ansprechpartner : 'Ansprechpartner/in';
}

function fokusText(kunde: Kunde): string {
  return kunde.fokus?.trim() ? kunde.fokus : 'passende Fachkräfte';
}

export function generiereText(kunde: Kunde, situation: VorlageSituation): string {
  const name = ansprache(kunde);
  const firma = kunde.firma;
  const branche = kunde.branche || 'Ihrer Branche';
  const fokus = fokusText(kunde);

  switch (situation) {
    case 'E-Mail Erstansprache':
      return `Betreff: Personalunterstützung für ${firma}

Sehr geehrte/r ${name},

wir unterstützen Unternehmen im Bereich ${branche} im Raum Rostock bei kurzfristigem und planbarem Personalbedarf – unter anderem im Bereich ${fokus}.

Gerade in Zeiten schwankender Auftragslage kann Zeitarbeit helfen, Auftragsspitzen abzufedern oder Ausfälle kurzfristig zu überbrücken, ohne langfristige Verpflichtungen einzugehen.

Haben Sie aktuell oder in den nächsten Wochen Bedarf an ${fokus}? Ich würde mich über ein kurzes Gespräch freuen, um Ihre Situation besser zu verstehen.

Mit freundlichen Grüßen`;

    case 'Telefonleitfaden Erstanruf':
      return `Telefonleitfaden – Erstanruf bei ${firma}

1. Begrüßung: "Guten Tag, mein Name ist [Name], ich rufe von [Firma] an – wir unterstützen Betriebe im Bereich ${branche} hier in der Region mit Personal."
2. Aufhänger: "Ich habe gesehen, dass Sie im Bereich ${fokus} tätig sind – darf ich fragen, wie aktuell Ihre personelle Situation aussieht?"
3. Bedarf klären: Gibt es aktuell offene Stellen, Auftragsspitzen oder Krankheitsausfälle?
4. Nutzen kurz erklären: Flexibel, unkompliziert, geprüfte Kandidat:innen aus der Region.
5. Nächsten Schritt vereinbaren: Termin für ausführlicheres Gespräch oder Angebot per Mail anbieten.
6. Freundlich verabschieden, auch bei Absage – Wiedervorlage notieren.`;

    case 'Bedarfsanalyse-Fragen':
      return `Bedarfsanalyse – Fragen für ${firma}

- Welche Positionen sind aktuell am schwersten zu besetzen (z. B. ${fokus})?
- Wie sieht die Auftragslage in den nächsten 3–6 Monaten aus – eher steigend, stabil oder schwankend?
- Gab es in letzter Zeit Ausfälle durch Krankheit oder Urlaub, die kurzfristig überbrückt werden mussten?
- Arbeiten Sie aktuell bereits mit einem Personaldienstleister zusammen? Wenn ja, was läuft gut, was weniger gut?
- Wie kurzfristig müsste im Bedarfsfall Personal verfügbar sein?
- Gibt es saisonale Spitzen (z. B. bestimmte Monate), auf die wir uns einstellen sollten?
- Wer ist bei Ihnen für die finale Entscheidung bei einer Zusammenarbeit zuständig?`;

    case 'Follow-up':
      return `Betreff: Kurzes Follow-up – ${firma}

Sehr geehrte/r ${name},

ich wollte kurz nachfragen, wie Ihre aktuelle Situation im Bereich ${fokus} aussieht und ob sich seit unserem letzten Austausch etwas verändert hat.

Falls aktuell kein Bedarf besteht, halte ich Sie gerne unverbindlich auf dem Schirm – melden Sie sich einfach, sobald sich etwas ergibt.

Mit freundlichen Grüßen`;

    case 'Angebotsbegleittext':
      return `Betreff: Ihr Angebot – Personalunterstützung für ${firma}

Sehr geehrte/r ${name},

anbei erhalten Sie wie besprochen unser Angebot für die Unterstützung im Bereich ${fokus}.

Gerne gehe ich mit Ihnen die Details noch einmal telefonisch durch und beantworte offene Fragen zu Konditionen, Verfügbarkeit oder Ablauf.

Ich freue mich auf Ihre Rückmeldung.

Mit freundlichen Grüßen`;
  }
}
