/**
 * MitNetz Strom GmbH — Portal-Filler
 * Portal: https://portal.mitnetz-strom.de/de/meinauftragsportal.html
 * Plattform: SFDC Installateurportal (EON-Gruppe, identisch mit Bayernwerk)
 */

const { fillEonGroup } = require('./_eon-group');

const PORTAL_URL = 'https://portal.mitnetz-strom.de/de/meinauftragsportal.html';

async function fill({ page, credentials, bundle, extra, snap }) {
  return fillEonGroup({ page, credentials, bundle, extra, snap, portalUrl: PORTAL_URL });
}

module.exports = { fill };
