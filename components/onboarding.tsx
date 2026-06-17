'use client';

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

function BirdieMascot({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-4 animate-[fadeSlideUp_0.5s_ease-out_both]">
      <div className="shrink-0 w-14 h-14 rounded-2xl bg-accent/10 border-2 border-accent/20 flex items-center justify-center animate-[float_3s_ease-in-out_infinite]">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="14" r="10" fill="var(--accent)" opacity="0.9" />
          <circle cx="13" cy="12" r="1.5" fill="var(--bg)" />
          <circle cx="19" cy="12" r="1.5" fill="var(--bg)" />
          <path d="M12 16 C14 18 18 18 20 16" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 10 L26 6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 12 L28 10" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="10" cy="20" rx="4" ry="2" fill="var(--accent)" opacity="0.7" />
          <ellipse cx="22" cy="20" rx="4" ry="2" fill="var(--accent)" opacity="0.7" />
        </svg>
      </div>
      <div className="relative bg-surface-2 border border-line rounded-2xl px-5 py-4 max-w-[520px] animate-[fadeSlideUp_0.6s_ease-out_0.1s_both]">
        <div className="absolute -left-2 top-5 w-3 h-3 bg-surface-2 border-l border-b border-line rotate-45" />
        <p className="text-[13px] text-fg2 leading-relaxed relative z-10">{message}</p>
      </div>
    </div>
  );
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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .onb-card { animation: scaleIn 0.4s ease-out both; }
        .onb-card:nth-child(1) { animation-delay: 0.15s; }
        .onb-card:nth-child(2) { animation-delay: 0.25s; }
        .onb-card:nth-child(3) { animation-delay: 0.35s; }
        .onb-card:nth-child(4) { animation-delay: 0.45s; }
        .onb-card:nth-child(5) { animation-delay: 0.55s; }
        .onb-card:nth-child(6) { animation-delay: 0.65s; }
        .onb-step { animation: fadeSlideUp 0.4s ease-out both; }
        .onb-step:nth-child(1) { animation-delay: 0.5s; }
        .onb-step:nth-child(2) { animation-delay: 0.65s; }
        .onb-step:nth-child(3) { animation-delay: 0.8s; }
        .integration-badge {
          animation: scaleIn 0.3s ease-out both;
        }
        .integration-badge:nth-child(1) { animation-delay: 0.7s; }
        .integration-badge:nth-child(2) { animation-delay: 0.8s; }
        .integration-badge:nth-child(3) { animation-delay: 0.9s; }
        .integration-badge:nth-child(4) { animation-delay: 1.0s; }
        .integration-badge:nth-child(5) { animation-delay: 1.1s; }
        .integration-badge:nth-child(6) { animation-delay: 1.2s; }
        .onb-card:hover {
          transform: translateY(-2px) !important;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          border-color: var(--accent) !important;
          box-shadow: 0 4px 20px rgba(250, 204, 21, 0.08);
        }
      `}} />

      <div className="flex flex-col gap-7 max-w-[960px] mx-auto w-full py-4">
        {/* Birdie mascot with speech bubble */}
        <BirdieMascot message={subtitle} />

        {/* Headline */}
        <div className="animate-[fadeSlideUp_0.5s_ease-out_0.2s_both]">
          <h2 className="text-xl font-bold text-fg tracking-tightest">{headline}</h2>
          <div className="mt-2 h-0.5 w-12 rounded-full bg-accent" />
        </div>

        {/* Feature cards with staggered animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => (
            <Card key={f.title} className="onb-card p-5 flex flex-col gap-3 relative cursor-default">
              {f.soon && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] font-semibold tracking-[0.16em]">
                  COMING SOON
                </span>
              )}
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-xl">
                {f.icon}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-[13px] text-fg">{f.title}</h3>
                <p className="text-[11px] text-fg3 leading-[17px]">{f.desc}</p>
              </div>
              {f.tags && f.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                  {f.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-surface-2 text-fg3 text-[9px] font-medium border border-line">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Getting started steps with animated line */}
        {steps && steps.length > 0 && (
          <Card className="p-6 animate-[fadeSlideUp_0.5s_ease-out_0.4s_both]">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
                <span className="text-accent text-xs">▸</span>
              </div>
              <h3 className="font-semibold text-[12px] text-fg tracking-[0.04em]">GET STARTED IN 3 STEPS</h3>
            </div>
            <div className="flex flex-col gap-1">
              {steps.map((s, i) => (
                <div key={s.step} className="onb-step flex items-center gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-accent text-bg text-[12px] font-bold flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {s.step}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px h-6 bg-line" />
                    )}
                  </div>
                  <span className="text-[13px] text-fg2 pb-6 last:pb-0">{s.title}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Integration badges */}
        {integrations && integrations.length > 0 && (
          <div className="flex flex-col items-center gap-3 animate-[fadeSlideUp_0.5s_ease-out_0.6s_both]">
            <span className="text-[10px] text-fg4 tracking-[0.16em] font-medium">WORKS WITH YOUR EXISTING TOOLS</span>
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              {integrations.map((name) => (
                <span key={name} className="integration-badge px-3 py-1.5 rounded-xl border border-line bg-surface hover:border-accent/30 hover:bg-accent/5 text-[11px] text-fg3 font-medium transition-colors cursor-default">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
