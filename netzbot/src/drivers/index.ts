// Driver-Registry: Netzbetreiber-Name → Portal-Driver. Neue Portale hier ergänzen.

import type { PortalDriver } from '../types.js';

// EON-Gruppe (SFDC Installateurportal)
import { mitnetzDriver } from './mitnetz.js';
import { bayernwerkDriver } from './bayernwerk.js';
import { edisDriver } from './edis.js';
import { avaconDriver } from './avacon.js';

// Lovion
import { swSuhlDriver } from './sw-suhl.js';
import { swBayreuthDriver } from './sw-bayreuth.js';

// util.portal (MudBlazor)
import { zevZwickauDriver } from './zev-zwickau.js';
import { swMeeraneDriver } from './sw-meerane.js';

// Standalone-Portale (implementiert)
import { tenDriver } from './ten.js';
import { stromnetzBerlinDriver } from './stromnetz-berlin.js';
import { netzeMagdeburgDriver } from './netze-magdeburg.js';
import { swLutherstadtDriver } from './sw-lutherstadt.js';
import { werraEnergieDriver } from './werra-energie.js';
import { emsDriver } from './ems.js';
import { swDelitzschDriver } from './sw-delitzsch.js';
import { swEschwegeDriver } from './sw-eschwege.js';
import { sachsenenergieDriver } from './sachsenenergie.js';
import { sachsenNetzeDriver } from './sachsen-netze.js';

// Stubs (noch nicht implementiert — Portal erkannt, Driver ausstehend)
import { eviNetzDriver } from './evi-netz.js';
import { netzeBwDriver } from './netze-bw.js';
import { nrmDriver } from './nrm.js';
import { nErgieDriver } from './n-ergie.js';
import { swHalleDriver } from './sw-halle.js';
import { badenovaNetzeDriver } from './badenova-netze.js';
import { celleUelzenNetzDriver } from './celle-uelzen-netz.js';
import { eamNetzDriver } from './eam-netz.js';
import { inetzDriver } from './inetz.js';
import { netzLeipzigDriver } from './netz-leipzig.js';
import { swKulmbachDriver } from './sw-kulmbach.js';
import { uezMainfrankenDriver } from './uez-mainfranken.js';
import { swLudwigsfeldeDriver } from './sw-ludwigsfelde.js';
import { swJenaDriver } from './sw-jena.js';
import { enervieVernetzDriver } from './enervie-vernetzt.js';
import { netzDuesseldorfDriver } from './netz-duesseldorf.js';
import { esmSelbDriver } from './esm-selb.js';
import { enercityNetzDriver } from './enercity-netz.js';
import { ggewDriver } from './ggew.js';
import { netzeDuisburgDriver } from './netze-duisburg.js';
import { synaDriver } from './syna.js';
import { enrRudolstadtDriver } from './enr-rudolstadt.js';
import { swWeisswasserDriver } from './sw-weisswasser.js';
import { swOelsnitzDriver } from './sw-oelsnitz.js';

const drivers: PortalDriver[] = [
  // EON-Gruppe
  mitnetzDriver,
  bayernwerkDriver,
  edisDriver,
  avaconDriver,
  // Lovion
  swSuhlDriver,
  swBayreuthDriver,
  // util.portal
  zevZwickauDriver,
  swMeeraneDriver,
  // Standalone (implementiert)
  tenDriver,
  stromnetzBerlinDriver,
  netzeMagdeburgDriver,
  swLutherstadtDriver,
  werraEnergieDriver,
  emsDriver,
  swDelitzschDriver,
  swEschwegeDriver,
  sachsenenergieDriver,
  sachsenNetzeDriver,
  // Stubs
  eviNetzDriver,
  netzeBwDriver,
  nrmDriver,
  nErgieDriver,
  swHalleDriver,
  badenovaNetzeDriver,
  celleUelzenNetzDriver,
  eamNetzDriver,
  inetzDriver,
  netzLeipzigDriver,
  swKulmbachDriver,
  uezMainfrankenDriver,
  swLudwigsfeldeDriver,
  swJenaDriver,
  enervieVernetzDriver,
  netzDuesseldorfDriver,
  esmSelbDriver,
  enercityNetzDriver,
  ggewDriver,
  netzeDuisburgDriver,
  synaDriver,
  enrRudolstadtDriver,
  swWeisswasserDriver,
  swOelsnitzDriver,
];

export function driverFor(netzbetreiber: string): PortalDriver | null {
  return drivers.find((d) => d.netzbetreiber === netzbetreiber) ?? null;
}

export function supportedNetzbetreiber(): string[] {
  return drivers.map((d) => d.netzbetreiber);
}
