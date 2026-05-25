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

// Standalone-Portale
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

const drivers: PortalDriver[] = [
  mitnetzDriver,
  bayernwerkDriver,
  edisDriver,
  avaconDriver,
  swSuhlDriver,
  swBayreuthDriver,
  zevZwickauDriver,
  swMeeraneDriver,
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
];

export function driverFor(netzbetreiber: string): PortalDriver | null {
  return drivers.find((d) => d.netzbetreiber === netzbetreiber) ?? null;
}

export function supportedNetzbetreiber(): string[] {
  return drivers.map((d) => d.netzbetreiber);
}
