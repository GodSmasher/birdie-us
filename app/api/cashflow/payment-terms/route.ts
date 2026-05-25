import { NextRequest, NextResponse } from 'next/server';
import { getPaymentTermsForInvoice, getPaymentTermsForCustomer } from '@/app/lib/sevdesk-server';

export async function GET(req: NextRequest) {
  const invoiceId = req.nextUrl.searchParams.get('invoiceId');
  const customer = req.nextUrl.searchParams.get('customer');

  if (invoiceId) {
    const result = await getPaymentTermsForInvoice(invoiceId);
    return NextResponse.json(result ?? { found: false, error: 'PDF nicht verfügbar' });
  }

  if (customer) {
    const result = await getPaymentTermsForCustomer(customer);
    return NextResponse.json(result ?? { found: false, error: 'Keine Dokumente gefunden' });
  }

  return NextResponse.json({ error: 'invoiceId oder customer Parameter fehlt' }, { status: 400 });
}
