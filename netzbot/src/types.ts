// Datenmodell des Netzanmeldungs-Bots.
//
// Der Bot ist bewusst HUMAN-IN-THE-LOOP: er reicht NICHTS ein. Er loggt sich beim
// Netzbetreiber-Portal ein, füllt das Online-Formular aus den Projektdaten vor,
// speichert es als Entwurf und macht einen Screenshot zum Nachweis. Danach meldet
// er .birdie „Entwurf erzeugt" → die Anmeldung springt auf „bitte prüfen". Ein
// Mensch prüft den Entwurf im Portal und gibt frei; das Absenden bleibt manuell,
// bis dem Bot vertraut wird.

export interface Job {
  offerId: string;
  customer: string;
  netzbetreiber: string;      // identifiziert den passenden Driver
  // Vorausgefüllte Felder aus .birdie (ProjectData + Geschäftsregeln).
  fields: {
    name: string;
    street?: string;
    zip?: string;
    city?: string;
    kwp?: number;
    moduleCount?: number;
    moduleType?: string;
    inverter?: string;
    inverterKw?: number;
    inverterCount?: number;
    battery?: string;
    batteryKwh?: number;
    phases?: 1 | 3;
    einspeiseart?: 'ueberschuss' | 'voll';
    speicherkopplung?: 'dc' | 'ac';
    naSchutz?: boolean;
    notstrom?: boolean;
    inselbildend?: boolean;
    schwarzstartfaehig?: boolean;
  };
}

export interface PortalCredentials {
  username: string;
  password: string;
  portalUrl: string;
}

export interface FillResult {
  ok: boolean;
  // Referenz auf den im Portal gespeicherten Entwurf (Vorgangs-Nr. o.ä.).
  draftRef?: string;
  // Pfad zum Screenshot-Nachweis (lokal/Storage).
  screenshotPath?: string;
  error?: string;
}

// Ein Driver kapselt die Portal-Eigenheiten genau EINES Netzbetreibers.
export interface PortalDriver {
  // Name des Netzbetreibers, exakt wie in .birdie (netzbetreiberForPlz).
  netzbetreiber: string;
  // Login + Navigation + Vorausfüllen + Entwurf speichern. Kein Absenden.
  fillDraft(job: Job, creds: PortalCredentials): Promise<FillResult>;
}
