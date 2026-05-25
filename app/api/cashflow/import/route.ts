import { NextResponse } from 'next/server';
import { importReonicOffers } from '@/app/lib/cashflow-server';

export async function POST() {
  const result = await importReonicOffers();
  return NextResponse.json(result);
}
