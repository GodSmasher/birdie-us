import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, Pill } from '@/components/ui';
import { getDrive } from '@/app/lib/google-server';

export const dynamic = 'force-dynamic';

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-US') : '');

export default async function DateienPage({ searchParams }: { searchParams: { folder?: string; name?: string } }) {
  const drive = await getDrive(searchParams.folder);
  const inFolder = !!searchParams.folder;

  return (
    <>
      <Sidebar active="dateien" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Files & Knowledge"
          subtitle={inFolder ? (searchParams.name ?? 'Folder') : 'Google Drive · Knowledge base by area'}
        />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6 max-w-[1100px]">
          {!drive.configured && (
            <Card className="p-8 text-center text-sm text-fg3 max-w-[560px] mx-auto mt-8">
              Google Workspace not connected — once connected, your Drive structure will appear here.
            </Card>
          )}

          {drive.scopeMissing && (
            <Card className="p-6 flex flex-col gap-3 max-w-[640px]">
              <div className="w-10 h-10 rounded-xl bg-warning-bg flex items-center justify-center text-warning text-lg">!</div>
              <h2 className="font-semibold text-base text-fg tracking-tightest">Drive access not yet granted</h2>
              <p className="text-[13px] text-fg2 leading-[20px]">
                Gmail & Calendar are already running. For Drive, only the scope <code className="text-accent">drive.readonly</code> is missing:
              </p>
              <ol className="text-[13px] text-fg2 leading-[22px] list-decimal pl-5">
                <li>Google Cloud Console → Enable "Google Drive API"</li>
                <li>OAuth Consent → Add scope <code className="text-accent">.../auth/drive.readonly</code></li>
                <li>In the OAuth Playground, regenerate the refresh token with the Drive scope</li>
                <li>Send the new token → we'll update the env</li>
              </ol>
            </Card>
          )}

          {drive.error && (
            <Card className="p-5 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-error-bg flex items-center justify-center text-error font-bold">!</div>
              <span className="text-xs text-fg2">{drive.error}</span>
            </Card>
          )}

          {drive.configured && !drive.scopeMissing && !drive.error && (
            <>
              {inFolder && (
                <Link href="/dateien" className="text-[13px] text-accent font-medium w-fit">← All areas</Link>
              )}

              {drive.folders.length > 0 && (
                <section className="flex flex-col gap-3">
                  <h2 className="font-semibold text-sm text-fg tracking-tightest">{inFolder ? 'Subfolders' : 'Areas'}</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {drive.folders.map((f) => (
                      <Link
                        key={f.id}
                        href={`/dateien?folder=${f.id}&name=${encodeURIComponent(f.name)}`}
                        className="bg-surface border border-line rounded-xl p-4 flex items-center gap-3 hover:border-line-2 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-accent-bg flex items-center justify-center text-accent text-lg shrink-0">▤</div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-medium text-fg truncate">{f.name}</span>
                          <span className="text-[11px] text-fg3">Folder</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <Card className="overflow-hidden">
                <CardHeader title="Files" right={<Pill label="LIVE" tone="success" />} />
                {drive.files.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-fg3">No files in this folder</div>
                ) : (
                  drive.files.map((f, i) => (
                    <a
                      key={f.id}
                      href={f.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-4 px-5 h-12 hover:bg-surface-2/40 transition-colors ${i < drive.files.length - 1 ? 'border-b border-line' : ''}`}
                    >
                      <span className="w-7 h-7 rounded-md bg-surface-3 flex items-center justify-center text-fg2 text-xs shrink-0">▦</span>
                      <span className="text-[13px] font-medium text-fg truncate flex-1">{f.name}</span>
                      <span className="text-[11px] text-fg3 w-24">{f.type}</span>
                      <span className="text-[11px] text-fg3 w-20 text-right">{fmt(f.modified)}</span>
                      <span className="text-fg3 text-sm">↗</span>
                    </a>
                  ))
                )}
              </Card>
            </>
          )}
        </div>
      </main>
    </>
  );
}
