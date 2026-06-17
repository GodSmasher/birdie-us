import { cookies } from 'next/headers';

export function isDemoMode(): boolean {
  try {
    const store = cookies();
    return store.get('birdie_demo')?.value === '1';
  } catch {
    return false;
  }
}
