'use client';

export function TopBar({ title, subtitle }: { title: string; subtitle: string }) {
  function openPalette() {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { __birdieOpenPalette?: () => void };
    w.__birdieOpenPalette?.();
  }

  return (
    <header className="h-[72px] shrink-0 bg-bg border-b border-line flex items-center px-8 gap-3 sticky top-0 z-10">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-semibold text-lg text-fg tracking-tightest leading-tight">{title}</h1>
        <p className="text-xs text-fg2">{subtitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={openPalette}
          className="w-[280px] h-9 bg-surface border border-line rounded-lg flex items-center px-3 gap-2 hover:border-line-2 transition-colors group"
        >
          <span className="text-fg3 text-sm">⌕</span>
          <span className="text-xs text-fg3 group-hover:text-fg2">Suchen oder Befehl…</span>
          <span className="ml-auto px-1.5 py-0.5 rounded bg-surface-3 text-fg2 text-[10px] font-medium">⌘K</span>
        </button>
        <button className="w-9 h-9 bg-surface border border-line rounded-lg flex items-center justify-center text-fg2 hover:text-fg hover:border-line-2 transition-colors">
          ◔
        </button>
      </div>
    </header>
  );
}
