import type { ConnectorContext, ConfigField } from './types.js';

// Shared Google OAuth2 helper. Accepts either a ready accessToken, or a
// refreshToken + clientId + clientSecret to mint one (production path —
// Google access tokens expire after ~1h).

export const googleConfig: ConfigField[] = [
  { key: 'accessToken', label: 'Access Token', required: false, secret: true, help: 'optional — frischer OAuth2-Token' },
  { key: 'refreshToken', label: 'Refresh Token', required: false, secret: true, help: 'für automatische Erneuerung' },
  { key: 'clientId', label: 'OAuth Client ID', required: false, help: 'Google Cloud Console' },
  { key: 'clientSecret', label: 'OAuth Client Secret', required: false, secret: true },
];

export async function googleAccessToken(ctx: ConnectorContext): Promise<string> {
  if (ctx.config.accessToken) return ctx.config.accessToken;

  const { refreshToken, clientId, clientSecret } = ctx.config;
  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Google: accessToken ODER (refreshToken + clientId + clientSecret) nötig');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  const res = await ctx.fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Google OAuth ${res.status}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('Google OAuth: kein access_token');
  return json.access_token;
}

export function hasGoogleAuth(ctx: ConnectorContext): boolean {
  return !!ctx.config.accessToken || !!(ctx.config.refreshToken && ctx.config.clientId && ctx.config.clientSecret);
}
