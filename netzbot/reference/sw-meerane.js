/**
 * Stadtwerke Meerane GmbH — Portal-Filler
 * Portal: https://netzanschlussportal.sw-meerane.de
 * Plattform: util.portal (ASP.NET MVC + MudBlazor, identisch mit ZEV Zwickau)
 *
 * Pflichtfeld: betreiber.geburtsdatum ('dd.MM.yyyy') — extra.geburtsdatum mitgeben!
 */

const { fillUtilPortal } = require('./_util-portal');

const PORTAL_URL = 'https://netzanschlussportal.sw-meerane.de';

async function fill({ page, credentials, bundle, extra, snap }) {
  return fillUtilPortal({ page, credentials, bundle, extra, snap, portalUrl: PORTAL_URL });
}

module.exports = { fill };
