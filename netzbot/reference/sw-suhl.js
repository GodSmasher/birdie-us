/**
 * Stadtwerke Suhl/Zella-Mehlis Netz GmbH — Portal-Filler
 * Portal: https://netzportal.swsz-netz.de/public/login.html
 * Plattform: Lovion — Login: #username, #password, #login_button
 */

const { fillLovion } = require('./_lovion');

const LOGIN_URL = 'https://netzportal.swsz-netz.de/public/login.html';

async function fill({ page, credentials, bundle, extra, snap }) {
  return fillLovion({ page, credentials, bundle, extra, snap, loginUrl: LOGIN_URL });
}

module.exports = { fill };
