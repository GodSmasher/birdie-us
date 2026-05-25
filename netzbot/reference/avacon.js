/**
 * Avacon Netz GmbH (Niedersachsen / Sachsen-Anhalt) — Portal-Filler
 * Portal: https://www.avacon-netz.de/de/meinauftragsportal.html
 * Plattform: SFDC Installateurportal (EON-Gruppe, identisch mit Bayernwerk)
 */

const { fillEonGroup } = require('./_eon-group');

const PORTAL_URL = 'https://www.avacon-netz.de/de/meinauftragsportal.html';

async function fill({ page, credentials, bundle, extra, snap }) {
  return fillEonGroup({ page, credentials, bundle, extra, snap, portalUrl: PORTAL_URL });
}

module.exports = { fill };
