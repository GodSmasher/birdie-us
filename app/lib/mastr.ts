// MaStR (Marktstammdatenregister) preparation. There is no MaStR write API for
// installers, so registration stays a manual portal task with a 1-month deadline
// after Inbetriebnahme. What .birdie can do: assemble every field the portal asks
// for from data we already have, and flag exactly what the office still has to
// type in by hand — so the MaStR entry is a copy job, not a research job.

import type { ProjectData } from './projektdaten';
import type { Registration } from './netzanmeldung';
import { netzbetreiberForPlz } from './netzbetreiber';
import { einspeiseart, EINSPEISEART_LABEL, phasenLabel, ruleHint } from './geschaeftsregeln';

export type FieldSource = 'reonic' | 'auto' | 'manuell';

export interface MastrField {
  label: string;
  value: string;
  source: FieldSource;
  hint?: string;
}

export interface MastrSection {
  title: string;
  fields: MastrField[];
}

const fmt = (n?: number, unit = '') => (n && n > 0 ? `${String(n).replace('.', ',')}${unit}` : '');

export function buildMastrSheet(project: ProjectData, reg?: Registration): MastrSection[] {
  const nb = netzbetreiberForPlz(project.address?.zip);
  const addr = project.address;
  const fullAddr = addr ? [addr.line, [addr.zip, addr.city].filter(Boolean).join(' ')].filter(Boolean).join(', ') : '';
  // Inbetriebnahme date isn't tracked precisely; the MaStR clock (dueDate) starts
  // 30 days after IBN, so we can derive an approximate IBN date when known.
  const ibn = reg?.dueDate ? new Date(Date.parse(reg.dueDate) - 30 * 86400_000).toLocaleDateString('de-DE') : '';

  return [
    {
      title: 'Anlagenbetreiber',
      fields: [
        { label: 'Name', value: project.customerName || '', source: 'reonic' },
        { label: 'Anschrift', value: fullAddr, source: 'reonic' },
        { label: 'Marktakteur-MaStR-Nr.', value: '', source: 'manuell', hint: 'wird bei MaStR-Registrierung des Betreibers vergeben' },
      ],
    },
    {
      title: 'Solaranlage',
      fields: [
        { label: 'Energieträger', value: 'Solare Strahlungsenergie', source: 'auto' },
        { label: 'Bruttoleistung', value: fmt(project.kwp, ' kWp'), source: 'reonic' },
        { label: 'Anzahl Module', value: project.moduleCount ? String(project.moduleCount) : '', source: 'reonic' },
        { label: 'Modultyp', value: project.moduleType || '', source: 'reonic' },
        { label: 'Wechselrichter', value: project.inverter || '', source: 'reonic' },
        { label: 'Lage', value: 'Bauliche Anlage (Gebäude)', source: 'auto', hint: 'Standard PV-Aufdach — bei Freifläche ändern' },
        { label: 'Phasenanschluss', value: phasenLabel(project), source: 'auto', hint: ruleHint('> 4,6 kVA → 3-phasig') },
        { label: 'Inbetriebnahmedatum', value: ibn, source: ibn ? 'auto' : 'manuell', hint: ibn ? 'aus Status abgeleitet — bitte prüfen' : 'erst nach Inbetriebnahme' },
        { label: 'Einspeiseart', value: EINSPEISEART_LABEL[einspeiseart(project)], source: 'auto', hint: ruleHint('Eigenverbrauch → Überschuss') },
      ],
    },
    ...(project.battery
      ? [{
          title: 'Stromspeicher',
          fields: [
            { label: 'Batteriespeicher', value: project.battery, source: 'reonic' as FieldSource },
            { label: 'Nutzbare Kapazität', value: fmt(project.batteryKwh, ' kWh'), source: 'reonic' as FieldSource },
          ],
        }]
      : []),
    {
      title: 'Netzanschluss',
      fields: [
        { label: 'Netzbetreiber', value: nb?.name || '', source: nb ? 'auto' : 'manuell', hint: nb ? `${nb.confidence} aus PLZ — bitte bestätigen` : 'keine PLZ / nicht zugeordnet' },
        { label: 'Netzbetreiberprüfung-MaStR-Nr.', value: '', source: 'manuell', hint: 'vom Netzbetreiber nach Anmeldung' },
      ],
    },
  ];
}

/** Count how many fields still need manual entry — drives the readiness badge. */
export function mastrOpenCount(sections: MastrSection[]): number {
  return sections.flatMap((s) => s.fields).filter((f) => f.source === 'manuell' || !f.value).length;
}
