import { NextResponse } from 'next/server';
import { getWaermepumpeInfo, mailGasAbmeldungKunde, mailSchornsteinfeger } from '@/app/lib/waermepumpe';
import { getProjectData } from '@/app/lib/projektdaten';

export async function GET(req: Request) {
  const offerId = new URL(req.url).searchParams.get('offerId');
  if (!offerId) return NextResponse.json({ error: 'offerId required' }, { status: 400 });

  const [wp, project] = await Promise.all([
    getWaermepumpeInfo(offerId),
    getProjectData(offerId),
  ]);
  if (!wp) return NextResponse.json({ error: 'offer not found' }, { status: 404 });

  const ctx = {
    customerName: project?.customerName || '—',
    address: project?.address?.line || '—',
    city: project?.address?.city,
  };

  return NextResponse.json({
    ...wp,
    mails: wp.needsGasAbmeldung ? {
      kunde: mailGasAbmeldungKunde(ctx),
      schornsteinfeger: mailSchornsteinfeger(ctx),
    } : null,
  });
}
