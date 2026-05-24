import type { Connector, ConnectorManifest } from './types.js';
import { awattar } from './connectors/awattar.js';
import { tibber } from './connectors/tibber.js';
import { solcast } from './connectors/solcast.js';
import { openweathermap } from './connectors/openweathermap.js';

// All implemented connectors. Add new adapters here.
export const connectors: Connector[] = [awattar, tibber, solcast, openweathermap];

// Planned connectors — surfaced in manifests so the frontend can show a roadmap.
export const plannedManifests: ConnectorManifest[] = [
  { id: 'fronius', name: 'Fronius', vendor: 'Fronius', category: 'inverter', regions: ['DE', 'AT', 'CH'], authType: 'oauth2', protocol: 'Solar.web API / Modbus TCP', capabilities: ['read'], config: [], docsUrl: 'https://www.fronius.com/en/solar-energy/installers-partners/products-solutions/monitoring/solar-api-json-api', status: 'planned' },
  { id: 'sma', name: 'SMA', vendor: 'SMA Solar', category: 'inverter', regions: ['DE', 'AT', 'CH'], authType: 'oauth2', protocol: 'ennexOS API / Modbus SunSpec', capabilities: ['read'], config: [], docsUrl: 'https://www.sma.de/en/products/monitoring-control', status: 'planned' },
  { id: 'kostal', name: 'Kostal', vendor: 'Kostal Solar', category: 'inverter', regions: ['DE', 'AT', 'CH'], authType: 'modbus', protocol: 'Modbus TCP (lokal)', capabilities: ['read'], config: [], docsUrl: 'https://www.kostal-solar-electric.com', status: 'planned' },
  { id: 'sungrow', name: 'Sungrow', vendor: 'Sungrow', category: 'inverter', regions: ['DE', 'AT', 'CH'], authType: 'apikey', protocol: 'iSolarCloud API / Modbus TCP', capabilities: ['read'], config: [], docsUrl: 'https://developer.isolarcloud.com', status: 'planned' },
  { id: 'ecoflow', name: 'EcoFlow', vendor: 'EcoFlow', category: 'battery', regions: ['DE', 'AT', 'CH'], authType: 'apikey', protocol: 'IoT Developer API (REST + MQTT)', capabilities: ['read', 'write', 'realtime'], config: [], docsUrl: 'https://developer.ecoflow.com', status: 'planned' },
  { id: 'victron', name: 'Victron Energy', vendor: 'Victron', category: 'battery', regions: ['DE', 'AT', 'CH'], authType: 'token', protocol: 'VRM API / Modbus TCP / MQTT', capabilities: ['read', 'realtime'], config: [], docsUrl: 'https://vrm-api-docs.victronenergy.com', status: 'planned' },
  { id: 'anker-solix', name: 'Anker SOLIX', vendor: 'Anker', category: 'battery', regions: ['DE', 'AT', 'CH'], authType: 'token', protocol: 'Cloud (inoffiziell)', capabilities: ['read'], config: [], docsUrl: 'https://github.com/thomluther/anker-solix-api', status: 'planned' },
  { id: 'bluetti', name: 'Bluetti', vendor: 'Bluetti', category: 'battery', regions: ['DE', 'AT', 'CH'], authType: 'token', protocol: 'MQTT (inoffiziell)', capabilities: ['read'], config: [], docsUrl: 'https://github.com/warhammerkid/bluetti_mqtt', status: 'planned' },
  { id: 'bexio', name: 'Bexio', vendor: 'Bexio AG', category: 'accounting', regions: ['CH'], authType: 'oauth2', protocol: 'REST + OAuth2', capabilities: ['read', 'write'], config: [], docsUrl: 'https://docs.bexio.com', status: 'planned' },
  { id: 'sevdesk', name: 'sevDesk', vendor: 'sevDesk', category: 'accounting', regions: ['DE'], authType: 'apikey', protocol: 'REST', capabilities: ['read', 'write'], config: [], docsUrl: 'https://api.sevdesk.de', status: 'planned' },
  { id: 'datev', name: 'DATEV', vendor: 'DATEV eG', category: 'accounting', regions: ['DE'], authType: 'oauth2', protocol: 'DATEVconnect (Partnerprogramm)', capabilities: ['read', 'write'], config: [], docsUrl: 'https://developer.datev.de', status: 'planned' },
  { id: 'whatsapp', name: 'WhatsApp Business', vendor: 'Meta', category: 'comms', regions: ['DE', 'AT', 'CH'], authType: 'token', protocol: 'Cloud API + Webhook', capabilities: ['read', 'write', 'webhook'], config: [], docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api', status: 'planned' },
];

export function getConnector(id: string): Connector | undefined {
  return connectors.find((c) => c.manifest.id === id);
}

export function allManifests(): ConnectorManifest[] {
  return [...connectors.map((c) => c.manifest), ...plannedManifests];
}
