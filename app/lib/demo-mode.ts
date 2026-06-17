import { cookies } from 'next/headers';

export function isDemoMode(): boolean {
  if (process.env.DEFAULT_TENANT_SLUG === 'demo') return true;
  try {
    const store = cookies();
    return store.get('birdie_demo')?.value === '1';
  } catch {
    return false;
  }
}
