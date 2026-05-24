import { type Connector, type ConnectorContext, type TestResult } from '../types.js';
import { googleConfig, googleAccessToken, hasGoogleAuth } from '../google.js';

// Google Calendar API v3. OAuth2 Bearer. Scope: calendar.readonly (or calendar).
// Docs: https://developers.google.com/calendar/api/v3/reference/events/list

interface GEvent {
  id: string;
  summary?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: { email?: string }[];
}

export interface CalendarEvent { id: string; title: string; start: string; end?: string; location?: string; attendees: number }

export const googleCalendar: Connector<CalendarEvent[]> = {
  manifest: {
    id: 'google-calendar',
    name: 'Google Calendar',
    vendor: 'Google',
    category: 'comms',
    regions: ['DE', 'AT', 'CH'],
    authType: 'oauth2',
    protocol: 'Calendar API v3',
    capabilities: ['read', 'write'],
    config: [
      ...googleConfig,
      { key: 'calendarId', label: 'Kalender-ID', required: false, default: 'primary' },
    ],
    docsUrl: 'https://developers.google.com/calendar/api/v3/reference',
    status: 'beta',
  },

  async testConnection(ctx: ConnectorContext): Promise<TestResult> {
    if (!hasGoogleAuth(ctx)) return { ok: false, message: 'Fehlende Konfiguration: Google OAuth' };
    const t0 = Date.now();
    try {
      const token = await googleAccessToken(ctx);
      const cal = encodeURIComponent(ctx.config.calendarId || 'primary');
      const res = await ctx.fetch(`https://www.googleapis.com/calendar/v3/calendars/${cal}/events?maxResults=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
      return { ok: true, message: 'Kalender erreichbar', latencyMs: Date.now() - t0 };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },

  async pull(ctx: ConnectorContext): Promise<CalendarEvent[]> {
    const token = await googleAccessToken(ctx);
    const cal = encodeURIComponent(ctx.config.calendarId || 'primary');
    const params = new URLSearchParams({
      maxResults: '20',
      orderBy: 'startTime',
      singleEvents: 'true',
      timeMin: new Date().toISOString(),
    });
    const res = await ctx.fetch(`https://www.googleapis.com/calendar/v3/calendars/${cal}/events?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Google Calendar HTTP ${res.status}`);
    const json = (await res.json()) as { items?: GEvent[] };
    return (json.items ?? []).map((e) => ({
      id: e.id,
      title: e.summary || 'Termin',
      start: e.start?.dateTime || e.start?.date || '',
      end: e.end?.dateTime || e.end?.date,
      location: e.location,
      attendees: e.attendees?.length ?? 0,
    }));
  },
};
