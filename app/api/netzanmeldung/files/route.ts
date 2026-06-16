// GET /api/netzanmeldung/files?offerId=xxx                        — list project files
// GET /api/netzanmeldung/files?offerId=xxx&enrich=1               — list + extract fields
// GET /api/netzanmeldung/files?offerId=xxx&fileId=yyy&download=1  — download single file

import { NextResponse, type NextRequest } from 'next/server';
import { getProjectFiles, enrichFromDocuments } from '@/app/lib/reonic-files';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const offerId = req.nextUrl.searchParams.get('offerId');
  if (!offerId) return NextResponse.json({ error: 'offerId required' }, { status: 400 });

  const enrich = req.nextUrl.searchParams.get('enrich') === '1';
  const fileId = req.nextUrl.searchParams.get('fileId');
  const download = req.nextUrl.searchParams.get('download') === '1';

  // Download a specific file — redirect to Reonic's signed S3 URL
  if (fileId && download) {
    const files = await getProjectFiles(offerId);
    const file = files.find(f => f.id === fileId);
    if (!file?.url) return NextResponse.json({ error: 'Datei nicht gefunden' }, { status: 404 });
    return NextResponse.redirect(file.url);
  }

  if (enrich) {
    const result = await enrichFromDocuments(offerId);
    return NextResponse.json(result);
  }

  const files = await getProjectFiles(offerId);
  return NextResponse.json({ files, count: files.length });
}
