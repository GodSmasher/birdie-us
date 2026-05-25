/**
 * PLZ → Netzbetreiber Lookup
 *
 * Priorität:
 * 1. Exakte PLZ aus plz_ranges (Stadtwerke mit klaren PLZ)
 * 2. Ausnahme-Prüfung (verhindert falsche Bayernwerk-Zuweisung für SW Hof etc.)
 * 3. PLZ-Präfix aus plz_prefix (Großnetze wie Bayernwerk, MitNetz, TEN)
 * 4. Geocoding-Fallback (OpenStreetMap)
 * 5. Manuell
 */

const https = require('https');
const nbProfiles = require('./nb-profiles.json');

// ── Lookup-Tabellen vorkompilieren ──────────────────────────────────────────

const EXACT_MAP = {};
for (const [nbKey, profile] of Object.entries(nbProfiles)) {
  for (const plz of (profile.plz_ranges || [])) {
    EXACT_MAP[plz] = nbKey;
  }
}

const AUSNAHMEN = {};
for (const [nbKey, profile] of Object.entries(nbProfiles)) {
  if (profile.plz_ausnahmen?.length) {
    AUSNAHMEN[nbKey] = new Set(profile.plz_ausnahmen);
  }
}

const PREFIX_LIST = [];
for (const [nbKey, profile] of Object.entries(nbProfiles)) {
  for (const prefix of (profile.plz_prefix || [])) {
    PREFIX_LIST.push({ prefix, nbKey });
  }
}
PREFIX_LIST.sort((a, b) => b.prefix.length - a.prefix.length);

/**
 * Ermittle Netzbetreiber anhand PLZ
 */
async function findNetzbetreiber(plz, city = '') {
  if (!plz) return { nbKey: null, profile: null, method: 'manual', note: 'Keine PLZ angegeben' };

  const plzClean = plz.replace(/\s/g, '').padStart(5, '0');

  // 1. Exakter PLZ-Match (Stadtwerke haben Vorrang)
  if (EXACT_MAP[plzClean]) {
    const nbKey = EXACT_MAP[plzClean];
    return { nbKey, profile: nbProfiles[nbKey], method: 'exact_plz' };
  }

  // 2. Präfix-Match (Bayernwerk, MitNetz, TEN, SachsenEnergie, ...)
  for (const { prefix, nbKey } of PREFIX_LIST) {
    if (plzClean.startsWith(prefix)) {
      if (AUSNAHMEN[nbKey]?.has(plzClean)) continue;
      return { nbKey, profile: nbProfiles[nbKey], method: 'prefix_' + prefix };
    }
  }

  // 3. Geocoding via OpenStreetMap Nominatim
  try {
    const geoResult = await geocodePLZ(plzClean);
    if (geoResult) {
      const match = matchByGeodata(geoResult, plzClean, city);
      if (match) return { ...match, method: 'geocoding' };
    }
  } catch {
    // Geocoding optional — nicht blockierend
  }

  // 4. Kein Match → manuell
  return {
    nbKey: null,
    profile: null,
    method: 'manual',
    note: `PLZ ${plz} (${city}) nicht zugeordnet — bitte manuell wählen`,
  };
}

async function geocodePLZ(plz) {
  return new Promise((resolve) => {
    const searchPath = `/search?postalcode=${plz}&country=de&format=json&limit=1&addressdetails=1`;
    let body = '';
    https.get(
      { hostname: 'nominatim.openstreetmap.org', path: searchPath, headers: { 'User-Agent': 'birdie-portal-bots/1.0' } },
      (r) => {
        r.on('data', d => body += d);
        r.on('end', () => {
          try { resolve(JSON.parse(body)[0] || null); }
          catch { resolve(null); }
        });
      }
    ).on('error', () => resolve(null));
  });
}

function matchByGeodata(geo, plz, city) {
  const state = (geo.address?.state || '').toLowerCase();
  const cityName = (geo.address?.city || geo.address?.town || geo.address?.village || city || '').toLowerCase();

  if (state.includes('berlin')) return { nbKey: 'Stromnetz Berlin', profile: nbProfiles['Stromnetz Berlin'] };
  if (state.includes('bavaria') || state.includes('bayern')) {
    if (cityName.includes('bayreuth')) return { nbKey: 'SW Bayreuth', profile: nbProfiles['SW Bayreuth'] };
    return { nbKey: 'Bayernwerk', profile: nbProfiles['Bayernwerk'], note: 'Bayernwerk (Bayern allgemein)' };
  }
  if (state.includes('thüringen') || state.includes('thuringia')) {
    if (cityName.includes('ruhla') || cityName.includes('barchfeld') || cityName.includes('creuzburg')) {
      return { nbKey: 'Werra Energie', profile: nbProfiles['Werra Energie'] };
    }
    return { nbKey: 'TEN', profile: nbProfiles['TEN'], note: 'TEN Thüringen (bitte prüfen)' };
  }
  if (state.includes('sachsen') && !state.includes('anhalt')) {
    if (cityName.includes('dresden') || cityName.includes('görlitz') || cityName.includes('bautzen')) {
      return { nbKey: 'SachsenEnergie', profile: nbProfiles['SachsenEnergie'] };
    }
    if (cityName.includes('zwickau')) return { nbKey: 'ZEV Zwickau', profile: nbProfiles['ZEV Zwickau'] };
    return { nbKey: 'MitNetz', profile: nbProfiles['MitNetz'], note: 'MitNetz Sachsen (bitte prüfen)' };
  }
  if (state.includes('sachsen-anhalt')) {
    if (cityName.includes('magdeburg')) return { nbKey: 'Netze Magdeburg', profile: nbProfiles['Netze Magdeburg'] };
    return { nbKey: 'MitNetz', profile: nbProfiles['MitNetz'], note: 'MitNetz Sachsen-Anhalt (bitte prüfen)' };
  }
  if (state.includes('hessen') || state.includes('hesse')) {
    if (cityName.includes('eschwege')) return { nbKey: 'SW Eschwege', profile: nbProfiles['SW Eschwege'] };
  }
  if (state.includes('brandenburg')) {
    return { nbKey: 'E.Dis', profile: nbProfiles['E.Dis'], note: 'E.Dis Brandenburg (bitte prüfen)' };
  }
  if (state.includes('mecklenburg') || state.includes('vorpommern')) {
    return { nbKey: 'E.Dis', profile: nbProfiles['E.Dis'], note: 'E.Dis Mecklenburg-Vorpommern (bitte prüfen)' };
  }
  return null;
}

module.exports = { findNetzbetreiber, getAllProfiles: () => nbProfiles };
