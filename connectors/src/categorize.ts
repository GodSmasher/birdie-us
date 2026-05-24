// Keyword-based component classification. Reonic v2 has no group-name endpoint,
// so we derive a clean componentType from the article text. Order matters:
// specific rules before general ones.

export type ComponentType =
  | 'module'
  | 'inverter'
  | 'microinverter'
  | 'optimizer'
  | 'batteryStorage'
  | 'wallbox'
  | 'heatPump'
  | 'heatingRod'
  | 'hotWaterStorage'
  | 'moduleFrameConstruction'
  | 'installationFee'
  | 'serviceFee'
  | 'other';

const RULES: [ComponentType, RegExp][] = [
  ['microinverter', /mikro.?wechselrichter|microinverter|micro.?inverter|powerstream/],
  ['optimizer', /optimi[sz]er|leistungsoptimierer/],
  ['inverter', /wechselrichter|inverter|\bwr\b|hybrid-?wr/],
  ['batteryStorage', /speicher|batterie|battery|akku|\blfp\b|powerocean.*batt/],
  ['wallbox', /wallbox|ladestation|charger|typ.?2|wall ?box|emob/],
  ['heatPump', /wärmepumpe|heat ?pump/],
  ['heatingRod', /heizstab|heating rod/],
  ['hotWaterStorage', /warmwasserspeicher|pufferspeicher|brauchwasser/],
  ['moduleFrameConstruction', /unterkonstruktion|montagesystem|gestell|schiene|dachhaken|befestigung/],
  ['module', /\bmodul|pv-?modul|solarmodul|\bpanel\b|glas-glas|full ?black|\d{3}\s?wp/],
  ['installationFee', /montage|installation|inbetriebnahme|dienstleistung/],
  ['serviceFee', /provision|gebühr|pauschale|service|abmelden|anmeldung|netzanmeldung|zähler/],
];

export function inferComponentType(name = '', description = '', brand = ''): ComponentType {
  const t = `${name} ${description} ${brand}`.toLowerCase();
  for (const [type, pattern] of RULES) {
    if (pattern.test(t)) return type;
  }
  return 'other';
}

export const componentTypeLabels: Record<ComponentType, string> = {
  module: 'PV-Modul',
  inverter: 'Wechselrichter',
  microinverter: 'Mikrowechselrichter',
  optimizer: 'Optimierer',
  batteryStorage: 'Speicher',
  wallbox: 'Wallbox',
  heatPump: 'Wärmepumpe',
  heatingRod: 'Heizstab',
  hotWaterStorage: 'Warmwasserspeicher',
  moduleFrameConstruction: 'Unterkonstruktion',
  installationFee: 'Montage',
  serviceFee: 'Dienstleistung',
  other: 'Sonstiges',
};
