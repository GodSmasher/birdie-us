/**
 * Stadtwerke Bayreuth Energie und Wasser GmbH — Portal-Filler
 * Portal: https://www.stadtwerke-bayreuth.de/installateurportal/public/login.html
 * Plattform: Lovion — identisch mit SW Suhl (gleiche Basis-Lib)
 *
 * Registrierung: Freischaltung durch Stadtwerke Bayreuth erforderlich.
 * Kontakt: sekretariat.nm@stadtwerke-bayreuth.de, Tel. 0921 600-652
 */

const { fillLovion } = require('./_lovion');

const LOGIN_URL = 'https://www.stadtwerke-bayreuth.de/installateurportal/public/login.html';

async function fill({ page, credentials, bundle, extra, snap }) {
  return fillLovion({ page, credentials, bundle, extra, snap, loginUrl: LOGIN_URL });
}

module.exports = { fill };
