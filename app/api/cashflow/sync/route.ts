import { NextResponse } from 'next/server';
import { syncSevdeskInvoices, cleanupSyncEntries } from '@/app/lib/cashflow-server';

export async function POST() {
  const result = await syncSevdeskInvoices();
  return NextResponse.json(result);
}

export async function DELETE() {
  const result = await cleanupSyncEntries();
  return NextResponse.json(result);
}
