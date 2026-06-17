import { Card } from './ui';

export interface Feature {
  icon: string;
  title: string;
  desc: string;
  tags?: string[];
  soon?: boolean;
}

export interface OnboardingStep {
  step: number;
  title: string;
}

export function OnboardingView({
  headline,
  subtitle,
  features,
  steps,
  integrations,
}: {
  headline: string;
  subtitle: string;
  features: Feature[];
  steps?: OnboardingStep[];
  integrations?: string[];
}) {
  return (
    <div className="flex flex-col gap-6 max-w-[960px] mx-auto w-full py-4">
      <div className="text-center flex flex-col gap-2 mb-2">
        <h2 className="text-xl font-bold text-fg tracking-tightest">{headline}</h2>
        <p className="text-[13px] text-fg2 max-w-[520px] mx-auto leading-relaxed">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((f) => (
          <Card key={f.title} className="p-5 flex flex-col gap-3 relative">
            {f.soon && (
              <span className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-surface-3 text-fg3 text-[9px] font-semibold tracking-[0.16em]">
                SOON
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-lg">
              {f.icon}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-[13px] text-fg">{f.title}</h3>
              <p className="text-[11px] text-fg3 leading-[17px]">{f.desc}</p>
            </div>
            {f.tags && f.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-auto pt-1">
                {f.tags.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-surface-2 text-fg3 text-[9px] font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {steps && steps.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold text-[12px] text-fg mb-4 tracking-[0.04em]">GETTING STARTED</h3>
          <div className="flex flex-col gap-3">
            {steps.map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent text-bg text-[11px] font-bold flex items-center justify-center shrink-0">
                  {s.step}
                </div>
                <span className="text-[13px] text-fg2">{s.title}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {integrations && integrations.length > 0 && (
        <div className="text-center">
          <span className="text-[10px] text-fg4 tracking-[0.12em]">INTEGRATES WITH</span>
          <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
            {integrations.map((name) => (
              <span key={name} className="px-2.5 py-1 rounded-lg border border-line bg-surface text-[11px] text-fg3 font-medium">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
