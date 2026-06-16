import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Phase-Mapping: Ordnername → Phase
const PHASE_MAP: Record<string, 'ANA' | 'FM' | 'WP'> = {
  'ANA': 'ANA',
  'FM': 'FM',
  'FM-IBN': 'FM',
  'IB': 'FM',
  'ANA - FM': 'FM', // SW Hof uses combined folder
  'WP': 'WP',
  'WPA': 'WP',
  'WP- Netzanschluss': 'WP',
  'ÂNA': 'ANA', // Encoding artifact: ÂNA → ANA
};

export interface TemplateInfo {
  /** Relative path from nb-templates/ — used as form=ai:path */
  path: string;
  /** Human-readable label (filename without .pdf) */
  label: string;
  /** Phase: ANA (Anmeldung), FM (Fertigmeldung/IBN), WP (Wärmepumpe) */
  phase: 'ANA' | 'FM' | 'WP';
}

/** Scan nb-templates/{nb}/ for all PDF templates. */
function scanTemplates(nbFolder: string): TemplateInfo[] {
  const baseDir = path.join(process.cwd(), 'nb-templates', nbFolder);
  if (!fs.existsSync(baseDir)) return [];

  const results: TemplateInfo[] = [];

  // Check for PDFs directly in the NB folder (no phase subfolder)
  for (const entry of fs.readdirSync(baseDir)) {
    const fullPath = path.join(baseDir, entry);
    if (entry.endsWith('.pdf') && fs.statSync(fullPath).isFile()) {
      results.push({
        path: `${nbFolder}/${entry}`,
        label: entry.replace('.pdf', ''),
        phase: 'ANA', // Default: Anmeldung
      });
    }
  }

  // Check phase subfolders
  for (const sub of fs.readdirSync(baseDir)) {
    const subPath = path.join(baseDir, sub);
    if (!fs.statSync(subPath).isDirectory()) continue;
    // Skip nested .pdf directories (encoding artifacts like "file.pdf/file.pdf")
    if (sub.endsWith('.pdf')) continue;

    const phase = PHASE_MAP[sub] ?? 'ANA';

    for (const file of fs.readdirSync(subPath)) {
      if (!file.endsWith('.pdf')) continue;
      const filePath = path.join(subPath, file);
      if (!fs.statSync(filePath).isFile()) continue;

      results.push({
        path: `${nbFolder}/${sub}/${file}`,
        label: file.replace('.pdf', '').replace(/_/g, ' '),
        phase,
      });
    }
  }

  return results;
}

/** Match NB name from registration to folder name. */
function matchNbFolder(netzbetreiber: string): string | null {
  const nbDir = path.join(process.cwd(), 'nb-templates');
  if (!fs.existsSync(nbDir)) return null;

  const folders = fs.readdirSync(nbDir).filter(f => {
    const full = path.join(nbDir, f);
    return fs.statSync(full).isDirectory() && !f.endsWith('.xls') && !f.endsWith('.xlsx');
  });

  const lower = netzbetreiber.toLowerCase();

  // Exact match first
  const exact = folders.find(f => f.toLowerCase() === lower);
  if (exact) return exact;

  // Partial match: folder name contained in NB name or vice versa
  const partial = folders.find(f => {
    const fl = f.toLowerCase();
    return lower.includes(fl) || fl.includes(lower);
  });
  if (partial) return partial;

  // Keyword match for common abbreviations
  const keywords: Record<string, string[]> = {
    'Bayernwerk': ['bayernwerk'],
    'TEN': ['ten', 'thüringer energienetze', 'thuringer'],
    'Sachsen Netze': ['sachsen netze', 'sachsennetze'],
    'Netze Magdeburg': ['netze magdeburg', 'netzmagdeburg'],
    'Werra Energie': ['werra'],
    'SW Ilmenau': ['ilmenau'],
    'SWW Wunsiedel': ['wunsiedel'],
    'SW Quedlinburg': ['quedlinburg'],
    'SW Merseburg': ['merseburg'],
    'SW Weißenfels': ['weißenfels', 'weissenfels'],
    'SW Schkeuditz': ['schkeuditz'],
    'SW Münchberg': ['münchberg', 'muenchberg'],
    'Greizer Energienetze': ['greizer', 'greiz'],
    'Zwickau': ['zwickau'],
    'Redinet Burgendland': ['redinet', 'burgenland'],
    'SW Velten': ['velten'],
    'EWP Potsdam': ['potsdam', 'ewp'],
    'SW Eilenburg': ['eilenburg'],
    'SW Eschwege': ['eschwege'],
    'SW Hof': ['sw hof', 'stadtwerke hof'],
    'SW Meißen': ['meißen', 'meissen'],
    'EMS': ['ems '],
  };

  for (const [folder, keys] of Object.entries(keywords)) {
    if (keys.some(k => lower.includes(k)) && folders.includes(folder)) {
      return folder;
    }
  }

  return null;
}

// GET /api/netzanmeldung/templates?nb=Sachsen Netze
export async function GET(req: Request) {
  const url = new URL(req.url);
  const nb = url.searchParams.get('nb') ?? '';

  if (!nb) {
    // Return all NB folders and their template counts
    const nbDir = path.join(process.cwd(), 'nb-templates');
    const folders = fs.readdirSync(nbDir).filter(f => {
      const full = path.join(nbDir, f);
      return fs.statSync(full).isDirectory() && !f.endsWith('.xls') && !f.endsWith('.xlsx');
    });
    const summary = folders.map(f => ({
      folder: f,
      templates: scanTemplates(f).length,
    }));
    return Response.json({ folders: summary });
  }

  const folder = matchNbFolder(nb);
  if (!folder) {
    return Response.json({ templates: [], folder: null, nb });
  }

  const templates = scanTemplates(folder);
  return Response.json({ templates, folder, nb });
}
