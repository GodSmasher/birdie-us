export function isDemoMode(): boolean {
  return process.env.DEFAULT_TENANT_SLUG === 'demo';
}
