// Registry (interconnection registry) preparation. There is no registry write API
// for installers, so registration stays a manual portal task with a 1-month deadline
// after commissioning. What .birdie can do: assemble every field the portal asks
// for from data we already have, and flag exactly what the office still has to
// type in by hand — so the registry entry is a copy job, not a research job.

import type { ProjectData } from './projektdaten';
import type { Registration } from './netzanmeldung';
import { netzbetreiberForPlz } from './netzbetreiber';
import { einspeiseart, EINSPEISEART_LABEL, phasenLabel, ruleHint } from './geschaeftsregeln';

export type FieldSource = 'reonic' | 'auto' | 'manual';

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
  // Commissioning date isn't tracked precisely; the registry clock (dueDate) starts
  // 30 days after commissioning, so we can derive an approximate date when known.
  const ibn = reg?.dueDate ? new Date(Date.parse(reg.dueDate) - 30 * 86400_000).toLocaleDateString('en-US') : '';

  return [
    {
      title: 'System Operator',
      fields: [
        { label: 'Name', value: project.customerName || '', source: 'reonic' },
        { label: 'Address', value: fullAddr, source: 'reonic' },
        { label: 'Market participant registry no.', value: '', source: 'manual', hint: 'assigned during operator registry registration' },
      ],
    },
    {
      title: 'Solar System',
      fields: [
        { label: 'Energy Source', value: 'Solar radiation', source: 'auto' },
        { label: 'Gross capacity', value: fmt(project.kwp, ' kWp'), source: 'reonic' },
        { label: 'Number of modules', value: project.moduleCount ? String(project.moduleCount) : '', source: 'reonic' },
        { label: 'Module type', value: project.moduleType || '', source: 'reonic' },
        { label: 'Inverter', value: project.inverter || '', source: 'reonic' },
        { label: 'Location', value: 'Building-mounted', source: 'auto', hint: 'Standard rooftop PV — change for ground-mount' },
        { label: 'Phase connection', value: phasenLabel(project), source: 'auto', hint: ruleHint('> 4.6 kVA → 3-phase') },
        { label: 'Commissioning date', value: ibn, source: ibn ? 'auto' : 'manual', hint: ibn ? 'derived from status — please verify' : 'only after commissioning' },
        { label: 'Feed-in type', value: EINSPEISEART_LABEL[einspeiseart(project)], source: 'auto', hint: ruleHint('Self-consumption → surplus') },
      ],
    },
    ...(project.battery
      ? [{
          title: 'Battery Storage',
          fields: [
            { label: 'Battery storage', value: project.battery, source: 'reonic' as FieldSource },
            { label: 'Usable capacity', value: fmt(project.batteryKwh, ' kWh'), source: 'reonic' as FieldSource },
          ],
        }]
      : []),
    {
      title: 'Grid Connection',
      fields: [
        { label: 'Distribution utility', value: nb?.name || '', source: nb ? 'auto' : 'manual', hint: nb ? `${nb.confidence} from ZIP — please confirm` : 'no ZIP / not assigned' },
        { label: 'Utility registry no.', value: '', source: 'manual', hint: 'from utility after registration' },
      ],
    },
  ];
}

/** Count how many fields still need manual entry — drives the readiness badge. */
export function mastrOpenCount(sections: MastrSection[]): number {
  return sections.flatMap((s) => s.fields).filter((f) => f.source === 'manual' || !f.value).length;
}
