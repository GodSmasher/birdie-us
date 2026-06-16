// ZIP → Distribution utility lookup.
//
// There is no open API mapping a German postcode to its grid operator, and there
// are 800+ operators — a perfect table is impossible without the official BNetzA
// data. This is a curated heuristic for the *large* operators per PLZ region with
// a confidence flag, so the office gets a sensible default it can confirm/override
// rather than nothing. Rules are matched in order; the first hit wins, so put more
// specific rules (city ranges) before broad regional ones.

export type Confidence = 'confirmed' | 'likely' | 'please_verify';

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
  // --- City grids (definite match) ---
  { match: startsWith('10', '12', '13'), nb: { name: 'Stromnetz Berlin', portalUrl: 'https://www.stromnetz.berlin/anschluss-und-einspeisung', confidence: 'confirmed' } },
  { match: (p) => p >= '20000' && p <= '22769', nb: { name: 'Stromnetz Hamburg', portalUrl: 'https://www.stromnetz-hamburg.de/einspeiser', confidence: 'confirmed' } },
  { match: startsWith('80', '81'), nb: { name: 'SWM Infrastruktur (München)', portalUrl: 'https://www.swm-infrastruktur.de/strom/netzanschluss', confidence: 'confirmed' } },

  // --- Small municipal utilities with birdie forms (BEFORE broad rules) ---
  // Sachsen Netze — Dresden city
  { match: startsWith('010', '011', '012', '013'), nb: { name: 'Sachsen Netze', confidence: 'likely' } },
  // Netze Magdeburg — Magdeburg city
  { match: startsWith('391'), nb: { name: 'Netze Magdeburg', confidence: 'likely' } },
  // EWP Potsdam — Potsdam city
  { match: startsWith('144', '145'), nb: { name: 'EWP Potsdam', confidence: 'likely' } },
  // Werra Energie — Bad Salzungen / Wartburg district (Thuringia, ZIP 364xx)
  { match: (p) => p >= '36400' && p <= '36469', nb: { name: 'Werra Energie', confidence: 'likely' } },
  // ZEV Zwickau (Zwickauer Energieversorgung) — Zwickau city
  { match: startsWith('0805', '0806'), nb: { name: 'ZEV Zwickau', confidence: 'likely' } },
  // SW Eilenburg
  { match: (p) => p === '04838', nb: { name: 'SW Eilenburg', confidence: 'likely' } },
  // SW Schkeuditz
  { match: (p) => p === '04435', nb: { name: 'SW Schkeuditz', confidence: 'likely' } },
  // SW Merseburg
  { match: (p) => p === '06217', nb: { name: 'SW Merseburg', confidence: 'likely' } },
  // SW Weißenfels
  { match: (p) => p === '06667', nb: { name: 'SW Weißenfels', confidence: 'likely' } },
  // SW Quedlinburg
  { match: (p) => p === '06484' || p === '06485', nb: { name: 'SW Quedlinburg', confidence: 'likely' } },
  // Redinet Burgenland — Naumburg/Saale, Burgenland district
  { match: (p) => p >= '06618' && p <= '06632', nb: { name: 'Redinet Burgenland', confidence: 'please_verify' } },
  // Greizer Energienetze — Greiz (Thuringia)
  { match: (p) => p === '07973', nb: { name: 'Greizer Energienetze', confidence: 'likely' } },
  // SW Ilmenau
  { match: (p) => p === '98693', nb: { name: 'SW Ilmenau', confidence: 'likely' } },
  // SWW Wunsiedel
  { match: (p) => p === '95632', nb: { name: 'SWW Wunsiedel', confidence: 'likely' } },
  // SW Münchberg
  { match: (p) => p === '95213', nb: { name: 'SW Münchberg', confidence: 'likely' } },
  // SW Velten (Brandenburg)
  { match: (p) => p === '16727', nb: { name: 'SW Velten', confidence: 'likely' } },

  // --- Large regional grid operators ---
  // MITNETZ STROM (envia) — Saxony, southern Brandenburg, parts of Saxony-Anhalt/Thuringia
  { match: startsWith('01', '02', '03', '04', '08', '09'), nb: { name: 'MITNETZ STROM', portalUrl: 'https://www.mitnetz-strom.de/einspeisung', confidence: 'likely' } },
  // Saxony-Anhalt / southeastern Lower Saxony
  { match: startsWith('06', '38', '39'), nb: { name: 'Avacon', portalUrl: 'https://www.avacon-netz.de/de/einspeisung.html', confidence: 'likely' } },
  // Thuringia
  { match: startsWith('07', '98', '99'), nb: { name: 'TEN Thüringer Energienetze', portalUrl: 'https://www.thueringer-energienetze.com/einspeiser', confidence: 'likely' } },
  // Mecklenburg-Western Pomerania / northern Brandenburg
  { match: startsWith('15', '16', '17', '18', '19'), nb: { name: 'E.DIS', portalUrl: 'https://www.e-dis-netz.de/de/einspeiser.html', confidence: 'likely' } },
  // Schleswig-Holstein / northern Lower Saxony
  { match: startsWith('21', '22', '23', '24', '25'), nb: { name: 'Schleswig-Holstein Netz', portalUrl: 'https://www.sh-netz.com/de/einspeiser.html', confidence: 'likely' } },
  // Lower Saxony / Bremen (EWE region) — rough
  { match: startsWith('26', '27', '28', '49'), nb: { name: 'EWE Netz', portalUrl: 'https://www.ewe-netz.de/privatkunden/einspeiser', confidence: 'please_verify' } },
  // Central Lower Saxony
  { match: startsWith('29', '30', '31', '37'), nb: { name: 'Avacon', portalUrl: 'https://www.avacon-netz.de/de/einspeisung.html', confidence: 'please_verify' } },
  // NRW / Rhineland / Ruhr (Westnetz — largest DSO)
  { match: startsWith('32', '33', '34', '40', '41', '42', '44', '45', '46', '47', '48', '57', '58', '59'), nb: { name: 'Westnetz', portalUrl: 'https://www.westnetz.de/de/einspeiser.html', confidence: 'likely' } },
  // Cologne/Bonn
  { match: startsWith('50', '51', '53'), nb: { name: 'Rheinische NETZGesellschaft', portalUrl: 'https://www.rheinnetz.com/einspeisung', confidence: 'please_verify' } },
  // Hesse / Rhineland-Palatinate / Saarland (Syna / Westnetz mixed)
  { match: startsWith('35', '36', '60', '61', '63', '65'), nb: { name: 'Syna', portalUrl: 'https://www.syna.de/einspeisung', confidence: 'please_verify' } },
  { match: startsWith('64', '67', '68', '69', '55', '56', '66'), nb: { name: 'Westnetz', portalUrl: 'https://www.westnetz.de/de/einspeiser.html', confidence: 'please_verify' } },
  // Baden-Wuerttemberg (Netze BW — largest in the southwest)
  { match: startsWith('70', '71', '72', '73', '74', '75', '76', '78', '79'), nb: { name: 'Netze BW', portalUrl: 'https://www.netze-bw.de/einspeiser', confidence: 'likely' } },
  // Bavaria (Bayernwerk — largest regional DSO in Bavaria)
  { match: startsWith('82', '83', '84', '85', '90', '91', '92', '93', '94', '95', '96'), nb: { name: 'Bayernwerk', portalUrl: 'https://www.bayernwerk-netz.de/de/energie-einspeisen.html', confidence: 'likely' } },
  // Bavarian Swabia (LEW)
  { match: startsWith('86', '87', '88', '89'), nb: { name: 'LEW Verteilnetz', portalUrl: 'https://www.lew-verteilnetz.de/einspeiser', confidence: 'please_verify' } },
  // Lower Franconia
  { match: startsWith('97'), nb: { name: 'Bayernwerk', portalUrl: 'https://www.bayernwerk-netz.de/de/energie-einspeisen.html', confidence: 'please_verify' } },
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
  confirmed: 'confirmed',
  likely: 'likely',
  please_verify: 'please verify',
};
