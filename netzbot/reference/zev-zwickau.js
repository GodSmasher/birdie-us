/**
 * ZEV Energie GmbH Zwickau — Portal-Filler
 * Portal: https://netzportal.zev-energie.de
 * Plattform: util.portal (ASP.NET MVC + MudBlazor)
 *
 * Pflichtfeld: betreiber.geburtsdatum ('dd.MM.yyyy') — extra.geburtsdatum mitgeben!
 */

const { fillUtilPortal } = require('./_util-portal');

const PORTAL_URL = 'https://netzportal.zev-energie.de';

async function fill({ page, credentials, bundle, extra, snap }) {
  return fillUtilPortal({ page, credentials, bundle, extra, snap, portalUrl: PORTAL_URL });
}

module.exports = { fill };
