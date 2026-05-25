/**
 * Bayernwerk Netz GmbH — Portal-Filler
 * Portal: https://www.bayernwerk-netz.de/de/meinauftragsportal.html
 * Plattform: SFDC Installateurportal (EON-Gruppe)
 */

const { fillEonGroup } = require('./_eon-group');

const PORTAL_URL = 'https://www.bayernwerk-netz.de/de/meinauftragsportal.html';

async function fill({ page, credentials, bundle, extra, snap }) {
  return fillEonGroup({ page, credentials, bundle, extra, snap, portalUrl: PORTAL_URL });
}

module.exports = { fill };
