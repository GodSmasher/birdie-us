// pCloud EU API client — file upload/download/listing for document signing workflow.
//
// Volta uses pCloud EU (eapi.pcloud.com) to exchange documents between office
// (Katrin) and field electricians. The electrician signs PDFs on a tablet, then
// uploads the signed version back.
//
// Folder structure (already exists in Volta's pCloud):
//   /Netzanmeldungen/Anmeldung/          ← PDFs ready for signing
//   /Netzanmeldungen/Anmeldung/Unterschrieben/ ← signed PDFs
//   /Netzanmeldungen/Anmeldung/Klärung/       ← open questions
//
// Auth: OAuth2 access token passed as `?auth=TOKEN` query param.
// Token stored in env var PCLOUD_ACCESS_TOKEN.

const API = 'https://eapi.pcloud.com';

function token(): string {
  const t = process.env.PCLOUD_ACCESS_TOKEN;
  if (!t) throw new Error('PCLOUD_ACCESS_TOKEN nicht gesetzt');
  return t;
}

// ── Low-level helpers ────────────────────────────────────────────────────────

async function pcloudGet<T = Record<string, unknown>>(method: string, params: Record<string, string | number> = {}): Promise<T> {
  const qs = new URLSearchParams({ auth: token(), ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const res = await fetch(`${API}/${method}?${qs}`);
  if (!res.ok) throw new Error(`pCloud ${method}: HTTP ${res.status}`);
  const data = await res.json() as T & { result?: number; error?: string };
  if (data.result && data.result !== 0) throw new Error(`pCloud ${method}: ${data.error || `error ${data.result}`}`);
  return data;
}

// ── Folder operations ────────────────────────────────────────────────────────

export interface PCloudFolder {
  folderid: number;
  name: string;
  created: boolean;
}

/** Create a folder if it doesn't exist. Returns folder metadata. */
export async function ensureFolder(parentFolderId: number, name: string): Promise<PCloudFolder> {
  const data = await pcloudGet<{ metadata: PCloudFolder }>('createfolderifnotexists', { folderid: parentFolderId, name });
  return data.metadata;
}

/** Create a nested folder path like "A/B/C" under a parent. Returns the leaf folder. */
export async function ensureFolderPath(parentFolderId: number, pathParts: string[]): Promise<PCloudFolder> {
  let current = parentFolderId;
  let result: PCloudFolder = { folderid: current, name: '', created: false };
  for (const part of pathParts) {
    result = await ensureFolder(current, part);
    current = result.folderid;
  }
  return result;
}

// ── File listing ─────────────────────────────────────────────────────────────

export interface PCloudFile {
  fileid: number;
  name: string;
  size: number;
  created: string;
  modified: string;
  contenttype: string;
  isfolder: boolean;
}

export interface FolderContents {
  folder: { folderid: number; name: string };
  files: PCloudFile[];
  folders: PCloudFile[];
}

/** List contents of a folder. */
export async function listFolder(folderId: number): Promise<FolderContents> {
  const data = await pcloudGet<{ metadata: { folderid: number; name: string; contents?: PCloudFile[] } }>('listfolder', { folderid: folderId });
  const contents = data.metadata.contents ?? [];
  return {
    folder: { folderid: data.metadata.folderid, name: data.metadata.name },
    files: contents.filter((c) => !c.isfolder),
    folders: contents.filter((c) => c.isfolder),
  };
}

// ── File upload ──────────────────────────────────────────────────────────────

export interface UploadResult {
  fileid: number;
  name: string;
  size: number;
}

/** Upload a file (Buffer/Uint8Array) to a pCloud folder. */
export async function uploadFile(folderId: number, filename: string, content: Buffer | Uint8Array): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(content)]), filename);

  const qs = new URLSearchParams({ auth: token(), folderid: String(folderId), filename, renameifexists: '1' });
  const res = await fetch(`${API}/uploadfile?${qs}`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`pCloud upload: HTTP ${res.status}`);

  const data = await res.json() as { result: number; error?: string; metadata?: UploadResult[] };
  if (data.result !== 0) throw new Error(`pCloud upload: ${data.error || `error ${data.result}`}`);
  if (!data.metadata || data.metadata.length === 0) throw new Error('pCloud upload: no metadata returned');

  const m = data.metadata[0];
  return { fileid: m.fileid, name: m.name, size: m.size };
}

// ── File download ────────────────────────────────────────────────────────────

/** Get a direct download URL for a file. */
export async function getFileLink(fileId: number): Promise<string> {
  const data = await pcloudGet<{ hosts: string[]; path: string }>('getfilelink', { fileid: fileId });
  return `https://${data.hosts[0]}${data.path}`;
}

/** Download a file's content as Buffer. */
export async function downloadFile(fileId: number): Promise<Buffer> {
  const url = await getFileLink(fileId);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`pCloud download: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ── Public links ─────────────────────────────────────────────────────────────

export interface PublicLink {
  link: string;
  code: string;
}

/** Create a public download link for a file. */
export async function getPublicLink(fileId: number): Promise<PublicLink> {
  return pcloudGet<PublicLink>('getfilepublink', { fileid: fileId });
}

// ── Volta-specific: known folder IDs ─────────────────────────────────────────
// These come from the existing pCloud structure.

export const VOLTA_FOLDERS = {
  netzanmeldungen: 15113031187,       // /Netzanmeldungen/
  anmeldung: 16519825349,             // /Netzanmeldungen/Anmeldung/
  // Sub-folders inside Anmeldung/ (will be looked up dynamically if needed)
} as const;

/** Find a sub-folder by name inside a parent folder. */
export async function findSubFolder(parentId: number, name: string): Promise<number | null> {
  const contents = await listFolder(parentId);
  const match = contents.folders.find((f) => f.name.toLowerCase() === name.toLowerCase());
  return match ? match.fileid : null;
}

/** Get the "Unterschrieben" folder ID inside /Netzanmeldungen/Anmeldung/. */
export async function getUnterschriebenFolder(): Promise<number> {
  const id = await findSubFolder(VOLTA_FOLDERS.anmeldung, 'Unterschrieben');
  if (!id) throw new Error('pCloud: Ordner "Unterschrieben" nicht gefunden');
  return id;
}

/** Get the "Klärung" folder ID inside /Netzanmeldungen/Anmeldung/. */
export async function getKlaerungFolder(): Promise<number> {
  const id = await findSubFolder(VOLTA_FOLDERS.anmeldung, 'Klärung');
  if (!id) throw new Error('pCloud: Ordner "Klärung" nicht gefunden');
  return id;
}
