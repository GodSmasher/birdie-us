// PLZ → Netzbetreiber (Verteilnetzbetreiber) lookup.
//
// There is no open API mapping a German postcode to its grid operator, and there
// are 800+ operators — a perfect table is impossible without the official BNetzA
// data. This is a curated heuristic for the *large* operators per PLZ region with
// a confidence flag, so the office gets a sensible default it can confirm/override
// rather than nothing. Rules are matched in order; the first hit wins, so put more
// specific rules (city ranges) before broad regional ones.

export type Confidence = 'sicher' | 'wahrscheinlich' | 'pruefen';

export interface Netzbetreiber {
  name: string;
  portalUrl?: string;
  confidence: Confidence;
}

interface Rule {
  // Matches against the 5-digit PLZ (string). Return true to apply this operator.
  match: (plz: string) => boolean;
  nb: Netzbetreiber;
}

const startsWith = (...prefixes: string[]) => (plz: string) => prefixes.some((p) => plz.startsWith(p));

// Ordered: city-level / high-confidence first, broad regional fallbacks last.
const RULES: Rule[] = [
  // --- Stadtnetze (eindeutig) ---
  { match: startsWith('10', '12', '13'), nb: { name: 'Stromnetz Berlin', portalUrl: 'https://www.stromnetz.berlin/anschluss-und-einspeisung', confidence: 'sicher' } },
  { match: (p) => p >= '20000' && p <= '22769', nb: { name: 'Stromnetz Hamburg', portalUrl: 'https://www.stromnetz-hamburg.de/einspeiser', confidence: 'sicher' } },
  { match: startsWith('80', '81'), nb: { name: 'SWM Infrastruktur (München)', portalUrl: 'https://www.swm-infrastruktur.de/strom/netzanschluss', confidence: 'sicher' } },

  // --- Große Flächennetzbetreiber ---
  // MITNETZ STROM (envia) — Sachsen, Südbrandenburg, Teile Sachsen-Anhalt/Thüringen
  { match: startsWith('01', '02', '03', '04', '08', '09'), nb: { name: 'MITNETZ STROM', portalUrl: 'https://www.mitnetz-strom.de/einspeisung', confidence: 'wahrscheinlich' } },
  // Sachsen-Anhalt / südöstl. Niedersachsen
  { match: startsWith('06', '38', '39'), nb: { name: 'Avacon', portalUrl: 'https://www.avacon-netz.de/de/einspeisung.html', confidence: 'wahrscheinlich' } },
  // Thüringen
  { match: startsWith('07', '98', '99'), nb: { name: 'TEN Thüringer Energienetze', portalUrl: 'https://www.thueringer-energienetze.com/einspeiser', confidence: 'wahrscheinlich' } },
  // Mecklenburg-Vorpommern / Nordbrandenburg
  { match: startsWith('15', '16', '17', '18', '19'), nb: { name: 'E.DIS', portalUrl: 'https://www.e-dis-netz.de/de/einspeiser.html', confidence: 'wahrscheinlich' } },
  // Schleswig-Holstein / Nordniedersachsen
  { match: startsWith('21', '22', '23', '24', '25'), nb: { name: 'Schleswig-Holstein Netz', portalUrl: 'https://www.sh-netz.com/de/einspeiser.html', confidence: 'wahrscheinlich' } },
  // Niedersachsen / Bremen (EWE-Region) — grob
  { match: startsWith('26', '27', '28', '49'), nb: { name: 'EWE Netz', portalUrl: 'https://www.ewe-netz.de/privatkunden/einspeiser', confidence: 'pruefen' } },
  // Niedersachsen Mitte
  { match: startsWith('29', '30', '31', '37'), nb: { name: 'Avacon', portalUrl: 'https://www.avacon-netz.de/de/einspeisung.html', confidence: 'pruefen' } },
  // NRW / Rheinland / Ruhr (Westnetz – größter DSO)
  { match: startsWith('32', '33', '34', '40', '41', '42', '44', '45', '46', '47', '48', '57', '58', '59'), nb: { name: 'Westnetz', portalUrl: 'https://www.westnetz.de/de/einspeiser.html', confidence: 'wahrscheinlich' } },
  // Köln/Bonn
  { match: startsWith('50', '51', '53'), nb: { name: 'Rheinische NETZGesellschaft', portalUrl: 'https://www.rheinnetz.com/einspeisung', confidence: 'pruefen' } },
  // Hessen / Rheinland-Pfalz / Saarland (Syna / Westnetz gemischt)
  { match: startsWith('35', '36', '60', '61', '63', '65'), nb: { name: 'Syna', portalUrl: 'https://www.syna.de/einspeisung', confidence: 'pruefen' } },
  { match: startsWith('64', '67', '68', '69', '55', '56', '66'), nb: { name: 'Westnetz', portalUrl: 'https://www.westnetz.de/de/einspeiser.html', confidence: 'pruefen' } },
  // Baden-Württemberg (Netze BW – größter im Südwesten)
  { match: startsWith('70', '71', '72', '73', '74', '75', '76', '78', '79'), nb: { name: 'Netze BW', portalUrl: 'https://www.netze-bw.de/einspeiser', confidence: 'wahrscheinlich' } },
  // Bayern (Bayernwerk – größter Flächen-DSO Bayern)
  { match: startsWith('82', '83', '84', '85', '90', '91', '92', '93', '94', '95', '96'), nb: { name: 'Bayernwerk', portalUrl: 'https://www.bayernwerk-netz.de/de/energie-einspeisen.html', confidence: 'wahrscheinlich' } },
  // Bayerisch-Schwaben (LEW)
  { match: startsWith('86', '87', '88', '89'), nb: { name: 'LEW Verteilnetz', portalUrl: 'https://www.lew-verteilnetz.de/einspeiser', confidence: 'pruefen' } },
  // Unterfranken
  { match: startsWith('97'), nb: { name: 'Bayernwerk', portalUrl: 'https://www.bayernwerk-netz.de/de/energie-einspeisen.html', confidence: 'pruefen' } },
];

/**
 * Best-guess grid operator for a German postcode. Returns null when no PLZ is
 * known. The result is a *suggestion* — `confidence` says how much to trust it.
 */
export function netzbetreiberForPlz(plz?: string): Netzbetreiber | null {
  if (!plz) return null;
  const z = plz.trim().replace(/\D/g, '').slice(0, 5);
  if (z.length < 5) return null;
  for (const r of RULES) {
    if (r.match(z)) return r.nb;
  }
  return null;
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  sicher: 'sicher',
  wahrscheinlich: 'wahrscheinlich',
  pruefen: 'bitte prüfen',
};
