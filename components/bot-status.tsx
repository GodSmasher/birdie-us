import { type BotError } from '@/app/lib/netzanmeldung';
import { Pill } from '@/components/ui';

const fmt = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
};

const relTime = (iso: string) => {
  const diff = Date.parse(iso) - Date.now();
  if (diff <= 0) return 'jetzt';
  const min = Math.round(diff / 60_000);
  if (min < 60) return `in ${min} Min.`;
  const h = Math.round(min / 60);
  if (h < 24) return `in ${h} Std.`;
  return `in ${Math.round(h / 24)} Tagen`;
};

export function BotStatus({
  docStatus,
  botErrors,
  botRetries,
  botSkipUntil,
}: {
  docStatus?: string;
  botErrors?: BotError[];
  botRetries?: number;
  botSkipUntil?: string;
}) {
  const lastError = botErrors?.length ? botErrors[botErrors.length - 1] : null;
  const isBackoff = !!botSkipUntil && Date.parse(botSkipUntil) > Date.now();
  const canRun = docStatus === 'unterschrieben' || docStatus === 'offen';
  const isSubmitted = docStatus === 'eingereicht';

  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-success text-sm">✓</span>
          <h3 className="font-semibold text-[13px] text-fg">Bot-Status</h3>
          <Pill label="EINGEREICHT" tone="success" dot={false} />
        </div>
        <p className="text-[11px] text-fg3">Beim Netzbetreiber-Portal eingereicht.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">🤖</span>
        <h3 className="font-semibold text-[13px] text-fg">Bot-Status</h3>
        {isBackoff && <Pill label="WARTET" tone="warning" dot={false} />}
        {!isBackoff && canRun && <Pill label="BEREIT" tone="success" dot={false} />}
        {!canRun && !isSubmitted && <Pill label="NICHT AKTIV" tone="info" dot={false} />}
      </div>

      {!canRun && !isSubmitted && (
        <p className="text-[11px] text-fg3">
          Bot wartet auf Status &quot;unterschrieben&quot; bevor er einreicht.
        </p>
      )}

      {canRun && !isBackoff && !lastError && (
        <p className="text-[11px] text-fg3">
          Bot wird beim nächsten Durchlauf versuchen einzureichen.
        </p>
      )}

      {isBackoff && botSkipUntil && (
        <div className="bg-warning-bg/50 rounded-lg p-3 flex flex-col gap-1">
          <p className="text-[11px] text-warning font-medium">
            Nächster Versuch: {relTime(botSkipUntil)} ({fmt(botSkipUntil)})
          </p>
          <p className="text-[10px] text-fg3">
            {botRetries} Versuch{botRetries !== 1 ? 'e' : ''} fehlgeschlagen — exponentielles Backoff aktiv.
          </p>
        </div>
      )}

      {lastError && (
        <div className="bg-error/5 border border-error/20 rounded-lg p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-error">Letzter Fehler</span>
            <span className="text-[10px] text-fg4">{fmt(lastError.at)}</span>
          </div>
          <p className="text-[11px] text-fg2">
            <span className="text-fg3">Schritt:</span> {lastError.step}
          </p>
          <p className="text-[11px] text-fg2 leading-tight">
            <span className="text-fg3">Fehler:</span> {lastError.error}
          </p>
          {lastError.retries > 1 && (
            <p className="text-[10px] text-fg4">Versuch #{lastError.retries}</p>
          )}
        </div>
      )}

      {botErrors && botErrors.length > 1 && (
        <details className="text-[11px]">
          <summary className="text-fg3 cursor-pointer hover:text-fg2">
            {botErrors.length - 1} frühere Fehler anzeigen
          </summary>
          <div className="flex flex-col gap-2 mt-2">
            {botErrors.slice(0, -1).reverse().map((e, i) => (
              <div key={`${e.at}-${i}`} className="flex flex-col gap-0.5 border-l-2 border-line pl-2">
                <span className="text-fg3">{e.step}: {e.error}</span>
                <span className="text-[10px] text-fg4">{fmt(e.at)} · Versuch #{e.retries}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
