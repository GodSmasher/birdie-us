// Driver-Registry: Netzbetreiber-Name → Portal-Driver. Neue Portale hier ergänzen.

import type { PortalDriver } from '../types.js';
import { mitnetzDriver } from './mitnetz.js';

const drivers: PortalDriver[] = [mitnetzDriver];

export function driverFor(netzbetreiber: string): PortalDriver | null {
  return drivers.find((d) => d.netzbetreiber === netzbetreiber) ?? null;
}

export function supportedNetzbetreiber(): string[] {
  return drivers.map((d) => d.netzbetreiber);
}
