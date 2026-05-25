'use server';

export async function signOutAction() {
  const { cookies } = await import('next/headers');
  (await cookies()).delete('birdie_session');
}
