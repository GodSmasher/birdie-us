// VNB-Bot-Client: ruft den Netzbot auf dem VPS auf, um per vnbdigital.de
// den exakten Verteilnetzbetreiber für eine Adresse zu ermitteln.

const BOT_URL = process.env.NETZBOT_API_URL ?? 'http://217.160.67.197:3099';
const BOT_TOKEN = process.env.BIRDIE_BOT_TOKEN ?? '';

export interface VnbLookupResult {
  netzbetreiber: string | null;
  confidence: 'exakt' | 'mehrdeutig' | 'fehler';
  source: 'vnbdigital.de';
  details?: string;
  error?: string;
}

/** Lookup a single address via the VPS bot. */
export async function botVnbLookup(address: {
  zip: string;
  city?: string;
  street?: string;
}): Promise<VnbLookupResult> {
  try {
    const res = await fetch(`${BOT_URL}/vnb-lookup`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`Bot returned ${res.status}`);
    return (await res.json()) as VnbLookupResult;
  } catch (e) {
    return {
      netzbetreiber: null,
      confidence: 'fehler',
      source: 'vnbdigital.de',
      error: `Bot nicht erreichbar: ${(e as Error).message}`,
    };
  }
}

/** Batch lookup for multiple addresses (sequential, with delays). */
export async function botVnbLookupBatch(
  addresses: { offerId: string; zip: string; city?: string; street?: string }[],
): Promise<Record<string, VnbLookupResult>> {
  try {
    const res = await fetch(`${BOT_URL}/vnb-lookup-batch`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addresses }),
      signal: AbortSignal.timeout(addresses.length * 45_000 + 30_000),
    });
    if (!res.ok) throw new Error(`Bot returned ${res.status}`);
    const data = (await res.json()) as { results: Record<string, VnbLookupResult> };
    return data.results;
  } catch (e) {
    // Fallback: return error for all
    const err: VnbLookupResult = {
      netzbetreiber: null,
      confidence: 'fehler',
      source: 'vnbdigital.de',
      error: `Batch-Fehler: ${(e as Error).message}`,
    };
    return Object.fromEntries(addresses.map((a) => [a.offerId, err]));
  }
}
