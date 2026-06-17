'use client';

import { ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import { Card, Pill } from './ui';

// ============ DUOLINGO-STYLE CSS ============
export function GuideStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes springIn {
        0% { opacity: 0; transform: scale(0.3) translateY(40px); }
        50% { opacity: 1; transform: scale(1.08) translateY(-8px); }
        70% { transform: scale(0.95) translateY(2px); }
        85% { transform: scale(1.02) translateY(-1px); }
        100% { transform: scale(1) translateY(0); }
      }
      @keyframes springPop {
        0% { opacity: 0; transform: scale(0.5); }
        60% { opacity: 1; transform: scale(1.15); }
        80% { transform: scale(0.92); }
        100% { transform: scale(1); }
      }
      @keyframes slideUpBounce {
        0% { opacity: 0; transform: translateY(30px) scale(0.95); }
        60% { opacity: 1; transform: translateY(-6px) scale(1.01); }
        80% { transform: translateY(2px) scale(0.99); }
        100% { transform: translateY(0) scale(1); }
      }
      @keyframes slideOut {
        0% { opacity: 1; transform: translateX(0) scale(1); }
        100% { opacity: 0; transform: translateX(-40px) scale(0.95); }
      }
      @keyframes slideInRight {
        0% { opacity: 0; transform: translateX(60px) scale(0.95); }
        60% { opacity: 1; transform: translateX(-4px) scale(1.01); }
        80% { transform: translateX(2px) scale(0.99); }
        100% { transform: translateX(0) scale(1); }
      }
      @keyframes heroEntrance {
        0% { opacity: 0; transform: translateX(-60px) scale(0.6) rotate(-15deg); }
        40% { opacity: 1; transform: translateX(12px) scale(1.1) rotate(5deg); }
        60% { transform: translateX(-4px) scale(0.97) rotate(-2deg); }
        80% { transform: translateX(2px) scale(1.01) rotate(1deg); }
        100% { transform: translateX(0) scale(1) rotate(0deg); }
      }
      @keyframes birdieHop {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        15% { transform: translateY(-12px) rotate(-5deg); }
        30% { transform: translateY(-2px) rotate(2deg); }
        45% { transform: translateY(-8px) rotate(-3deg); }
        60% { transform: translateY(0) rotate(1deg); }
      }
      @keyframes birdieWave {
        0%, 100% { transform: rotate(0deg); }
        20% { transform: rotate(-20deg); }
        40% { transform: rotate(15deg); }
        60% { transform: rotate(-10deg); }
        80% { transform: rotate(5deg); }
      }
      @keyframes birdieWing {
        0%, 100% { transform: scaleX(1) scaleY(1); }
        30% { transform: scaleX(0.7) scaleY(1.1); }
        60% { transform: scaleX(1.15) scaleY(0.9); }
      }
      @keyframes birdieFloat {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-6px) rotate(-3deg); }
        75% { transform: translateY(-3px) rotate(3deg); }
      }
      @keyframes eyeBlink {
        0%, 42%, 44%, 100% { transform: scaleY(1); }
        43% { transform: scaleY(0.1); }
      }
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1) rotate(180deg); }
      }
      @keyframes shimmerWave {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes borderGlow {
        0%, 100% { border-color: rgba(250, 204, 21, 0.06); box-shadow: 0 0 0 0 rgba(250,204,21,0); }
        50% { border-color: rgba(250, 204, 21, 0.3); box-shadow: 0 0 20px 2px rgba(250,204,21,0.06); }
      }
      @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      @keyframes barGrow { from { width: 0; } }
      @keyframes pulseScale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-3deg); } 75% { transform: rotate(3deg); } }
      @keyframes progressFill { from { width: 0; } }
      @keyframes confettiBurst {
        0% { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(-80px) scale(0.5); }
      }
      .g-spring { animation: springIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      .g-spring-pop { animation: springPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      .g-slide { animation: slideUpBounce 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) both; }
      .g-slide-in { animation: slideInRight 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) both; }
      .g-hero { animation: heroEntrance 1s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      .g-hop { animation: birdieHop 3s ease-in-out infinite; }
      .g-wave { animation: birdieWave 2s ease-in-out infinite; }
      .g-float { animation: birdieFloat 4s ease-in-out infinite; }
      .g-wing { animation: birdieWing 1.5s ease-in-out infinite; }
      .g-blink { animation: eyeBlink 4s ease-in-out infinite; }
      .g-glow { animation: borderGlow 3s ease-in-out infinite; border: 1px solid rgba(250,204,21,0.06); border-radius: 12px; }
      .g-shimmer { background: linear-gradient(90deg, transparent 30%, rgba(250,204,21,0.04) 50%, transparent 70%); background-size: 200% 100%; animation: shimmerWave 3s linear infinite; }
      .g-pulse { animation: pulseScale 2s ease-in-out infinite; }
      .g-wiggle { animation: wiggle 2.5s ease-in-out infinite; }
      .g-bar { animation: barGrow 1.2s cubic-bezier(0.34, 1.2, 0.64, 1) both; }
      .g-ghost { opacity: 0.75; }
      .g-ghost:hover { opacity: 0.9; transition: opacity 0.2s; }
    `}} />
  );
}

// ============ ANIMATED COUNTER ============
function Counter({ end, duration = 1500, prefix = '', suffix = '' }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(ease * end));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString('en-US')}{suffix}</span>;
}

// ============ TYPEWRITER TEXT ============
function Typewriter({ text, delay = 0, speed = 25 }: { text: string; delay?: number; speed?: number }) {
  const [shown, setShown] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  useEffect(() => {
    if (!started || shown >= text.length) return;
    const t = setTimeout(() => setShown(s => s + 1), speed);
    return () => clearTimeout(t);
  }, [started, shown, text, speed]);
  return (
    <span>
      {text.slice(0, shown)}
      {shown < text.length && started && <span className="inline-block w-[2px] h-[13px] bg-accent ml-0.5 animate-pulse" />}
    </span>
  );
}

// ============ SPARKLES ============
function Sparkles({ count = 6 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="absolute w-2 h-2" style={{ left: `${15 + (i * 70 / count)}%`, top: `${10 + ((i * 37) % 60)}%`, animation: `sparkle 2s ease-in-out ${0.3 * i}s infinite` }}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 0L4.8 3.2L8 4L4.8 4.8L4 8L3.2 4.8L0 4L3.2 3.2Z" fill="var(--accent)" opacity="0.5" /></svg>
        </div>
      ))}
    </div>
  );
}

// ============ CONFETTI BURST (on last step) ============
function ConfettiBurst() {
  const colors = ['#FACC15', '#4ADE80', '#38BDF8', '#F97316', '#A78BFA', '#FB7185'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="absolute w-2 h-2 rounded-full" style={{
          backgroundColor: colors[i % colors.length],
          left: `${10 + (i * 4.2) % 80}%`,
          top: `${20 + (i * 7) % 40}%`,
          animation: `confettiBurst 1.5s ease-out ${i * 0.05}s both`,
        }} />
      ))}
    </div>
  );
}

// ============ BIRDIE CHARACTER ============
export function BirdieChar({ size = 40, pose = 'default' }: { size?: number; pose?: 'default' | 'wave' | 'point' | 'celebrate' }) {
  const waveArm = pose === 'wave' ? 'g-wave' : pose === 'celebrate' ? 'g-wave' : '';
  const bodyBounce = pose === 'celebrate' ? 'g-hop' : '';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={bodyBounce}>
      <ellipse cx="24" cy="44" rx="10" ry="2" fill="var(--accent)" opacity="0.1" />
      <ellipse cx="24" cy="26" rx="14" ry="13" fill="var(--accent)" />
      <ellipse cx="24" cy="30" rx="9" ry="7" fill="var(--accent)" opacity="0.5" />
      <g className="g-blink">
        <circle cx="18" cy="22" r="4.5" fill="white" />
        <circle cx="30" cy="22" r="4.5" fill="white" />
        <circle cx="19.2" cy="21.5" r="2.2" fill="#1a1a2e" />
        <circle cx="31.2" cy="21.5" r="2.2" fill="#1a1a2e" />
        <circle cx="20" cy="20.5" r="0.8" fill="white" />
        <circle cx="32" cy="20.5" r="0.8" fill="white" />
      </g>
      <path d="M21 27 L24 31 L27 27" fill="#F97316" strokeLinejoin="round" />
      <circle cx="13" cy="28" r="3" fill="#F97316" opacity="0.15" />
      <circle cx="35" cy="28" r="3" fill="#F97316" opacity="0.15" />
      <g className="g-wing" style={{ transformOrigin: '12px 26px' }}>
        <ellipse cx="9" cy="26" rx="6" ry="4.5" fill="var(--accent)" opacity="0.6" transform="rotate(-10 9 26)" />
      </g>
      <g className={waveArm} style={{ transformOrigin: '36px 22px' }}>
        {pose === 'wave' || pose === 'celebrate' ? (
          <ellipse cx="39" cy="18" rx="6" ry="4.5" fill="var(--accent)" opacity="0.6" transform="rotate(-45 39 18)" />
        ) : pose === 'point' ? (
          <ellipse cx="40" cy="24" rx="7" ry="3.5" fill="var(--accent)" opacity="0.6" transform="rotate(-5 40 24)" />
        ) : (
          <ellipse cx="39" cy="26" rx="6" ry="4.5" fill="var(--accent)" opacity="0.6" transform="rotate(10 39 26)" />
        )}
      </g>
      <path d="M20 14 L17 6" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 14 L31 6" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="17" cy="5" r="2.5" fill="var(--accent)" />
      <circle cx="31" cy="5" r="2.5" fill="var(--accent)" />
      {pose === 'celebrate' && (
        <>
          <circle cx="6" cy="12" r="1.5" fill="var(--accent)" opacity="0.6" style={{ animation: 'sparkle 1.5s ease-in-out 0s infinite' }} />
          <circle cx="42" cy="10" r="1.5" fill="var(--accent)" opacity="0.6" style={{ animation: 'sparkle 1.5s ease-in-out 0.3s infinite' }} />
        </>
      )}
      <ellipse cx="20" cy="39" rx="3.5" ry="1.5" fill="#F97316" opacity="0.4" />
      <ellipse cx="28" cy="39" rx="3.5" ry="1.5" fill="#F97316" opacity="0.4" />
    </svg>
  );
}

// ============ GHOST SECTION ============
function GhostSection({ children }: { children: ReactNode }) {
  return (
    <div className="g-slide g-glow g-ghost g-shimmer rounded-xl relative" style={{ animationDelay: '0.3s' }}>
      {children}
    </div>
  );
}

// ============ FUNNEL BAR ============
function FunnelBar({ label, value, max, color = 'bg-accent', delay = 0 }: { label: string; value: number; max: number; color?: string; delay?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-fg3 w-[100px] truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
        <div className={`g-bar h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%`, animationDelay: `${delay}s` }} />
      </div>
      <span className="text-[10px] font-medium text-fg w-5 text-right">{value}</span>
    </div>
  );
}

// ============ KANBAN COLUMN ============
function KanbanCol({ title, count, color, cards }: { title: string; count: number; color: string; cards: string[] }) {
  return (
    <div className="flex-1 min-w-[160px] flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-[11px] font-semibold text-fg">{title}</span>
        <span className="ml-auto text-[10px] text-fg3 bg-surface-2 px-1.5 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {cards.map((c, i) => (
          <div key={c} className="g-slide bg-surface border border-line rounded-lg px-3 py-2.5" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
            <p className="text-[11px] text-fg2 leading-tight whitespace-pre-line">{c}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ EMAIL ROW ============
function EmailRow({ from, subject, tag, tagTone }: { from: string; subject: string; tag: string; tagTone: 'success' | 'info' | 'warning' | 'accent' }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-line">
      <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-[10px] font-bold text-fg3">
        {from.split(' ').map(w => w[0]).join('').slice(0, 2)}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[11px] font-medium text-fg truncate">{from}</span>
        <span className="text-[10px] text-fg3 truncate">{subject}</span>
      </div>
      <Pill label={tag} tone={tagTone} dot={false} />
    </div>
  );
}

// ============ CONNECTOR CARD ============
function SampleConnector({ name, cat, connected }: { name: string; cat: string; connected: boolean }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2.5 hover:border-accent/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center font-semibold text-xs text-fg">{name.slice(0, 2)}</div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-[12px] text-fg truncate">{name}</span>
          <span className="text-[10px] text-fg3">{cat}</span>
        </div>
        <span className={`ml-auto w-2.5 h-2.5 rounded-full ${connected ? 'bg-success g-pulse' : 'bg-fg4'}`} />
      </div>
      <div className="border-t border-line pt-2 flex items-center">
        <Pill label={connected ? 'CONNECTED' : 'AVAILABLE'} tone={connected ? 'success' : 'neutral'} />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  DEMO VIEW — static preview for non-dashboard pages
// ════════════════════════════════════════════════════════

export function DemoView({ message, children, pose = 'point' }: { message: string; children: ReactNode; pose?: 'default' | 'wave' | 'point' | 'celebrate' }) {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-auto">
      <GuideStyles />
      <div className="px-6 py-5 flex flex-col gap-5 max-w-[960px] mx-auto w-full">
        <div className="g-slide-in flex items-center gap-4">
          <div className="g-float shrink-0 w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <BirdieChar size={40} pose={pose} />
          </div>
          <div className="relative bg-surface-2/80 backdrop-blur-sm border border-accent/12 rounded-2xl px-5 py-3.5 max-w-[580px] shadow-sm">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-surface-2/80 border-l border-b border-accent/12 rotate-45" />
            <p className="text-[13px] text-fg2 leading-relaxed relative z-10">{message}</p>
          </div>
        </div>
        <div className="g-slide" style={{ animationDelay: '0.2s' }}>
          {children}
        </div>
        <div className="g-slide flex justify-center mt-2" style={{ animationDelay: '0.4s' }}>
          <a href="/connectors" className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-bg font-bold text-[13px] shadow-md shadow-accent/15 hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <span>Connect your tools</span>
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  BOOK-A-CALL CTA — floating bottom-right birdie prompt
// ════════════════════════════════════════════════════════
const BOOK_URL = 'https://app.apollo.io/#/meet/sarah-vogel-zdy/birdie-intro';

export function DemoBookCTA() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(t);
  }, []);

  if (dismissed) return null;

  return (
    <>
      <GuideStyles />
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-accent shadow-lg shadow-accent/25 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        >
          <BirdieChar size={36} pose="wave" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 g-spring flex flex-col items-end gap-3">
          <div className="bg-surface border border-line rounded-2xl p-5 shadow-2xl w-[320px] flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="g-float shrink-0 w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <BirdieChar size={32} pose="wave" />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <span className="font-semibold text-[13px] text-fg">Like what you see?</span>
                <p className="text-[12px] text-fg2 leading-[17px]">
                  Book a quick intro call and we&apos;ll set up your account personally — connectors, bots, everything tailored to your workflow.
                </p>
              </div>
              <button onClick={() => { setOpen(false); setDismissed(true); }} className="text-fg3 hover:text-fg text-lg leading-none shrink-0 -mt-1">&times;</button>
            </div>
            <p className="text-[11px] text-fg3 leading-[16px]">
              Got specific needs? Custom automations, special integrations — we build them for you. No templates, no limits.
            </p>
            <a
              href={BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 h-[42px] rounded-xl bg-accent text-bg font-bold text-[13px] shadow-md shadow-accent/15 hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Book your intro call</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </a>
            <span className="text-[10px] text-fg3 text-center">15 min · no commitment · we handle setup</span>
          </div>
        </div>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════
//  GUIDE STEPPER — the core click-through engine
// ════════════════════════════════════════════════════════
type GuideStep = {
  message: string;
  pose?: 'default' | 'wave' | 'point' | 'celebrate';
  content: ReactNode;
};

function GuideStepper({ title, welcomeMessage, steps, ctaLabel, ctaHref = '/connectors' }: {
  title: string;
  welcomeMessage: string;
  steps: GuideStep[];
  ctaLabel: string;
  ctaHref?: string;
}) {
  const [step, setStep] = useState(-1); // -1 = welcome screen
  const [animKey, setAnimKey] = useState(0);
  const total = steps.length;
  const isWelcome = step === -1;
  const isLast = step === total - 1;
  const isDone = step >= total;

  const next = useCallback(() => {
    if (isDone) return;
    setStep(s => s + 1);
    setAnimKey(k => k + 1);
  }, [isDone]);

  const back = useCallback(() => {
    if (step <= -1) return;
    setStep(s => s - 1);
    setAnimKey(k => k + 1);
  }, [step]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, back]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <GuideStyles />

      {/* Progress bar */}
      {!isWelcome && !isDone && (
        <div className="shrink-0 px-6 pt-4 pb-1">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-all duration-500 ease-out" style={{ width: `${((step + 1) / total) * 100}%` }} />
            </div>
            <span className="text-[11px] text-fg3 font-medium shrink-0">{step + 1} / {total}</span>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-auto px-6 py-5">
        {isWelcome && (
          <div className="flex flex-col items-center justify-center h-full max-w-[600px] mx-auto gap-8 text-center">
            <div className="g-hero relative">
              <Sparkles count={8} />
              <div className="w-28 h-28 rounded-[32px] bg-accent/10 border-2 border-accent/20 flex items-center justify-center">
                <BirdieChar size={80} pose="wave" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="g-slide text-2xl font-bold text-fg tracking-tight">{title}</h1>
              <div className="g-slide relative bg-surface-2 border border-accent/15 rounded-2xl px-6 py-5 max-w-[520px]" style={{ animationDelay: '0.3s' }}>
                <p className="text-[14px] text-fg2 leading-relaxed">
                  <Typewriter text={welcomeMessage} delay={600} speed={16} />
                </p>
              </div>
            </div>
            <button
              onClick={next}
              className="g-spring-pop group flex items-center gap-3 px-10 py-4 rounded-2xl bg-accent text-bg font-bold text-[15px] shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.03] active:scale-[0.98] transition-all"
              style={{ animationDelay: '0.6s' }}
            >
              <span>Let&apos;s go!</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
            <p className="text-[11px] text-fg4">{total} things to show you &middot; Takes about 1 minute</p>
          </div>
        )}

        {isDone && (
          <div className="flex flex-col items-center justify-center h-full max-w-[500px] mx-auto gap-6 text-center relative">
            <ConfettiBurst />
            <div className="g-hero">
              <BirdieChar size={80} pose="celebrate" />
            </div>
            <h2 className="g-slide text-xl font-bold text-fg">That&apos;s the tour!</h2>
            <p className="g-slide text-[13px] text-fg2 leading-relaxed" style={{ animationDelay: '0.2s' }}>
              Every feature you just saw lights up automatically when you connect your tools. Ready?
            </p>
            <a
              href={ctaHref}
              className="g-spring-pop g-pulse group flex items-center gap-3 px-10 py-4 rounded-2xl bg-accent text-bg font-bold text-[15px] shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.03] transition-all"
              style={{ animationDelay: '0.4s' }}
            >
              <span>Connect {ctaLabel}</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </a>
            <button onClick={() => { setStep(-1); setAnimKey(k => k + 1); }} className="text-[12px] text-fg3 hover:text-accent transition-colors">
              &larr; Restart tour
            </button>
          </div>
        )}

        {!isWelcome && !isDone && (
          <div key={animKey} className="flex flex-col gap-5 max-w-[960px] mx-auto">
            {/* Birdie says */}
            <div className="g-slide-in flex items-center gap-4">
              <div className="g-float shrink-0 w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <BirdieChar size={40} pose={steps[step].pose || 'point'} />
              </div>
              <div className="relative bg-surface-2/80 backdrop-blur-sm border border-accent/12 rounded-2xl px-5 py-3.5 max-w-[580px] shadow-sm">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-surface-2/80 border-l border-b border-accent/12 rotate-45" />
                <p className="text-[13px] text-fg2 leading-relaxed relative z-10">
                  <Typewriter text={steps[step].message} delay={100} speed={14} key={animKey} />
                </p>
              </div>
            </div>

            {/* Step content */}
            <div className="g-slide" style={{ animationDelay: '0.2s' }}>
              <GhostSection>
                {steps[step].content}
              </GhostSection>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar with nav buttons */}
      {!isWelcome && !isDone && (
        <div className="shrink-0 px-6 py-4 border-t border-line flex items-center justify-between">
          <button
            onClick={back}
            disabled={step <= 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium text-fg3 hover:text-fg hover:bg-surface-2 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <span>&larr;</span>
            <span>Back</span>
          </button>

          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => { setStep(i); setAnimKey(k => k + 1); }}
                className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-accent w-6' : i < step ? 'bg-accent/40' : 'bg-surface-3'}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-bg font-bold text-[13px] shadow-md shadow-accent/15 hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>{isLast ? 'Finish' : 'Next'}</span>
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  PAGE GUIDES — each page defines its steps
// ════════════════════════════════════════════════════════

export function DashboardGuide() {
  return <GuideStepper
    title="Welcome to .birdie"
    welcomeMessage="Hey there! I'm birdie — the transparency layer for your solar business. Let me walk you through what this dashboard looks like once your tools are connected."
    ctaLabel="Aurora Solar"
    steps={[
      {
        message: "These are your live KPIs — pipeline value, closed-won revenue, close rate, and interconnection count. They update every hour from your CRM.",
        content: (
          <div className="grid grid-cols-4 gap-3 p-1">
            {[
              { label: 'PIPELINE', val: 125400, pre: '$', color: '' },
              { label: 'WON', val: 48200, pre: '$', color: 'text-success' },
              { label: 'CLOSE RATE', val: 32, suf: '%', color: 'text-success' },
              { label: 'INTERCONNECTION', val: 12, color: '' },
            ].map((k) => (
              <div key={k.label} className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-2">
                <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{k.label}</span>
                <div className={`font-semibold text-[28px] leading-none tracking-tightest ${k.color || 'text-fg'}`}>
                  <Counter end={k.val} prefix={k.pre || ''} suffix={k.suf || ''} duration={1500} />
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        message: "Smart insights flag what needs your attention — overdue proposals, upcoming inspections, and wins worth celebrating.",
        content: (
          <Card className="overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line flex items-center justify-between">
              <h3 className="font-semibold text-[12px] text-fg">Action Required</h3>
              <Pill label="3 OPEN" tone="warning" />
            </div>
            {[
              { icon: '📋', msg: '3 proposals waiting for customer signature (oldest: 6 days)', tone: 'text-warning' },
              { icon: '🔧', msg: 'Martinez — inspection scheduled for Friday 10am', tone: 'text-info' },
              { icon: '✅', msg: 'Chen residence — PTO approved, ready to energize', tone: 'text-success' },
            ].map((r, i) => (
              <div key={i} className={`g-slide flex items-start gap-2.5 px-4 py-2.5 ${i < 2 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.4 + i * 0.12}s` }}>
                <span className="text-sm g-wiggle" style={{ animationDelay: `${0.5 + i * 0.2}s` }}>{r.icon}</span>
                <p className={`text-[11px] leading-[16px] ${r.tone}`}>{r.msg}</p>
              </div>
            ))}
          </Card>
        ),
      },
      {
        message: "The sales funnel shows where deals get stuck. Lead sources tell you which channels are actually working.",
        content: (
          <Card className="p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-[12px] text-fg">Pipeline & Leads</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <FunnelBar label="New Lead" value={45} max={45} delay={0.4} />
                <FunnelBar label="Contacted" value={28} max={45} delay={0.5} />
                <FunnelBar label="Proposal Sent" value={15} max={45} delay={0.6} />
                <FunnelBar label="Negotiation" value={8} max={45} delay={0.7} />
                <FunnelBar label="Won" value={7} max={45} color="bg-success" delay={0.8} />
              </div>
              <div className="flex flex-col gap-1.5">
                <FunnelBar label="Google Ads" value={48} max={48} color="bg-success" delay={0.5} />
                <FunnelBar label="Referral" value={35} max={48} color="bg-success" delay={0.6} />
                <FunnelBar label="Door-to-Door" value={28} max={48} color="bg-success" delay={0.7} />
                <FunnelBar label="Website" value={24} max={48} color="bg-success" delay={0.8} />
                <FunnelBar label="EnergySage" value={21} max={48} color="bg-success" delay={0.9} />
              </div>
            </div>
          </Card>
        ),
      },
      {
        message: "Calendar and interconnection status — upcoming site surveys, installations, inspections, and where each project stands in the utility process.",
        content: (
          <Card className="overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line"><h3 className="font-semibold text-[12px] text-fg">Schedule & Interconnection</h3></div>
            <div className="px-4 py-3 border-b border-line flex gap-6">
              {[{ label: 'Open', n: 3, c: 'text-fg3' }, { label: 'Review', n: 4, c: 'text-warning' }, { label: 'Approved', n: 2, c: 'text-info' }, { label: 'PTO', n: 3, c: 'text-success' }].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`text-[20px] font-bold ${s.c}`}><Counter end={s.n} duration={800} /></div>
                  <div className="text-[9px] text-fg4">{s.label}</div>
                </div>
              ))}
            </div>
            {[
              { t: 'Site Survey — Johnson', d: 'Tomorrow 2pm', icon: '🏠' },
              { t: 'Installation — Williams', d: 'Thu 8am', icon: '🔧' },
              { t: 'Inspection — Chen', d: 'Fri 10am', icon: '✅' },
            ].map((e, i) => (
              <div key={i} className={`g-slide flex gap-3 px-4 py-2.5 ${i < 2 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                <div className="w-7 h-7 rounded-lg bg-info-bg flex items-center justify-center text-xs">{e.icon}</div>
                <div className="flex flex-col"><span className="text-[11px] font-medium text-fg">{e.t}</span><span className="text-[10px] text-fg3">{e.d}</span></div>
              </div>
            ))}
          </Card>
        ),
      },
      {
        message: "Your automation army — bots that sync your CRM, fill docs, chase invoices, and classify emails. They run 24/7 so you don't have to.",
        pose: 'celebrate',
        content: (
          <Card className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1"><h3 className="font-semibold text-[12px] text-fg">Bots & System</h3><Pill label="ALL ONLINE" tone="success" /></div>
            {[{ n: 'CRM Sync Bot', s: 'live' as const }, { n: 'Document Filler AI', s: 'live' as const }, { n: 'Dunning Bot', s: 'live' as const }, { n: 'Email Classifier', s: 'live' as const }, { n: 'Fleet Monitor', s: 'setup' as const }].map((b, i) => (
              <div key={b.n} className="g-slide flex items-center gap-2.5" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${b.s === 'live' ? 'bg-success g-pulse' : 'bg-warning'}`} />
                <span className="text-[12px] text-fg2 flex-1">{b.n}</span>
                <span className={`text-[9px] font-bold tracking-wider uppercase ${b.s === 'live' ? 'text-success' : 'text-warning'}`}>{b.s === 'live' ? 'LIVE' : 'SETUP'}</span>
              </div>
            ))}
          </Card>
        ),
      },
    ]}
  />;
}

export function SalesGuide() {
  return <GuideStepper title="Sales Pipeline" welcomeMessage="This is where your sales pipeline lives. Once connected, every deal, every rep, and every lead source shows up here — live from your CRM." ctaLabel="your CRM" steps={[
    { message: "Five KPIs that matter — pipeline value, closed-won, lost, close rate, and total leads. Updated every hour.", content: (
      <div className="grid grid-cols-5 gap-3 p-1">
        {[{ label: 'PIPELINE', val: 245000, pre: '$' }, { label: 'WON', val: 92400, pre: '$', color: 'text-success' }, { label: 'LOST', val: 18600, pre: '$', color: 'text-error' }, { label: 'CLOSE RATE', val: 38, suf: '%', color: 'text-success' }, { label: 'LEADS', val: 156 }].map(k => (
          <div key={k.label} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-1.5">
            <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{k.label}</span>
            <div className={`font-semibold text-[24px] leading-none tracking-tightest ${k.color || 'text-fg'}`}><Counter end={k.val} prefix={k.pre || ''} suffix={k.suf || ''} duration={1500} /></div>
          </div>
        ))}
      </div>
    )},
    { message: "Every deal in a sortable, searchable table — customer, system size, value, status, and assigned rep.", content: (
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between"><h3 className="font-semibold text-[13px] text-fg">Recent Offers</h3><span className="text-[10px] text-fg3">50 of 156</span></div>
        <div className="grid grid-cols-[1fr_80px_100px_120px_100px] bg-surface-2 h-8 items-center px-4 text-[9px] font-semibold text-fg3 tracking-[0.14em]"><span>CUSTOMER</span><span>SIZE</span><span>VALUE</span><span>STATUS</span><span>REP</span></div>
        {[['Martinez Residence','8.4 kW','$32,500','Proposal Sent','J. Miller'],['Johnson Commercial','45 kW','$128,000','Negotiation','S. Parker'],['Williams Home','6.2 kW','$24,800','New Lead','M. Chen'],['Chen Duplex','12.6 kW','$48,200','Won','J. Miller'],['Davis Property','9.8 kW','$38,400','Site Survey','S. Parker'],['Brown Residence','7.1 kW','$28,600','Proposal Sent','M. Chen']].map((row, i) => (
          <div key={i} className={`g-slide grid grid-cols-[1fr_80px_100px_120px_100px] h-[38px] items-center px-4 ${i < 5 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.3 + i * 0.06}s` }}>
            <span className="text-[11px] text-accent font-medium truncate">{row[0]}</span><span className="text-[10px] text-fg2">{row[1]}</span><span className="text-[11px] font-semibold text-fg">{row[2]}</span><span className="text-[10px] text-fg2">{row[3]}</span><span className="text-[10px] text-fg3">{row[4]}</span>
          </div>
        ))}
      </Card>
    )},
    { message: "Visual funnel — see exactly where deals get stuck and identify bottlenecks.", content: (
      <Card className="p-4 flex flex-col gap-2"><h3 className="font-semibold text-[12px] text-fg mb-1">Status Funnel</h3>
        <FunnelBar label="New Lead" value={45} max={45} delay={0.3} /><FunnelBar label="Site Survey" value={32} max={45} delay={0.4} /><FunnelBar label="Proposal" value={22} max={45} delay={0.5} /><FunnelBar label="Negotiation" value={12} max={45} delay={0.6} /><FunnelBar label="Won" value={14} max={45} color="bg-success" delay={0.7} /><FunnelBar label="Lost" value={4} max={45} color="bg-error" delay={0.8} />
      </Card>
    )},
    { message: "Leaderboard — see who's closing. Compare reps by revenue and close rate.", pose: 'celebrate', content: (
      <Card className="p-4 flex flex-col gap-2"><h3 className="font-semibold text-[12px] text-fg mb-1">Sales Reps</h3>
        {[{ name: 'John Miller', won: 6, val: '$42,800' },{ name: 'Sarah Parker', won: 5, val: '$38,200' },{ name: 'Mike Chen', won: 3, val: '$11,400' }].map((s, i) => (
          <div key={s.name} className="g-slide flex items-center justify-between text-[11px] py-0.5" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
            <span className="text-accent truncate flex-1">{s.name}</span><span className="text-fg3 mx-2">{s.won} won</span><span className="text-success font-semibold">{s.val}</span>
          </div>
        ))}
      </Card>
    )},
  ]} />;
}

export function InterconnectionGuide() {
  return <GuideStepper title="Interconnection Tracking" welcomeMessage="The interconnection nightmare? Over. I track every project from utility application through PTO. No more spreadsheets, no more portal-checking." ctaLabel="your CRM" steps={[
    { message: "Live KPIs — active projects, status breakdown, and average days to PTO.", content: (
      <div className="grid grid-cols-5 gap-3 p-1">
        {[{ label: 'ACTIVE', val: 12 },{ label: 'UNDER REVIEW', val: 4, color: 'text-warning' },{ label: 'APPROVED', val: 3, color: 'text-info' },{ label: 'PTO', val: 8, color: 'text-success' },{ label: 'AVG DAYS', val: 23 }].map(k => (
          <div key={k.label} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-1.5">
            <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{k.label}</span>
            <div className={`font-semibold text-[28px] leading-none tracking-tightest ${k.color || 'text-fg'}`}><Counter end={k.val} duration={1200} /></div>
          </div>
        ))}
      </div>
    )},
    { message: "Kanban board — drag projects between stages. Filter by utility, installer, or timeline.", content: (
      <div className="bg-surface border border-line rounded-xl p-4 overflow-x-auto">
        <div className="flex gap-3 min-w-[900px]">
          <KanbanCol title="Application" count={3} color="bg-fg3" cards={['Johnson 12.6kW\nOncor · 2 days','Williams 6.2kW\nAEP Texas · 1 day','Brown 9.8kW\nCenterPoint · 3 days']} />
          <KanbanCol title="Under Review" count={2} color="bg-warning" cards={['Davis 8.4kW\nOncor · 12 days','Garcia 15kW\nTNMP · 8 days']} />
          <KanbanCol title="Approved" count={2} color="bg-info" cards={['Martinez 8.4kW\nOncor · Approved','Lee 10.2kW\nAEP · Approved']} />
          <KanbanCol title="Inspection" count={1} color="bg-accent" cards={['Chen 12.6kW\nScheduled Fri']} />
          <KanbanCol title="PTO" count={3} color="bg-success" cards={['Thompson 7.1kW\nPTO 06/12','Wilson 9.4kW\nPTO 06/08','Moore 6.8kW\nPTO 06/05']} />
        </div>
      </div>
    )},
    { message: "The interconnection bot auto-fills utility applications, monitors portals, and tracks status changes. Zero copy-pasting.", pose: 'celebrate', content: (
      <Card className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-xl g-wiggle">🤖</div>
        <div className="flex flex-col gap-0.5 flex-1"><span className="text-[13px] font-semibold text-fg">Interconnection Bot</span><span className="text-[11px] text-fg2">Auto-fills applications, monitors utility portals, tracks status changes</span></div>
        <Pill label="WILL ACTIVATE" tone="accent" />
      </Card>
    )},
  ]} />;
}

export function FleetGuide() {
  return <GuideStepper title="Fleet Monitoring" welcomeMessage="Every system you've installed, in one dashboard. I pull live production data from your inverter clouds — if something underperforms, you'll know before the customer calls." ctaLabel="SolarEdge or Enphase" steps={[
    { message: "Fleet-wide KPIs — total systems, installed capacity, uptime, and active alerts.", content: (
      <div className="grid grid-cols-4 gap-3 p-1">
        {[{ label: 'SYSTEMS', val: 47 },{ label: 'CAPACITY', val: 423, suf: ' kW' },{ label: 'UPTIME', val: 99, suf: '.2%', color: 'text-success' },{ label: 'ALERTS', val: 2, color: 'text-warning' }].map(k => (
          <div key={k.label} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-1.5">
            <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{k.label}</span>
            <div className={`font-semibold text-[28px] leading-none tracking-tightest ${k.color || 'text-fg'}`}><Counter end={k.val} suffix={k.suf || ''} duration={1200} /></div>
          </div>
        ))}
      </div>
    )},
    { message: "Each system card shows live production, daily yield, and status. Click any card for performance history.", content: (
      <div className="grid grid-cols-3 gap-3">
        {[{ name: 'Martinez Residence', kw: '8.4 kW', prod: '6.2 kW now', status: 'Online', tone: 'success' as const },{ name: 'Johnson Commercial', kw: '45 kW', prod: '38.1 kW now', status: 'Online', tone: 'success' as const },{ name: 'Chen Duplex', kw: '12.6 kW', prod: '0 kW', status: 'Alert', tone: 'warning' as const },{ name: 'Williams Home', kw: '6.2 kW', prod: '5.1 kW now', status: 'Online', tone: 'success' as const },{ name: 'Davis Property', kw: '9.8 kW', prod: '7.4 kW now', status: 'Online', tone: 'success' as const },{ name: 'Brown Residence', kw: '7.1 kW', prod: '5.8 kW now', status: 'Online', tone: 'success' as const }].map((s, i) => (
          <Card key={s.name} className="g-slide p-4 flex flex-col gap-2" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
            <div className="flex items-center justify-between"><span className="text-[12px] font-semibold text-fg truncate">{s.name}</span><Pill label={s.status.toUpperCase()} tone={s.tone} /></div>
            <div><div className="text-[18px] font-bold text-fg">{s.prod}</div><span className="text-[10px] text-fg3">{s.kw} installed</span></div>
          </Card>
        ))}
      </div>
    )},
    { message: "Performance alerts fire automatically when a system drops below expected yield.", pose: 'celebrate', content: (
      <Card className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-warning-bg flex items-center justify-center text-xl g-wiggle">⚠️</div>
        <div className="flex flex-col gap-0.5 flex-1"><span className="text-[13px] font-semibold text-fg">Chen Duplex — Production Alert</span><span className="text-[11px] text-fg2">System producing 0 kW. Expected: 9.2 kW. Possible inverter issue.</span></div>
      </Card>
    )},
  ]} />;
}

export function InboxGuide() {
  return <GuideStepper title="Smart Inbox" welcomeMessage="Remember that approval email from the utility that got buried in your inbox? Never again. I scan, categorize, and match every email to the right project." ctaLabel="Google Workspace" steps={[
    { message: "Emails auto-categorized — utility approvals, customer replies, vendor shipments, internal comms. Each matched to the right project.", content: (
      <Card className="overflow-hidden">
        <div className="px-4 py-2.5 border-b border-line flex items-center gap-3"><h3 className="font-semibold text-[12px] text-fg">Inbox</h3><Pill label="12 NEW" tone="accent" /></div>
        <EmailRow from="Oncor Electric" subject="Interconnection Application Approved — Martinez #IC-2024-1847" tag="UTILITY" tagTone="success" />
        <EmailRow from="Sarah Martinez" subject="Re: Solar installation timeline question" tag="CUSTOMER" tagTone="info" />
        <EmailRow from="CED Greentech" subject="Order #4821 shipped — tracking inside" tag="VENDOR" tagTone="warning" />
        <EmailRow from="Duke Energy" subject="Inspection scheduled — Johnson property 06/20" tag="UTILITY" tagTone="success" />
        <EmailRow from="Mike Chen" subject="Updated proposal for the Williams project" tag="INTERNAL" tagTone="accent" />
      </Card>
    )},
    { message: "Attachments auto-filed to the right project folder. Full-text search across everything.", pose: 'celebrate', content: (
      <Card className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-xl g-wiggle">📎</div>
        <div className="flex flex-col gap-0.5 flex-1"><span className="text-[13px] font-semibold text-fg">3 attachments auto-filed today</span><span className="text-[11px] text-fg2">Interconnection approval (Martinez) · Shipping manifest (CED) · Inspection notice (Johnson)</span></div>
      </Card>
    )},
  ]} />;
}

export function TeamGuide() {
  return <GuideStepper title="Team Management" welcomeMessage="Your team at a glance. Invite members, assign roles, control who sees what. Sales reps see their pipeline, installers see the fleet, admins see everything." ctaLabel="your team" ctaHref="/team" steps={[
    { message: "Team member cards — role, last active, and team assignment. Invite new members by email.", content: (
      <div className="grid grid-cols-3 gap-3">
        {[{ name: 'Sarah Vogel', role: 'Owner', team: 'Admin', active: 'Online' },{ name: 'John Miller', role: 'Sales Rep', team: 'Sales West', active: '2h ago' },{ name: 'Sarah Parker', role: 'Sales Rep', team: 'Sales East', active: '4h ago' },{ name: 'Mike Chen', role: 'Project Mgr', team: 'Operations', active: '1h ago' },{ name: 'Lisa Torres', role: 'Installer', team: 'Crew A', active: 'Yesterday' }].map((u, i) => (
          <Card key={u.name} className="g-slide p-4 flex items-center gap-3" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">{u.name.split(' ').map(w => w[0]).join('')}</div>
            <div className="flex flex-col min-w-0"><span className="text-[12px] font-semibold text-fg truncate">{u.name}</span><span className="text-[10px] text-fg3">{u.role} · {u.team}</span><span className="text-[9px] text-fg4">{u.active}</span></div>
          </Card>
        ))}
        <Card className="g-slide p-4 flex items-center justify-center border-dashed border-accent/20" style={{ animationDelay: '0.7s' }}><span className="text-accent text-[13px] font-medium g-pulse">+ Invite Member</span></Card>
      </div>
    )},
    { message: "Role-based access control — each role sees only what they need.", pose: 'celebrate', content: (
      <Card className="p-4"><h3 className="font-semibold text-[12px] text-fg mb-3">Permissions</h3>
        <div className="grid grid-cols-4 gap-2 text-[10px]">
          <span className="text-fg3 font-semibold">ROLE</span><span className="text-fg3 font-semibold">SALES</span><span className="text-fg3 font-semibold">FLEET</span><span className="text-fg3 font-semibold">FINANCE</span>
          <span className="text-fg2">Owner</span><span className="text-success">Full</span><span className="text-success">Full</span><span className="text-success">Full</span>
          <span className="text-fg2">Sales Rep</span><span className="text-success">Own deals</span><span className="text-fg4">—</span><span className="text-fg4">—</span>
          <span className="text-fg2">Installer</span><span className="text-fg4">—</span><span className="text-success">Assigned</span><span className="text-fg4">—</span>
        </div>
      </Card>
    )},
  ]} />;
}

export function CatalogGuide() {
  return <GuideStepper title="Product Catalog" welcomeMessage="Your entire product catalog — modules, inverters, batteries — with pricing and spec sheets. Import once, use everywhere." ctaLabel="your catalog" ctaHref="/katalog" steps={[
    { message: "Searchable component database with pricing. Used in proposals, BOMs, and margin calculations.", pose: 'celebrate', content: (
      <div className="grid grid-cols-3 gap-3">
        {[{ name: 'REC Alpha Pure-R 430W', cat: 'Module', price: '$185' },{ name: 'SolarEdge SE10000H', cat: 'Inverter', price: '$1,420' },{ name: 'Tesla Powerwall 3', cat: 'Battery', price: '$8,500' },{ name: 'Enphase IQ8+', cat: 'Microinverter', price: '$195' },{ name: 'IronRidge XR100', cat: 'Racking', price: '$45' },{ name: 'Span Smart Panel', cat: 'Electrical', price: '$4,200' }].map((p, i) => (
          <Card key={p.name} className="g-slide p-4 flex flex-col gap-2" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
            <div className="w-full h-20 rounded-lg bg-surface-2 flex items-center justify-center text-2xl">☀️</div>
            <span className="text-[12px] font-semibold text-fg truncate">{p.name}</span>
            <div className="flex items-center justify-between"><span className="text-[10px] text-fg3">{p.cat}</span><span className="text-[13px] font-bold text-accent">{p.price}</span></div>
          </Card>
        ))}
      </div>
    )},
  ]} />;
}

export function CalendarGuide() {
  return <GuideStepper title="Calendar" welcomeMessage="Site surveys, installations, inspections — all synced from your calendar. I'll remind you about deadlines so nothing slips." ctaLabel="Google Calendar" steps={[
    { message: "All events synced and color-coded. Utility deadlines and AHJ inspections are highlighted.", pose: 'celebrate', content: (
      <Card className="overflow-hidden">
        <div className="px-4 py-2.5 border-b border-line flex items-center justify-between"><h3 className="font-semibold text-[12px] text-fg">This Week</h3><Pill label="6 EVENTS" tone="info" /></div>
        {[{ day: 'Mon', t: 'Site Survey — Anderson Property', time: '9:00 AM', icon: '🏠', c: 'bg-info-bg' },{ day: 'Tue', t: 'Installation — Williams 6.2kW', time: '8:00 AM', icon: '🔧', c: 'bg-accent-bg' },{ day: 'Wed', t: 'Team Meeting — Pipeline Review', time: '2:00 PM', icon: '👥', c: 'bg-surface-2' },{ day: 'Thu', t: 'Installation — Davis 9.8kW', time: '8:00 AM', icon: '🔧', c: 'bg-accent-bg' },{ day: 'Fri', t: 'AHJ Inspection — Chen Duplex', time: '10:00 AM', icon: '✅', c: 'bg-success-bg' },{ day: 'Fri', t: 'Utility Deadline — Martinez PTO docs', time: '5:00 PM', icon: '⚠️', c: 'bg-warning-bg' }].map((e, i) => (
          <div key={i} className={`g-slide flex items-center gap-3 px-4 py-3 ${i < 5 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
            <span className="text-[10px] font-bold text-fg3 w-8">{e.day}</span>
            <div className={`w-7 h-7 rounded-lg ${e.c} flex items-center justify-center text-xs`}>{e.icon}</div>
            <div className="flex flex-col flex-1 min-w-0"><span className="text-[11px] font-medium text-fg truncate">{e.t}</span><span className="text-[10px] text-fg3">{e.time}</span></div>
          </div>
        ))}
      </Card>
    )},
  ]} />;
}

export function FilesGuide() {
  return <GuideStepper title="Files & Documents" welcomeMessage="All your documents in one place — proposals, permits, datasheets, contracts. Organized by project and synced with your cloud drive." ctaLabel="Google Drive" steps={[
    { message: "Project folders auto-created for each deal. Documents, photos, permits — everything in one place.", pose: 'celebrate', content: (
      <div className="grid grid-cols-4 gap-3">
        {[{ name: 'Martinez Residence', files: 8, icon: '📁' },{ name: 'Johnson Commercial', files: 12, icon: '📁' },{ name: 'Williams Home', files: 5, icon: '📁' },{ name: 'Chen Duplex', files: 15, icon: '📁' },{ name: 'Templates', files: 6, icon: '📋' },{ name: 'Spec Sheets', files: 24, icon: '📄' },{ name: 'Contracts', files: 9, icon: '📝' }].map((f, i) => (
          <Card key={f.name} className="g-slide p-4 flex items-center gap-3" style={{ animationDelay: `${0.3 + i * 0.06}s` }}>
            <span className="text-xl">{f.icon}</span>
            <div className="flex flex-col min-w-0"><span className="text-[12px] font-medium text-fg truncate">{f.name}</span><span className="text-[10px] text-fg3">{f.files} files</span></div>
          </Card>
        ))}
        <Card className="g-slide p-4 flex items-center justify-center border-dashed border-accent/20" style={{ animationDelay: '0.8s' }}><span className="text-accent text-[12px] font-medium g-pulse">+ New Folder</span></Card>
      </div>
    )},
  ]} />;
}

export function FinanceGuide() {
  return <GuideStepper title="Finance & Dunning" welcomeMessage="I automate your invoicing and collections. No more chasing overdue payments — the dunning bot handles escalation for you." ctaLabel="QuickBooks" steps={[
    { message: "Live invoice metrics — open, overdue, collected, and outstanding count.", content: (
      <div className="grid grid-cols-4 gap-3 p-1">
        {[{ label: 'OPEN', val: 84200, pre: '$' },{ label: 'OVERDUE', val: 12400, pre: '$', color: 'text-error' },{ label: 'COLLECTED', val: 156800, pre: '$', color: 'text-success' },{ label: 'OUTSTANDING', val: 7, color: 'text-warning' }].map(k => (
          <div key={k.label} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-1.5">
            <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{k.label}</span>
            <div className={`font-semibold text-[28px] leading-none tracking-tightest ${k.color || 'text-fg'}`}><Counter end={k.val} prefix={k.pre || ''} duration={1500} /></div>
          </div>
        ))}
      </div>
    )},
    { message: "Full invoice table with status tracking. Overdue invoices are highlighted automatically.", content: (
      <Card className="overflow-hidden">
        <div className="px-4 py-2.5 border-b border-line flex items-center justify-between"><h3 className="font-semibold text-[12px] text-fg">Recent Invoices</h3><Pill label="3 OVERDUE" tone="error" /></div>
        <div className="grid grid-cols-[1fr_100px_100px_100px] bg-surface-2 h-8 items-center px-4 text-[9px] font-semibold text-fg3 tracking-[0.14em]"><span>CUSTOMER</span><span>AMOUNT</span><span>DUE</span><span>STATUS</span></div>
        {[['Martinez Residence','$16,250','Jun 10','Overdue','text-error'],['Johnson Commercial','$64,000','Jun 15','Due Soon','text-warning'],['Chen Duplex','$24,100','Jun 08','Overdue','text-error'],['Williams Home','$12,400','Jun 20','Sent','text-fg2'],['Davis Property','$19,200','May 28','Paid','text-success']].map((row, i) => (
          <div key={i} className={`g-slide grid grid-cols-[1fr_100px_100px_100px] h-[38px] items-center px-4 ${i < 4 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.3 + i * 0.06}s` }}>
            <span className="text-[11px] text-accent font-medium">{row[0]}</span><span className="text-[11px] font-semibold text-fg">{row[1]}</span><span className="text-[10px] text-fg3">{row[2]}</span><span className={`text-[10px] font-medium ${row[4]}`}>{row[3]}</span>
          </div>
        ))}
      </Card>
    )},
    { message: "The dunning bot sends reminders automatically — friendly, firm, final notice. You set the rules.", pose: 'celebrate', content: (
      <Card className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-xl g-wiggle">💸</div>
        <div className="flex flex-col gap-0.5 flex-1"><span className="text-[13px] font-semibold text-fg">Dunning Bot</span><span className="text-[11px] text-fg2">2 reminders sent today · Next: Martinez final notice in 3 days</span></div>
        <Pill label="ACTIVE" tone="success" />
      </Card>
    )},
  ]} />;
}

export function BotsGuide() {
  return <GuideStepper title="Automation Bots" welcomeMessage="These are your tireless helpers. Each bot handles a specific job — syncing your CRM, filing documents, chasing invoices. They run 24/7 so you don't have to." ctaLabel="your data sources" steps={[
    { message: "Each bot card shows what it does, how often it runs, today's count, and success rate.", content: (
      <div className="grid grid-cols-3 gap-4">
        {[{ name: 'CRM Sync Bot', cat: 'CRM', desc: 'Pulls leads, deals, contacts from your CRM every hour.', runs: 24, rate: '100%', status: 'LIVE', tone: 'success' as const },{ name: 'Document Filler', cat: 'PRJ', desc: 'Auto-fills interconnection forms and permit applications.', runs: 8, rate: '97%', status: 'LIVE', tone: 'success' as const },{ name: 'Dunning Bot', cat: 'FIN', desc: 'Payment reminders. Escalates: reminder, warning, collections.', runs: 3, rate: '100%', status: 'LIVE', tone: 'success' as const },{ name: 'Email Classifier', cat: 'KOM', desc: 'Scans emails, routes: utility, customer, vendor, internal.', runs: 156, rate: '94%', status: 'LIVE', tone: 'success' as const },{ name: 'Fleet Monitor', cat: 'IOT', desc: 'Checks inverter APIs for underperforming systems.', runs: 48, rate: '100%', status: 'SETUP', tone: 'warning' as const },{ name: 'Enrichment Bot', cat: 'CRM', desc: 'Fills missing data — utility lookup, AHJ rules, NEC reqs.', runs: 12, rate: '91%', status: 'LIVE', tone: 'success' as const }].map((b, i) => (
          <Card key={b.name} className="g-slide p-5 flex flex-col gap-3" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center"><span className="text-accent font-semibold text-[9px] tracking-[0.18em]">{b.cat}</span></div>
              <span className="font-semibold text-[13px] text-fg truncate flex-1">{b.name}</span>
              <Pill label={b.status} tone={b.tone} />
            </div>
            <p className="text-[11px] text-fg2 leading-[16px] flex-1">{b.desc}</p>
            <div className="border-t border-line pt-2.5 flex items-center justify-between text-[10px]"><span className="text-fg3">Today: <Counter end={b.runs} duration={1000} /> runs</span><span className="text-fg3">Success {b.rate}</span></div>
          </Card>
        ))}
      </div>
    )},
    { message: "Bots activate automatically when you connect data sources. The more you connect, the more they do.", pose: 'celebrate', content: (
      <Card className="p-5 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center"><BirdieChar size={40} pose="celebrate" /></div>
        <div className="flex flex-col gap-1"><span className="text-[14px] font-bold text-fg">Ready to automate?</span><span className="text-[12px] text-fg2">Connect your first data source and watch the bots come alive.</span></div>
      </Card>
    )},
  ]} />;
}

export function WorkflowsGuide() {
  return <GuideStepper title="Workflows" welcomeMessage="Workflows chain bots and connectors into end-to-end automations. Won deal? Automatically create interconnection app, schedule install, notify customer." ctaLabel="your tools" steps={[
    { message: "Each workflow shows its trigger, what it does, and which connectors it uses.", content: (
      <div className="flex flex-col gap-4">
        {[{ cat: 'CRM & Projects', items: [{ name: 'Deal → Project', trigger: 'Won deal in CRM', desc: 'Creates project, imports customer data, triggers interconnection flow.', conns: 'CRM → .birdie → Utility Portal' },{ name: 'Lead Enrichment', trigger: 'New lead created', desc: 'Auto-fills utility, AHJ rules, NEC requirements from address.', conns: 'CRM → Enrichment API' }]},{ cat: 'Finance', items: [{ name: 'Invoice on Milestone', trigger: 'Project stage change', desc: 'Generates invoice when project hits deposit, rough-in, or final.', conns: 'CRM → QuickBooks' },{ name: 'Overdue Escalation', trigger: 'Invoice 7+ days overdue', desc: 'Reminder sequence: friendly, firm, final notice.', conns: 'QuickBooks → Email' }]},{ cat: 'Communication', items: [{ name: 'Customer Updates', trigger: 'Stage change', desc: 'Emails customer at each milestone: filed, approved, inspection, PTO.', conns: 'Portal → Email' },{ name: 'Team Alerts', trigger: 'Various', desc: 'Slack for urgent, email digest for routine, SMS for emergencies.', conns: 'All → Slack/Email/SMS' }]}].map(group => (
          <div key={group.cat} className="flex flex-col gap-3">
            <h3 className="font-semibold text-[13px] text-fg">{group.cat}</h3>
            <div className="grid grid-cols-2 gap-3">
              {group.items.map(w => (
                <Card key={w.name} className="p-4 flex flex-col gap-2.5">
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-accent text-sm g-wiggle">→</div><div className="flex flex-col min-w-0"><span className="font-semibold text-[12px] text-fg">{w.name}</span><span className="text-[10px] text-fg3">{w.trigger}</span></div></div>
                  <p className="text-[11px] text-fg2 leading-[16px]">{w.desc}</p>
                  <div className="border-t border-line pt-2 text-[10px] text-fg3">{w.conns}</div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    )},
  ]} />;
}

export function ConnectorsGuide() {
  return <GuideStepper title="Connectors" welcomeMessage="Connectors bridge .birdie and your existing tools. Each one syncs data in real-time — no more copy-pasting between systems." ctaLabel="your first tool" steps={[
    { message: "Click any connector to set up. Green dot = live, gray = available. The more you connect, the more birdie can do.", content: (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SampleConnector name="Aurora Solar" cat="CRM · Proposals" connected={false} />
        <SampleConnector name="Salesforce" cat="CRM · Pipeline" connected={false} />
        <SampleConnector name="Google Workspace" cat="Email · Calendar · Drive" connected={false} />
        <SampleConnector name="QuickBooks" cat="Accounting" connected={false} />
        <SampleConnector name="SolarEdge" cat="Monitoring · Fleet" connected={false} />
        <SampleConnector name="Enphase" cat="Monitoring · Fleet" connected={false} />
        <SampleConnector name="HubSpot" cat="CRM · Marketing" connected={false} />
        <SampleConnector name="Stripe" cat="Payments" connected={false} />
      </div>
    )},
    { message: "Each connector unlocks specific bots and workflow templates. Here's what lights up:", pose: 'celebrate', content: (
      <Card className="p-4 flex flex-col gap-3"><h3 className="font-semibold text-[12px] text-fg">What unlocks with connections</h3>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {[{ conn: 'CRM (Aurora/Salesforce)', unlocks: 'Sales Pipeline, Lead Analytics, Team Leaderboard' },{ conn: 'Email (Google/Outlook)', unlocks: 'Smart Inbox, Email Matching, Attachment Filing' },{ conn: 'Accounting (QuickBooks)', unlocks: 'Invoice Dashboard, Dunning Bot, Cash Flow' },{ conn: 'Monitoring (SolarEdge)', unlocks: 'Fleet Dashboard, Performance Alerts' }].map(r => (
            <div key={r.conn} className="flex flex-col gap-1 p-3 rounded-lg bg-surface-2/50"><span className="text-accent font-medium">{r.conn}</span><span className="text-fg3 text-[10px]">{r.unlocks}</span></div>
          ))}
        </div>
      </Card>
    )},
  ]} />;
}

export function SettingsGuide() {
  return <GuideStepper title="Settings" welcomeMessage="This is your control panel — profile, connected tools, security, and data hosting. Let me show you what lives here." ctaLabel="your first tool" steps={[
    { message: "Your company profile — name, region, industry. This data feeds into documents, emails, and customer-facing materials.", content: (
      <Card className="p-5 flex flex-col gap-4">
        <h3 className="font-semibold text-[13px] text-fg">Profile</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-bg font-semibold">SV</div>
          <div className="flex flex-col"><span className="text-sm font-medium text-fg">Sarah Vogel</span><span className="text-xs text-fg2">Volta Solar Systems · Administrator</span></div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[['Company','Volta Solar Systems'],['Industry','Solar'],['Region','Austin, TX (US)'],['Language','English']].map(([k,v]) => (
            <div key={k} className="g-slide flex items-center justify-between bg-surface-2 rounded-lg px-3 py-2" style={{ animationDelay: '0.3s' }}>
              <span className="text-fg3">{k}</span><span className="text-fg font-medium">{v}</span>
            </div>
          ))}
        </div>
      </Card>
    )},
    { message: "Connected connectors show up here too — a quick overview of everything that's live.", content: (
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center"><h3 className="font-semibold text-[13px] text-fg">Connected Connectors</h3><span className="ml-auto text-[11px] font-medium text-accent">View all →</span></div>
        <div className="flex flex-wrap gap-2">
          {['Aurora Solar','Google Workspace','QuickBooks','SolarEdge','Slack'].map((c, i) => (
            <span key={c} className="g-slide inline-flex items-center gap-2 px-3 py-1.5 bg-surface-2 border border-line rounded-lg text-xs text-fg" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> {c}
            </span>
          ))}
        </div>
      </Card>
    )},
    { message: "Security — your data lives on US servers with SOC 2 compliance. Connector credentials are encrypted on Vercel's edge. We recommend enabling 2FA.", pose: 'celebrate', content: (
      <Card className="p-5 flex flex-col gap-4">
        <h3 className="font-semibold text-[13px] text-fg">Security</h3>
        <div className="flex flex-col gap-2.5">
          {[{ label: 'Password access (Gate)', status: 'ACTIVE', tone: 'success' as const },{ label: '2FA for login', status: 'RECOMMENDED', tone: 'warning' as const },{ label: 'Data hosting', status: 'US / SOC 2', tone: 'success' as const },{ label: 'Connector secrets', status: 'ENCRYPTED (VERCEL)', tone: 'success' as const }].map((s, i) => (
            <div key={s.label} className="g-slide flex items-center" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
              <span className="text-xs text-fg2">{s.label}</span>
              <span className="ml-auto"><Pill label={s.status} tone={s.tone} /></span>
            </div>
          ))}
        </div>
      </Card>
    )},
  ]} />;
}

export function SupportGuide() {
  return <GuideStepper title="Support" welcomeMessage="Need help? You get a direct line to us — no ticket queues, no hold music. Connector setup, custom bots, data exports — just ask." ctaLabel="the team" ctaHref="mailto:support@birdiesolar.com" steps={[
    { message: "Reach out anytime — we handle connector setup, custom bots, and everything in between. Typical response: under 24 hours.", content: (
      <div className="grid grid-cols-2 gap-4">
        <Card className="g-slide p-5 flex flex-col gap-1.5" style={{ animationDelay: '0.3s' }}>
          <span className="text-[11px] font-semibold text-fg3 tracking-[0.18em]">EMAIL</span>
          <span className="text-sm font-medium text-fg">support@birdiesolar.com</span>
          <span className="text-xs text-fg3">for all requests & new connectors</span>
        </Card>
        <Card className="g-slide p-5 flex flex-col gap-1.5" style={{ animationDelay: '0.4s' }}>
          <span className="text-[11px] font-semibold text-fg3 tracking-[0.18em]">RESPONSE TIME</span>
          <span className="text-sm font-medium text-fg">&lt; 24 hrs</span>
          <span className="text-xs text-fg3">Mon–Fri · urgent matters even faster</span>
        </Card>
      </div>
    )},
    { message: "Here's what people usually ask for — we handle all of it personally.", pose: 'celebrate', content: (
      <Card className="p-5 flex flex-col gap-3">
        <h3 className="font-semibold text-[13px] text-fg">Common Requests</h3>
        {[['Connect a new connector','e.g. additional inverter, CRM, or accounting tool'],['Customize or create a bot','new automation or changes to existing ones'],['Manage users / access','add or remove team members, change roles'],['Request data export','CSV / Excel of your pipeline, fleet, or finance data']].map(([t,d], i) => (
          <div key={t} className={`g-slide flex items-center gap-3 ${i > 0 ? 'border-t border-line pt-3' : ''}`} style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
            <span className="text-accent">→</span>
            <div className="flex flex-col"><span className="text-[13px] text-fg">{t}</span><span className="text-[11px] text-fg3">{d}</span></div>
          </div>
        ))}
      </Card>
    )},
  ]} />;
}

// ════════════════════════════════════════════════════════
//  SIDEBAR TOUR — full app walkthrough for first-time users
// ════════════════════════════════════════════════════════

function NavPreview({ icon, label, desc, active = false }: { icon: string; label: string; desc: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${active ? 'bg-surface-2 border border-accent/20' : 'bg-surface border border-line'}`}>
      <span className={`text-sm w-6 text-center ${active ? 'text-accent' : 'text-fg3'}`}>{icon}</span>
      <div className="flex flex-col min-w-0">
        <span className={`text-[12px] font-medium ${active ? 'text-accent' : 'text-fg'}`}>{label}</span>
        <span className="text-[10px] text-fg3">{desc}</span>
      </div>
    </div>
  );
}

export function SidebarTourGuide() {
  return <GuideStepper
    title="Welcome to .birdie"
    welcomeMessage="Hey! I'm birdie — your solar business co-pilot. Let me give you a quick tour of the whole platform. It takes about 2 minutes and I promise it's worth it."
    ctaLabel="Aurora Solar"
    steps={[
      {
        message: "Let's start with the sidebar. It's split into four sections: Core, Monitoring, Automation, and your Account. Here's the Core section — your daily command center.",
        pose: 'wave',
        content: (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold text-fg4 tracking-[0.18em] uppercase mb-1 px-1">CORE</p>
            <NavPreview icon="◇" label="Dashboard" desc="KPIs, insights, schedule — your daily overview" active />
            <NavPreview icon="⚡" label="Interconnection" desc="Track every project from application to PTO" />
            <NavPreview icon="↗" label="Sales" desc="Full pipeline — deals, reps, funnel, lead sources" />
            <NavPreview icon="₣" label="Finance" desc="Invoices, collections, dunning automation" />
          </div>
        ),
      },
      {
        message: "The Monitoring section keeps you informed in real-time. Fleet shows live solar production from every system you've installed. Inbox auto-categorizes your emails.",
        content: (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold text-fg4 tracking-[0.18em] uppercase mb-1 px-1">MONITORING</p>
            <NavPreview icon="☀" label="Fleet" desc="Live production, alerts, uptime across all systems" active />
            <NavPreview icon="✉" label="Inbox" desc="Auto-categorized emails matched to projects" active />
          </div>
        ),
      },
      {
        message: "This is where the magic happens. Bots run your repetitive tasks. Workflows chain them together. Connectors bridge birdie to your existing tools.",
        content: (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold text-fg4 tracking-[0.18em] uppercase mb-1 px-1">AUTOMATION</p>
            <NavPreview icon="◈" label="Bots" desc="CRM sync, doc filler, dunning, email classifier — 24/7" active />
            <NavPreview icon="→" label="Workflows" desc="End-to-end automations: deal won → project → invoice" active />
            <NavPreview icon="⌘" label="Connectors" desc="Aurora, Salesforce, QuickBooks, SolarEdge, and more" active />
          </div>
        ),
      },
      {
        message: "You'll also find Calendar, Files, Catalog, and Team pages. Calendar syncs your schedule. Files stores all project documents. Catalog is your product database. Team manages roles and access.",
        content: (
          <div className="grid grid-cols-2 gap-2">
            <NavPreview icon="📅" label="Calendar" desc="Site surveys, installs, inspections — all synced" />
            <NavPreview icon="📁" label="Files" desc="Documents auto-organized by project" />
            <NavPreview icon="📦" label="Catalog" desc="Modules, inverters, batteries with pricing" />
            <NavPreview icon="👥" label="Team" desc="Members, roles, permissions" />
          </div>
        ),
      },
      {
        message: "Down at the bottom: Settings for your profile and security, and Support for a direct line to us. No ticket queues — you talk to a human.",
        content: (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold text-fg4 tracking-[0.18em] uppercase mb-1 px-1">ACCOUNT</p>
            <NavPreview icon="✱" label="Settings" desc="Profile, connected tools, security, data hosting" />
            <NavPreview icon="?" label="Support" desc="Direct line to the birdie team — < 24hr response" />
            <div className="mt-3 bg-surface rounded-xl p-3 border border-line">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                <span className="text-[11px] font-medium text-fg">All systems online</span>
              </div>
              <span className="text-[10px] text-fg3 mt-1 block pl-4">n8n · Supabase · Connectors</span>
            </div>
          </div>
        ),
      },
      {
        message: "Now let me show you what birdie looks like when everything is connected. Here's your Dashboard with live data from Aurora Solar, QuickBooks, and SolarEdge.",
        pose: 'point',
        content: (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-4 gap-3">
              {[{ label: 'PIPELINE', val: 245000, pre: '$' },{ label: 'WON', val: 92400, pre: '$', color: 'text-success' },{ label: 'CLOSE RATE', val: 38, suf: '%', color: 'text-success' },{ label: 'INTERCONNECTION', val: 12 }].map(k => (
                <div key={k.label} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-1.5">
                  <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{k.label}</span>
                  <div className={`font-semibold text-[24px] leading-none tracking-tightest ${k.color || 'text-fg'}`}><Counter end={k.val} prefix={k.pre || ''} suffix={k.suf || ''} duration={1500} /></div>
                </div>
              ))}
            </div>
            <Card className="overflow-hidden">
              <div className="px-4 py-2 border-b border-line flex items-center justify-between">
                <h3 className="font-semibold text-[11px] text-fg">Action Required</h3>
                <Pill label="3 OPEN" tone="warning" />
              </div>
              {[{ icon: '📋', msg: '3 proposals waiting for signature (oldest: 6 days)', c: 'text-warning' },{ icon: '🔧', msg: 'Martinez — inspection Friday 10am', c: 'text-info' },{ icon: '✅', msg: 'Chen — PTO approved, ready to energize', c: 'text-success' }].map((r, i) => (
                <div key={i} className={`g-slide flex items-start gap-2.5 px-4 py-2 ${i < 2 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                  <span className="text-sm">{r.icon}</span><p className={`text-[11px] leading-[16px] ${r.c}`}>{r.msg}</p>
                </div>
              ))}
            </Card>
          </div>
        ),
      },
      {
        message: "And here's your Sales pipeline — live from your CRM. Every deal, every rep, every lead source in one place.",
        content: (
          <Card className="overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line flex items-center justify-between"><h3 className="font-semibold text-[12px] text-fg">Sales Pipeline</h3><span className="text-[10px] text-fg3">Live from Aurora Solar</span></div>
            <div className="grid grid-cols-[1fr_80px_100px_100px] bg-surface-2 h-8 items-center px-4 text-[9px] font-semibold text-fg3 tracking-[0.14em]"><span>CUSTOMER</span><span>SIZE</span><span>VALUE</span><span>STATUS</span></div>
            {[['Martinez','8.4 kW','$32,500','Proposal'],['Johnson','45 kW','$128,000','Negotiation'],['Williams','6.2 kW','$24,800','New Lead'],['Chen','12.6 kW','$48,200','Won'],['Davis','9.8 kW','$38,400','Survey']].map((row, i) => (
              <div key={i} className={`g-slide grid grid-cols-[1fr_80px_100px_100px] h-[36px] items-center px-4 ${i < 4 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.3 + i * 0.06}s` }}>
                <span className="text-[11px] text-accent font-medium">{row[0]}</span><span className="text-[10px] text-fg2">{row[1]}</span><span className="text-[11px] font-semibold text-fg">{row[2]}</span><span className="text-[10px] text-fg2">{row[3]}</span>
              </div>
            ))}
          </Card>
        ),
      },
      {
        message: "Fleet monitoring — live production data from SolarEdge. If a system underperforms, you know before the customer calls.",
        content: (
          <div className="grid grid-cols-3 gap-3">
            {[{ name: 'Martinez', kw: '8.4 kW', prod: '6.2 kW', s: 'Online', t: 'success' as const },{ name: 'Johnson', kw: '45 kW', prod: '38.1 kW', s: 'Online', t: 'success' as const },{ name: 'Chen', kw: '12.6 kW', prod: '0 kW', s: 'Alert', t: 'warning' as const },{ name: 'Williams', kw: '6.2 kW', prod: '5.1 kW', s: 'Online', t: 'success' as const },{ name: 'Davis', kw: '9.8 kW', prod: '7.4 kW', s: 'Online', t: 'success' as const },{ name: 'Brown', kw: '7.1 kW', prod: '5.8 kW', s: 'Online', t: 'success' as const }].map((sys, i) => (
              <Card key={sys.name} className="g-slide p-3 flex flex-col gap-1.5" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
                <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-fg">{sys.name}</span><Pill label={sys.s.toUpperCase()} tone={sys.t} /></div>
                <div className="text-[16px] font-bold text-fg">{sys.prod}</div>
                <span className="text-[9px] text-fg3">{sys.kw} installed</span>
              </Card>
            ))}
          </div>
        ),
      },
      {
        message: "Here's how connectors look once you're set up. Green means live and syncing. This is what powers everything else.",
        content: (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SampleConnector name="Aurora Solar" cat="CRM · Proposals" connected={true} />
            <SampleConnector name="Google Workspace" cat="Email · Calendar · Drive" connected={true} />
            <SampleConnector name="QuickBooks" cat="Accounting" connected={true} />
            <SampleConnector name="SolarEdge" cat="Monitoring · Fleet" connected={true} />
            <SampleConnector name="Slack" cat="Team Chat" connected={true} />
            <SampleConnector name="Enphase" cat="Monitoring" connected={false} />
            <SampleConnector name="HubSpot" cat="CRM · Marketing" connected={false} />
            <SampleConnector name="Stripe" cat="Payments" connected={false} />
          </div>
        ),
      },
      {
        message: "That's the full tour! Every feature you just saw lights up automatically when you connect your tools. Start with your CRM — everything else follows.",
        pose: 'celebrate',
        content: (
          <Card className="p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-[13px] text-fg">Your Setup Checklist</h3>
            {[{ label: 'Connect your CRM', desc: 'Aurora Solar, Salesforce, or HubSpot' },{ label: 'Connect Google Workspace', desc: 'Email, Calendar, Drive sync' },{ label: 'Connect your accounting tool', desc: 'QuickBooks or Stripe' },{ label: 'Connect your monitoring', desc: 'SolarEdge or Enphase' },{ label: 'Invite your team', desc: 'Sales reps, installers, admins' }].map((item, i) => (
              <div key={item.label} className={`g-slide flex items-center gap-3 ${i > 0 ? 'border-t border-line pt-3' : ''}`} style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
                <div className="w-6 h-6 rounded-full border-2 border-accent/30 flex items-center justify-center text-[10px] text-fg3">{i + 1}</div>
                <div className="flex flex-col"><span className="text-[12px] font-medium text-fg">{item.label}</span><span className="text-[10px] text-fg3">{item.desc}</span></div>
              </div>
            ))}
          </Card>
        ),
      },
    ]}
  />;
}

// ════════════════════════════════════════════════════════
//  DEMO CONNECTED STATE — localStorage toggle
// ════════════════════════════════════════════════════════
const DEMO_KEY = 'birdie-demo-connected';

export function useDemoConnected() {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    setConnected(localStorage.getItem(DEMO_KEY) === 'true');
    const handler = () => setConnected(localStorage.getItem(DEMO_KEY) === 'true');
    window.addEventListener('demo-connected-change', handler);
    return () => window.removeEventListener('demo-connected-change', handler);
  }, []);
  return connected;
}

function setDemoConnected(val: boolean) {
  localStorage.setItem(DEMO_KEY, val ? 'true' : 'false');
  window.dispatchEvent(new Event('demo-connected-change'));
}

// ════════════════════════════════════════════════════════
//  CONNECT SIMULATION — OAuth-style modal
// ════════════════════════════════════════════════════════
const SIM_STEPS = [
  { label: 'Redirecting…', icon: '🔗', duration: 800 },
  { label: 'Authenticating…', icon: '🔐', duration: 1200 },
  { label: 'Syncing data…', icon: '🔄', duration: 1500 },
  { label: 'Connected!', icon: '✅', duration: 1000 },
];

function ConnectSimulation({ name, onDone }: { name: string; onDone: () => void }) {
  const [simStep, setSimStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (simStep < SIM_STEPS.length) {
      const t = setTimeout(() => {
        if (simStep === SIM_STEPS.length - 1) {
          setShowConfetti(true);
          setTimeout(() => onDoneRef.current(), 1200);
        } else {
          setSimStep(s => s + 1);
        }
      }, SIM_STEPS[simStep].duration);
      return () => clearTimeout(t);
    }
  }, [simStep]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <GuideStyles />
      {showConfetti && <ConfettiBurst />}
      <div className="g-spring bg-surface border border-line rounded-2xl p-8 w-[400px] flex flex-col items-center gap-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <BirdieChar size={48} pose={simStep === SIM_STEPS.length - 1 ? 'celebrate' : 'default'} />
        </div>
        <h3 className="font-bold text-lg text-fg tracking-tight">Connecting {name}</h3>
        <div className="w-full flex flex-col gap-3">
          {SIM_STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 transition-opacity duration-300 ${i <= simStep ? 'opacity-100' : 'opacity-20'}`}>
              <span className="text-lg w-7 text-center">{i < simStep ? '✅' : i === simStep ? s.icon : '○'}</span>
              <span className={`text-sm ${i === simStep ? 'text-fg font-medium' : 'text-fg3'}`}>{s.label}</span>
              {i === simStep && i < SIM_STEPS.length - 1 && <span className="ml-auto w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />}
            </div>
          ))}
        </div>
        <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${((simStep + 1) / SIM_STEPS.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  DEMO CONNECTORS PAGE — interactive connect flow
// ════════════════════════════════════════════════════════
const DEMO_CONNECTORS = [
  { name: 'Google Workspace', cat: 'Email · Calendar · Drive' },
  { name: 'Aurora Solar', cat: 'CRM · Proposals' },
  { name: 'QuickBooks', cat: 'Accounting' },
  { name: 'SolarEdge', cat: 'Monitoring · Fleet' },
  { name: 'Slack', cat: 'Team Chat' },
  { name: 'Enphase', cat: 'Monitoring · Fleet' },
  { name: 'Salesforce', cat: 'CRM · Pipeline' },
  { name: 'HubSpot', cat: 'CRM · Marketing' },
  { name: 'Stripe', cat: 'Payments' },
  { name: 'Calendly', cat: 'Scheduling' },
  { name: 'Zapier', cat: 'Integration Hub' },
];

export function DemoConnectorsPage() {
  const demoConnected = useDemoConnected();
  const [localConnected, setLocalConnected] = useState<string[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (demoConnected) setLocalConnected(DEMO_CONNECTORS.slice(0, 5).map(c => c.name));
  }, [demoConnected]);

  const handleDone = useCallback(() => {
    setConnecting(prev => {
      if (prev) {
        setLocalConnected(lc => {
          const next = [...lc, prev];
          if (next.length >= 3) setDemoConnected(true);
          return next;
        });
      }
      return null;
    });
  }, []);

  const connected = DEMO_CONNECTORS.filter(c => localConnected.includes(c.name));
  const available = DEMO_CONNECTORS.filter(c => !localConnected.includes(c.name));

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-auto">
      <GuideStyles />
      {connecting && <ConnectSimulation name={connecting} onDone={handleDone} />}
      <div className="px-6 py-5 flex flex-col gap-5 max-w-[960px] mx-auto w-full">
        <div className="g-slide-in flex items-center gap-4">
          <div className="g-float shrink-0 w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <BirdieChar size={40} pose="point" />
          </div>
          <div className="relative bg-surface-2/80 backdrop-blur-sm border border-accent/12 rounded-2xl px-5 py-3.5 max-w-[580px] shadow-sm">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-surface-2/80 border-l border-b border-accent/12 rotate-45" />
            <p className="text-[13px] text-fg2 leading-relaxed relative z-10">
              {connected.length === 0
                ? "Click 'Connect' on any tool below to see how the setup flow works. Once you connect a few, the rest of the app lights up with sample data."
                : connected.length < 3
                ? `Nice! ${connected.length} connected. Connect ${3 - connected.length} more to unlock populated views across all pages.`
                : "Your tools are connected! Navigate to Sales, Fleet, or any other page to see what birdie looks like with live data flowing in."}
            </p>
          </div>
        </div>

        {connected.length > 0 && (
          <div className="g-slide flex flex-col gap-2" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3"><h2 className="font-semibold text-sm text-fg">Connected</h2><Pill label="LIVE" tone="success" /></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {connected.map(c => (
                <div key={c.name} className="g-spring bg-surface border border-line rounded-xl p-4 flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center font-semibold text-xs text-fg">{c.name.slice(0, 2)}</div>
                    <div className="flex flex-col min-w-0"><span className="font-semibold text-[12px] text-fg truncate">{c.name}</span><span className="text-[10px] text-fg3">{c.cat}</span></div>
                    <span className="ml-auto w-2.5 h-2.5 rounded-full bg-success" />
                  </div>
                  <div className="border-t border-line pt-2"><Pill label="CONNECTED" tone="success" /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {available.length > 0 && (
          <div className="g-slide flex flex-col gap-2" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3"><h2 className="font-semibold text-sm text-fg">Available</h2></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {available.map(c => (
                <div key={c.name} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center font-semibold text-xs text-fg">{c.name.slice(0, 2)}</div>
                    <div className="flex flex-col min-w-0"><span className="font-semibold text-[12px] text-fg truncate">{c.name}</span><span className="text-[10px] text-fg3">{c.cat}</span></div>
                  </div>
                  <div className="border-t border-line pt-2 flex items-center justify-between">
                    <Pill label="AVAILABLE" tone="neutral" />
                    <button onClick={() => setConnecting(c.name)} className="px-3 py-1.5 rounded-lg bg-accent text-bg text-[11px] font-bold hover:scale-[1.04] active:scale-[0.96] transition-transform">Connect</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  POPULATED DEMO VIEWS — shown after "connecting"
// ════════════════════════════════════════════════════════
function DemoPopulated({ message, pose = 'point' as const, children }: { message: string; pose?: 'default' | 'wave' | 'point' | 'celebrate'; children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-auto">
      <GuideStyles />
      <div className="px-6 py-5 flex flex-col gap-5 max-w-[1100px] mx-auto w-full">
        <div className="g-slide-in flex items-center gap-4">
          <div className="g-float shrink-0 w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <BirdieChar size={40} pose={pose} />
          </div>
          <div className="relative bg-surface-2/80 backdrop-blur-sm border border-accent/12 rounded-2xl px-5 py-3.5 max-w-[580px] shadow-sm">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-surface-2/80 border-l border-b border-accent/12 rotate-45" />
            <p className="text-[13px] text-fg2 leading-relaxed relative z-10">{message}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function DetailSlideout({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-[520px] bg-bg border-l border-line shadow-2xl overflow-y-auto animate-[slideIn_0.25s_ease-out]" onClick={e => e.stopPropagation()} style={{ animation: 'slideIn 0.25s ease-out' }}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-fg3 hover:text-fg transition-colors">&times;</button>
        <div className="p-6 flex flex-col gap-5">{children}</div>
      </div>
    </div>
  );
}

const SALES_DATA = [
  { name: 'Martinez Residence', size: '8.4 kW', value: '$32,500', stage: 'Proposal', rep: 'Jake', phone: '(480) 555-0142', email: 'tom.martinez@email.com', addr: '4521 E Camelback Rd, Phoenix AZ', panels: '21× REC Alpha Pure-R 400W', inverter: 'SolarEdge SE7600H', notes: 'Wants battery add-on. Follow up next week on financing options.' },
  { name: 'Johnson Commercial', size: '45 kW', value: '$128,000', stage: 'Negotiation', rep: 'Sarah', phone: '(602) 555-0398', email: 'l.johnson@johnsoncorp.com', addr: '8900 N Central Ave, Phoenix AZ', panels: '112× Canadian Solar 400W', inverter: '2× SMA Sunny Tripower 25kW', notes: 'Parking lot carport install. Need structural engineer sign-off.' },
  { name: 'Williams Home', size: '6.2 kW', value: '$24,800', stage: 'New Lead', rep: 'Mike', phone: '(520) 555-0276', email: 'williams.j@gmail.com', addr: '1120 S Mill Ave, Tempe AZ', panels: '16× Q.CELLS Q.PEAK DUO 390W', inverter: 'Enphase IQ8+', notes: 'Inbound from website. Scheduled site survey for next Tuesday.' },
  { name: 'Chen Duplex', size: '12.6 kW', value: '$48,200', stage: 'Won', rep: 'Sarah', phone: '(480) 555-0815', email: 'david.chen@email.com', addr: '2340 W Baseline Rd, Mesa AZ', panels: '32× REC Alpha Pure-R 400W', inverter: 'SolarEdge SE10000H', notes: 'Contract signed. Install scheduled for next month. Net metering approved.' },
  { name: 'Davis Property', size: '9.8 kW', value: '$38,400', stage: 'Survey', rep: 'Jake', phone: '(623) 555-0461', email: 'rdavis@outlook.com', addr: '6780 W Glendale Ave, Glendale AZ', panels: '25× LG Neon H 395W', inverter: 'SolarEdge SE10000H', notes: 'Roof needs inspection. Possible tile replacement before install.' },
];

export function DemoSalesView() {
  const connected = useDemoConnected();
  const [selected, setSelected] = useState<number | null>(null);
  if (!connected) return (
    <DemoView message="Your sales pipeline — leads, proposals, contracts, all in one view. Connect your CRM to see live deals flowing in.">
      <Card className="overflow-hidden opacity-75">
        <div className="grid grid-cols-[1fr_80px_100px_100px] bg-surface-2 h-8 items-center px-4 text-[9px] font-semibold text-fg3 tracking-[0.14em]"><span>CUSTOMER</span><span>SIZE</span><span>VALUE</span><span>STAGE</span></div>
        {['Martinez','Johnson','Chen','Williams','Davis'].map((n, i) => (
          <div key={n} className={`grid grid-cols-[1fr_80px_100px_100px] h-[36px] items-center px-4 ${i < 4 ? 'border-b border-line' : ''}`}>
            <span className="text-[11px] text-fg3">{n}</span><span className="text-[10px] text-fg3">—</span><span className="text-[11px] text-fg3">—</span><span className="text-[10px] text-fg3">—</span>
          </div>
        ))}
      </Card>
    </DemoView>
  );
  const deal = selected !== null ? SALES_DATA[selected] : null;
  return (
    <DemoPopulated message="Here's your pipeline with live data from Aurora Solar. Every lead, every deal, every stage — updated in real time.">
      <div className="grid grid-cols-4 gap-3 g-slide" style={{ animationDelay: '0.15s' }}>
        {[{ l: 'PIPELINE VALUE', v: '$271,900' },{ l: 'DEALS', v: '8' },{ l: 'CLOSE RATE', v: '38%' },{ l: 'AVG DEAL', v: '$34,000' }].map(k => (
          <div key={k.l} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-1"><span className="font-medium text-[10px] text-fg3 tracking-[0.14em]">{k.l}</span><span className="font-bold text-[20px] text-fg">{k.v}</span></div>
        ))}
      </div>
      <Card className="overflow-hidden g-slide" style={{ animationDelay: '0.25s' }}>
        <div className="px-4 py-2.5 border-b border-line flex items-center justify-between"><h3 className="font-semibold text-[12px] text-fg">Sales Pipeline</h3><span className="text-[10px] text-fg3">Live from Aurora Solar</span></div>
        <div className="grid grid-cols-[1fr_80px_100px_100px_90px] bg-surface-2 h-8 items-center px-4 text-[9px] font-semibold text-fg3 tracking-[0.14em]"><span>CUSTOMER</span><span>SIZE</span><span>VALUE</span><span>STAGE</span><span>REP</span></div>
        {SALES_DATA.map((row, i) => (
          <div key={i} onClick={() => setSelected(i)} className={`g-slide grid grid-cols-[1fr_80px_100px_100px_90px] h-[40px] items-center px-4 cursor-pointer hover:bg-surface-2/50 transition-colors ${i < 4 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.35 + i * 0.06}s` }}>
            <span className="text-[11px] text-accent font-medium">{row.name}</span><span className="text-[10px] text-fg2">{row.size}</span><span className="text-[11px] font-semibold text-fg">{row.value}</span>
            <Pill label={row.stage.toUpperCase()} tone={row.stage === 'Won' ? 'success' : row.stage === 'New Lead' ? 'info' : 'warning'} />
            <span className="text-[10px] text-fg3">{row.rep}</span>
          </div>
        ))}
      </Card>
      <DetailSlideout open={!!deal} onClose={() => setSelected(null)}>
        {deal && (<>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">{deal.name.slice(0, 2)}</div>
            <div><h2 className="font-bold text-lg text-fg">{deal.name}</h2><p className="text-xs text-fg3">{deal.addr}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-1"><span className="text-[9px] text-fg3 tracking-widest">VALUE</span><span className="font-bold text-fg">{deal.value}</span></div>
            <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-1"><span className="text-[9px] text-fg3 tracking-widest">SIZE</span><span className="font-bold text-fg">{deal.size}</span></div>
            <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-1"><span className="text-[9px] text-fg3 tracking-widest">STAGE</span><Pill label={deal.stage.toUpperCase()} tone={deal.stage === 'Won' ? 'success' : deal.stage === 'New Lead' ? 'info' : 'warning'} /></div>
          </div>
          <Card className="p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-fg">Contact</h3>
            <div className="flex flex-col gap-1.5 text-xs text-fg2">
              <span>{deal.phone}</span><span>{deal.email}</span><span>Rep: {deal.rep}</span>
            </div>
          </Card>
          <Card className="p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-fg">System</h3>
            <div className="flex flex-col gap-1.5 text-xs text-fg2">
              <span>{deal.panels}</span><span>{deal.inverter}</span>
            </div>
          </Card>
          <Card className="p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-fg">Notes</h3>
            <p className="text-xs text-fg2 leading-relaxed">{deal.notes}</p>
          </Card>
        </>)}
      </DetailSlideout>
    </DemoPopulated>
  );
}

const IX_DATA: Record<string, { utility: string; app: string; addr: string; kw: string; panels: string; inverter: string; meter: string; notes: string }> = {
  'Williams Home': { utility: 'APS', app: '#IX-5102', addr: '1120 S Mill Ave, Tempe AZ', kw: '6.2 kW', panels: '16× Q.CELLS 390W', inverter: 'Enphase IQ8+', meter: 'Pending', notes: 'Application submitted. Standard residential review — expected 2-3 weeks.' },
  'Davis Property': { utility: 'SRP', app: '#IX-5118', addr: '6780 W Glendale Ave, Glendale AZ', kw: '9.8 kW', panels: '25× LG Neon H 395W', inverter: 'SolarEdge SE10000H', meter: 'Pending', notes: 'Submitted yesterday. SRP typically takes 10-15 business days for residential.' },
  'Martinez Residence': { utility: 'APS', app: '#IX-4956', addr: '4521 E Camelback Rd, Phoenix AZ', kw: '8.4 kW', panels: '21× REC Alpha Pure-R 400W', inverter: 'SolarEdge SE7600H', meter: 'Pending', notes: 'Under utility review for 12 days. Follow up with APS if no response by day 15.' },
  'Chen Duplex': { utility: 'APS', app: '#IX-4821', addr: '2340 W Baseline Rd, Mesa AZ', kw: '12.6 kW', panels: '32× REC Alpha Pure-R 400W', inverter: 'SolarEdge SE10000H', meter: 'Jun 25', notes: 'Approved! PTO date June 28. Meter exchange scheduled. Net metering plan: APS RCP-E.' },
  'Brown Residence': { utility: 'SRP', app: '#IX-4887', addr: '3450 E University Dr, Mesa AZ', kw: '7.1 kW', panels: '18× Canadian Solar 395W', inverter: 'Enphase IQ8+', meter: 'Jul 2', notes: 'Approved by SRP. Awaiting inspection date confirmation.' },
  'Johnson Commercial': { utility: 'APS', app: '#IX-4612', addr: '8900 N Central Ave, Phoenix AZ', kw: '45 kW', panels: '112× Canadian Solar 400W', inverter: '2× SMA Sunny Tripower 25kW', meter: 'Active', notes: 'Fully activated. Commercial net metering active since June 2. Producing at expected output.' },
};

export function DemoInterconnectionView() {
  const connected = useDemoConnected();
  const [selected, setSelected] = useState<string | null>(null);
  if (!connected) return (
    <DemoView message="Interconnection tracking — every permit application from submission to activation. Connect your tools to see the full pipeline.">
      <div className="grid grid-cols-4 gap-3">
        {['Applied','Under Review','Approved','Activated'].map(s => (
          <div key={s} className="bg-surface border border-line rounded-xl p-3 opacity-75">
            <span className="text-[11px] font-semibold text-fg3">{s}</span>
            <div className="mt-3 h-20 border border-dashed border-line rounded-lg flex items-center justify-center text-[10px] text-fg3">No projects</div>
          </div>
        ))}
      </div>
    </DemoView>
  );
  const proj = selected ? IX_DATA[selected] : null;
  return (
    <DemoPopulated message="Interconnection pipeline — every permit tracked from application to activation. Click any project for details.">
      <div className="grid grid-cols-4 gap-3 g-slide" style={{ animationDelay: '0.15s' }}>
        {[
          { stage: 'Applied', tone: 'info' as const, items: [{ name: 'Williams Home', kw: '6.2 kW', days: '3 days ago' },{ name: 'Davis Property', kw: '9.8 kW', days: '1 day ago' }] },
          { stage: 'Under Review', tone: 'warning' as const, items: [{ name: 'Martinez Residence', kw: '8.4 kW', days: '12 days' }] },
          { stage: 'Approved', tone: 'success' as const, items: [{ name: 'Chen Duplex', kw: '12.6 kW', days: '2 days ago' },{ name: 'Brown Residence', kw: '7.1 kW', days: '5 days ago' }] },
          { stage: 'Activated', tone: 'success' as const, items: [{ name: 'Johnson Commercial', kw: '45 kW', days: 'yesterday' }] },
        ].map((col, ci) => (
          <div key={col.stage} className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-fg">{col.stage}</span>
              <Pill label={String(col.items.length)} tone={col.tone} />
            </div>
            {col.items.map((item, ii) => (
              <div key={item.name} onClick={() => setSelected(item.name)} className="g-slide bg-surface border border-line rounded-xl p-3 flex flex-col gap-1 cursor-pointer hover:bg-surface-2/50 transition-colors" style={{ animationDelay: `${0.25 + ci * 0.1 + ii * 0.06}s` }}>
                <span className="text-[11px] font-semibold text-accent">{item.name}</span>
                <span className="text-[10px] text-fg3">{item.kw} · {item.days}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <DetailSlideout open={!!proj} onClose={() => setSelected(null)}>
        {proj && selected && (<>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center text-info font-bold text-sm">⚡</div>
            <div><h2 className="font-bold text-lg text-fg">{selected}</h2><p className="text-xs text-fg3">{proj.addr}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-1"><span className="text-[9px] text-fg3 tracking-widest">APPLICATION</span><span className="font-bold text-fg text-sm">{proj.app}</span></div>
            <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-1"><span className="text-[9px] text-fg3 tracking-widest">UTILITY</span><span className="font-bold text-fg text-sm">{proj.utility}</span></div>
            <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-1"><span className="text-[9px] text-fg3 tracking-widest">METER</span><span className="font-bold text-fg text-sm">{proj.meter}</span></div>
          </div>
          <Card className="p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-fg">System</h3>
            <div className="flex flex-col gap-1.5 text-xs text-fg2">
              <span>{proj.kw} — {proj.panels}</span><span>{proj.inverter}</span>
            </div>
          </Card>
          <Card className="p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-fg">Status Notes</h3>
            <p className="text-xs text-fg2 leading-relaxed">{proj.notes}</p>
          </Card>
        </>)}
      </DetailSlideout>
    </DemoPopulated>
  );
}

const FLEET_DATA = [
  { name: 'Martinez Residence', kw: '8.4', prod: '6.2', s: 'Online', t: 'success' as const, addr: '4521 E Camelback Rd, Phoenix AZ', panels: '21× REC Alpha Pure-R 400W', inverter: 'SolarEdge SE7600H', installed: 'Mar 2026', today: '38.4 kWh', month: '1,180 kWh', selfCons: '82%', co2: '0.84 tons saved' },
  { name: 'Johnson Commercial', kw: '45', prod: '38.1', s: 'Online', t: 'success' as const, addr: '8900 N Central Ave, Phoenix AZ', panels: '112× Canadian Solar 400W', inverter: '2× SMA Sunny Tripower 25kW', installed: 'Jun 2026', today: '286 kWh', month: '8,420 kWh', selfCons: '91%', co2: '5.96 tons saved' },
  { name: 'Chen Duplex', kw: '12.6', prod: '0', s: 'Alert', t: 'warning' as const, addr: '2340 W Baseline Rd, Mesa AZ', panels: '32× REC Alpha Pure-R 400W', inverter: 'SolarEdge SE10000H', installed: 'Apr 2026', today: '0 kWh', month: '920 kWh', selfCons: '—', co2: '0.65 tons saved' },
  { name: 'Williams Home', kw: '6.2', prod: '5.1', s: 'Online', t: 'success' as const, addr: '1120 S Mill Ave, Tempe AZ', panels: '16× Q.CELLS 390W', inverter: 'Enphase IQ8+', installed: 'May 2026', today: '31.2 kWh', month: '940 kWh', selfCons: '76%', co2: '0.67 tons saved' },
  { name: 'Davis Property', kw: '9.8', prod: '7.4', s: 'Online', t: 'success' as const, addr: '6780 W Glendale Ave, Glendale AZ', panels: '25× LG Neon H 395W', inverter: 'SolarEdge SE10000H', installed: 'May 2026', today: '44.8 kWh', month: '1,340 kWh', selfCons: '79%', co2: '0.95 tons saved' },
  { name: 'Brown Residence', kw: '7.1', prod: '5.8', s: 'Online', t: 'success' as const, addr: '3450 E University Dr, Mesa AZ', panels: '18× Canadian Solar 395W', inverter: 'Enphase IQ8+', installed: 'Apr 2026', today: '35.6 kWh', month: '1,060 kWh', selfCons: '74%', co2: '0.75 tons saved' },
];

export function DemoFleetView() {
  const connected = useDemoConnected();
  const [selected, setSelected] = useState<number | null>(null);
  if (!connected) return (
    <DemoView message="Fleet monitoring shows live production data from every system you've installed. Connect SolarEdge or Enphase to see real-time performance.">
      <div className="grid grid-cols-3 gap-3">
        {['Martinez','Johnson','Chen','Williams','Davis','Brown'].map(n => (
          <Card key={n} className="p-4 flex flex-col gap-2 opacity-75">
            <span className="text-[12px] font-semibold text-fg">{n}</span>
            <span className="text-[18px] font-bold text-fg3">— kW</span>
            <span className="text-[10px] text-fg3">awaiting connection</span>
          </Card>
        ))}
      </div>
    </DemoView>
  );
  const sys = selected !== null ? FLEET_DATA[selected] : null;
  return (
    <DemoPopulated message="Fleet monitoring — live from SolarEdge. Every system, every panel, every alert. Click any system for details.">
      <div className="grid grid-cols-4 gap-3 g-slide" style={{ animationDelay: '0.15s' }}>
        {[{ l: 'TOTAL SYSTEMS', v: '6' },{ l: 'POWER NOW', v: '62.6 kW' },{ l: 'AVG SELF-CONS.', v: '78%' },{ l: 'ALERTS', v: '1' }].map(k => (
          <div key={k.l} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-1"><span className="font-medium text-[10px] text-fg3 tracking-[0.14em]">{k.l}</span><span className="font-bold text-[20px] text-fg">{k.v}</span></div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 g-slide" style={{ animationDelay: '0.25s' }}>
        {FLEET_DATA.map((f, i) => (
          <div key={f.name} onClick={() => setSelected(i)} className="g-slide bg-surface border border-line rounded-xl p-4 flex flex-col gap-2 cursor-pointer hover:bg-surface-2/50 transition-colors" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
            <div className="flex items-center justify-between"><span className="text-[12px] font-semibold text-accent">{f.name}</span><Pill label={f.s.toUpperCase()} tone={f.t} /></div>
            <span className="text-[22px] font-bold text-fg">{f.prod} kW</span>
            <div className="flex items-center justify-between"><span className="text-[10px] text-fg3">{f.kw} kW installed</span><span className="text-[10px] text-fg3">self-cons. {f.selfCons}</span></div>
            <div className="w-full bg-surface-2 rounded-full h-1.5"><div className="h-full bg-accent rounded-full" style={{ width: `${(parseFloat(f.prod) / parseFloat(f.kw)) * 100}%` }} /></div>
          </div>
        ))}
      </div>
      <DetailSlideout open={!!sys} onClose={() => setSelected(null)}>
        {sys && (<>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success font-bold text-sm">☀️</div>
            <div><h2 className="font-bold text-lg text-fg">{sys.name}</h2><p className="text-xs text-fg3">{sys.addr}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-1"><span className="text-[9px] text-fg3 tracking-widest">POWER NOW</span><span className="font-bold text-[20px] text-fg">{sys.prod} kW</span></div>
            <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-1"><span className="text-[9px] text-fg3 tracking-widest">STATUS</span><Pill label={sys.s.toUpperCase()} tone={sys.t} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-1"><span className="text-[9px] text-fg3 tracking-widest">TODAY</span><span className="font-bold text-fg text-sm">{sys.today}</span></div>
            <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-1"><span className="text-[9px] text-fg3 tracking-widest">THIS MONTH</span><span className="font-bold text-fg text-sm">{sys.month}</span></div>
            <div className="bg-surface border border-line rounded-xl p-3 flex flex-col gap-1"><span className="text-[9px] text-fg3 tracking-widest">SELF-CONS.</span><span className="font-bold text-fg text-sm">{sys.selfCons}</span></div>
          </div>
          <Card className="p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-fg">Equipment</h3>
            <div className="flex flex-col gap-1.5 text-xs text-fg2">
              <span>{sys.panels}</span><span>{sys.inverter}</span><span>Installed: {sys.installed}</span>
            </div>
          </Card>
          <Card className="p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-fg">Environmental Impact</h3>
            <span className="text-xs text-success">{sys.co2}</span>
          </Card>
        </>)}
      </DetailSlideout>
    </DemoPopulated>
  );
}

export function DemoFinanceView() {
  const connected = useDemoConnected();
  if (!connected) return (
    <DemoView message="Revenue, invoices, margins — all in one place. Connect QuickBooks or Stripe to see your financial data live.">
      <div className="h-32 bg-surface border border-line rounded-xl flex items-center justify-center text-fg3 text-xs opacity-60">Revenue chart — awaiting connection</div>
    </DemoView>
  );
  return (
    <DemoPopulated message="Your financial overview — live from QuickBooks. Revenue, outstanding invoices, and margins at a glance.">
      <div className="grid grid-cols-4 gap-3 g-slide" style={{ animationDelay: '0.15s' }}>
        {[{ l: 'REVENUE MTD', v: '$84,200' },{ l: 'OUTSTANDING', v: '$32,500' },{ l: 'MARGIN', v: '34%' },{ l: 'INVOICES', v: '12' }].map(k => (
          <div key={k.l} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-1"><span className="font-medium text-[10px] text-fg3 tracking-[0.14em]">{k.l}</span><span className="font-bold text-[20px] text-fg">{k.v}</span></div>
        ))}
      </div>
      <Card className="overflow-hidden g-slide" style={{ animationDelay: '0.25s' }}>
        <div className="px-4 py-2.5 border-b border-line"><h3 className="font-semibold text-[12px] text-fg">Recent Invoices</h3></div>
        <div className="grid grid-cols-[1fr_100px_100px_90px] bg-surface-2 h-8 items-center px-4 text-[9px] font-semibold text-fg3 tracking-[0.14em]"><span>CUSTOMER</span><span>AMOUNT</span><span>DATE</span><span>STATUS</span></div>
        {[['Martinez Residence','$32,500','Jun 12','Paid'],['Johnson Commercial','$128,000','Jun 8','Pending'],['Williams Home','$24,800','Jun 5','Paid'],['Chen Duplex','$48,200','Jun 1','Overdue']].map((row, i) => (
          <div key={i} className={`g-slide grid grid-cols-[1fr_100px_100px_90px] h-[40px] items-center px-4 ${i < 3 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.35 + i * 0.06}s` }}>
            <span className="text-[11px] text-fg font-medium">{row[0]}</span><span className="text-[11px] font-semibold text-fg">{row[1]}</span><span className="text-[10px] text-fg3">{row[2]}</span>
            <Pill label={row[3].toUpperCase()} tone={row[3] === 'Paid' ? 'success' : row[3] === 'Overdue' ? 'warning' : 'info'} />
          </div>
        ))}
      </Card>
    </DemoPopulated>
  );
}

const INBOX_DATA = [
  { from: 'Tom Martinez', subj: 'Re: Proposal for 8.4 kW system', time: '2h ago', unread: true, email: 'tom.martinez@email.com', body: 'Hi Jake,\n\nThanks for the updated proposal! The 8.4 kW system looks great. A couple of questions:\n\n1. Can we add a Tesla Powerwall to the design? We get frequent outages in summer.\n2. What financing options are available? We\'d prefer a loan over lease.\n3. Is the $32,500 price before or after the federal tax credit?\n\nLooking forward to your response.\n\nBest,\nTom Martinez' },
  { from: 'APS Utility', subj: 'Interconnection application #IX-4821 approved', time: '5h ago', unread: true, email: 'no-reply@aps.com', body: 'Dear birdie Solar,\n\nYour interconnection application #IX-4821 for the Chen Duplex project (12.6 kW) has been APPROVED.\n\nPermission to Operate (PTO) Date: June 28, 2026\nMeter Exchange: Scheduled for June 25, 2026\nNet Metering Plan: APS RCP-E\n\nPlease ensure the system is installed and inspected before the PTO date.\n\nArizona Public Service' },
  { from: 'Lisa Johnson', subj: 'Commercial install — parking lot questions', time: 'yesterday', unread: false, email: 'l.johnson@johnsoncorp.com', body: 'Sarah,\n\nBefore we finalize the 45 kW commercial install, I need to check on a few things with our facilities team:\n\n- Will the carport structures affect parking lot drainage?\n- Do we need to repaint the parking lines after installation?\n- What\'s the expected timeline for the full install?\n\nAlso, our board meeting is next Thursday — would love to have a one-pager I can present.\n\nThanks,\nLisa' },
  { from: 'SolarEdge Alerts', subj: 'Chen Duplex — inverter offline since 8am', time: 'yesterday', unread: false, email: 'alerts@solaredge.com', body: 'ALERT: System Offline\n\nSite: Chen Duplex (2340 W Baseline Rd, Mesa AZ)\nInverter: SolarEdge SE10000H (SN: 7F-2849-C1)\nStatus: Communication lost\nLast seen: Today 8:02 AM\nEstimated daily loss: 42 kWh ($5.88)\n\nPossible causes:\n- WiFi/internet outage at site\n- Inverter fault requiring reset\n- Communication board failure\n\nRecommended action: Check site connectivity or dispatch technician.' },
  { from: 'Jake (Sales)', subj: 'Davis site survey photos attached', time: '2 days ago', unread: false, email: 'jake@birdiesolar.com', body: 'Hey team,\n\nJust finished the Davis Property site survey. Here are my notes:\n\n- South-facing roof, ~30° pitch — ideal orientation\n- Roof is concrete tile, about 8 years old. May need 2-3 tiles replaced.\n- Main panel is 200A, plenty of capacity\n- Slight shading from a palm tree on the west side (affects ~2 panels after 3pm)\n- Homeowner wants panels on the back roof only (not street-facing)\n\nPhotos are in Google Drive. I\'ll update the proposal with the adjusted design.\n\n— Jake' },
];

export function DemoInboxView() {
  const connected = useDemoConnected();
  const [selected, setSelected] = useState<number | null>(null);
  if (!connected) return (
    <DemoView message="Your unified inbox — emails, notifications, and messages from every connected tool. Connect Google Workspace to see it live.">
      <div className="flex flex-col gap-2">
        {['New proposal request','Site survey confirmation','Permit update'].map(s => (
          <div key={s} className="bg-surface border border-line rounded-lg px-4 py-3 flex items-center gap-3 opacity-60">
            <span className="w-8 h-8 rounded-full bg-surface-3" /><div className="flex flex-col"><span className="text-[11px] text-fg3">{s}</span><span className="text-[10px] text-fg3">—</span></div>
          </div>
        ))}
      </div>
    </DemoView>
  );
  const mail = selected !== null ? INBOX_DATA[selected] : null;
  return (
    <DemoPopulated message="Your inbox — all customer emails and notifications from connected tools in one stream." pose="wave">
      <div className="flex flex-col gap-1 g-slide" style={{ animationDelay: '0.15s' }}>
        {INBOX_DATA.map((e, i) => (
          <div key={i} onClick={() => setSelected(i)} className={`g-slide flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-surface-2/50 transition-colors ${e.unread ? 'bg-accent/5 border border-accent/10' : 'bg-surface border border-line'}`} style={{ animationDelay: `${0.2 + i * 0.06}s` }}>
            <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-[10px] font-bold text-fg3">{e.from.slice(0, 2)}</div>
            <div className="flex-1 min-w-0 flex flex-col"><span className={`text-[12px] truncate ${e.unread ? 'font-semibold text-fg' : 'text-fg2'}`}>{e.from}</span><span className="text-[11px] text-fg3 truncate">{e.subj}</span></div>
            <span className="text-[10px] text-fg3 shrink-0">{e.time}</span>
            {e.unread && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
          </div>
        ))}
      </div>
      <DetailSlideout open={!!mail} onClose={() => setSelected(null)}>
        {mail && (<>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-sm font-bold text-fg3">{mail.from.slice(0, 2)}</div>
            <div className="flex-1 min-w-0"><h2 className="font-bold text-sm text-fg">{mail.from}</h2><p className="text-[11px] text-fg3 truncate">{mail.email}</p></div>
            <span className="text-[10px] text-fg3">{mail.time}</span>
          </div>
          <h3 className="font-semibold text-fg text-sm">{mail.subj}</h3>
          <Card className="p-4">
            <pre className="text-xs text-fg2 leading-relaxed whitespace-pre-wrap font-sans">{mail.body}</pre>
          </Card>
          <div className="flex gap-2">
            <button className="flex-1 h-9 bg-accent text-bg rounded-lg text-xs font-semibold">Reply</button>
            <button className="flex-1 h-9 bg-surface border border-line rounded-lg text-xs text-fg2">Forward</button>
          </div>
        </>)}
      </DetailSlideout>
    </DemoPopulated>
  );
}

export function DemoCashflowView() {
  const connected = useDemoConnected();
  if (!connected) return (
    <DemoView message="Cash flow planning — track every dollar in and out across all your projects. Connect your tools to see the full picture."><div /></DemoView>
  );
  return (
    <DemoPopulated message="Your cash flow — income, expenses, and balance across all active projects, updated in real time.">
      <div className="grid grid-cols-4 gap-3 g-slide" style={{ animationDelay: '0.15s' }}>
        {[{ l: 'ORDER VALUE', v: '$482,300', s: '12 active projects' },{ l: 'PLANNED INCOME', v: '$341,600', s: '$218,400 received', c: 'text-success' },{ l: 'PLANNED EXPENSES', v: '$186,200', s: '$124,800 paid', c: 'text-warning' },{ l: 'OPEN BALANCE', v: '+$155,400', s: 'no warnings', c: 'text-success' }].map(k => (
          <div key={k.l} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-1"><span className="font-medium text-[10px] text-fg3 tracking-[0.14em]">{k.l}</span><span className={`font-bold text-[20px] ${k.c || 'text-fg'}`}>{k.v}</span><span className="text-[10px] text-fg3">{k.s}</span></div>
        ))}
      </div>
      <Card className="overflow-hidden g-slide" style={{ animationDelay: '0.25s' }}>
        <div className="px-4 py-2.5 border-b border-line flex items-center justify-between"><h3 className="font-semibold text-[12px] text-fg">Cashflow Timeline</h3><span className="text-[10px] text-fg3">8 weeks</span></div>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[80px_repeat(8,1fr)] min-w-[700px]">
            <div className="bg-surface-2 h-8 flex items-center px-3 text-[9px] font-semibold text-fg3">WK</div>
            {['06/16','06/23','06/30','07/07','07/14','07/21','07/28','08/04'].map(w => (
              <div key={w} className="bg-surface-2 h-8 flex items-center justify-center text-[9px] text-fg3">{w}</div>
            ))}
            <div className="h-9 flex items-center px-3 text-[10px] text-fg2 border-b border-line">Income</div>
            {['+28k','+42k','+18k','+35k','+22k','+48k','+15k','+30k'].map((v, i) => (
              <div key={i} className="h-9 flex items-center justify-center text-[10px] font-medium text-success border-b border-line">{v}</div>
            ))}
            <div className="h-9 flex items-center px-3 text-[10px] text-fg2 border-b border-line">Expenses</div>
            {['-12k','-8k','-22k','-6k','-14k','-9k','-18k','-11k'].map((v, i) => (
              <div key={i} className="h-9 flex items-center justify-center text-[10px] font-medium text-warning border-b border-line">{v}</div>
            ))}
            <div className="h-9 flex items-center px-3 text-[10px] font-semibold text-fg">Balance</div>
            {['+16k','+50k','+46k','+75k','+83k','+122k','+119k','+138k'].map((v, i) => (
              <div key={i} className="h-9 flex items-center justify-center text-[10px] font-bold text-success">{v}</div>
            ))}
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden g-slide" style={{ animationDelay: '0.35s' }}>
        <div className="px-4 py-2.5 border-b border-line flex items-center justify-between"><h3 className="font-semibold text-[12px] text-fg">Projects</h3><span className="text-[10px] text-fg3">12 active</span></div>
        <div className="grid grid-cols-[1fr_100px_100px_100px_80px] bg-surface-2 h-8 items-center px-4 text-[9px] font-semibold text-fg3 tracking-[0.14em]"><span>PROJECT</span><span>ORDER</span><span>RECEIVED</span><span>PAID OUT</span><span>STATUS</span></div>
        {[['Martinez 8.4kW','$32,500','$16,250','$8,200','50%'],['Johnson 45kW','$128,000','$64,000','$42,800','50%'],['Chen 12.6kW','$48,200','$48,200','$31,400','100%'],['Davis 9.8kW','$38,400','$0','$0','0%'],['Williams 6.2kW','$24,800','$12,400','$4,200','50%']].map((r, i) => (
          <div key={i} className={`g-slide grid grid-cols-[1fr_100px_100px_100px_80px] h-[38px] items-center px-4 ${i < 4 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.4 + i * 0.05}s` }}>
            <span className="text-[11px] text-accent font-medium">{r[0]}</span>
            <span className="text-[11px] font-semibold text-fg">{r[1]}</span>
            <span className="text-[10px] text-success">{r[2]}</span>
            <span className="text-[10px] text-warning">{r[3]}</span>
            <Pill label={r[4]} tone={r[4] === '100%' ? 'success' : r[4] === '0%' ? 'neutral' : 'info'} />
          </div>
        ))}
      </Card>
    </DemoPopulated>
  );
}

export function DemoDunningView() {
  const connected = useDemoConnected();
  if (!connected) return (
    <DemoView message="Automated dunning — never chase a late payment manually again. Connect your accounting to activate smart reminders."><div /></DemoView>
  );
  return (
    <DemoPopulated message="Your dunning engine — automated reminders for overdue invoices with escalating urgency levels.">
      <Card className="overflow-hidden g-slide" style={{ animationDelay: '0.15s' }}>
        <div className="px-4 py-2.5 border-b border-line flex items-center justify-between">
          <h3 className="font-semibold text-[12px] text-fg">Dunning Automation</h3>
          <Pill label="ACTIVE" tone="success" />
        </div>
        <div className="p-4 flex flex-col gap-3">
          {[
            { days: '+7 days', label: 'Friendly Reminder', desc: 'Polite email reminder with invoice attached', sent: '12 sent this month', tone: 'bg-info/10 text-info' },
            { days: '+14 days', label: 'Reminder 1', desc: 'Second reminder with $15 late fee notice', sent: '4 sent this month', tone: 'bg-warning/10 text-warning' },
            { days: '+30 days', label: 'Reminder 2', desc: 'Final notice with $30 fee and collections warning', sent: '2 sent this month', tone: 'bg-error/10 text-error' },
            { days: '+60 days', label: 'Collections', desc: 'Manual trigger — forwarded to collections team', sent: '0 this month', tone: 'bg-surface-2 text-fg3' },
          ].map((s, i) => (
            <div key={i} className={`g-slide flex items-center gap-3 rounded-xl p-3 ${s.tone}`} style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
              <div className="w-16 text-center shrink-0"><span className="text-[11px] font-bold">{s.days}</span></div>
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-semibold block">{s.label}</span>
                <span className="text-[10px] opacity-80">{s.desc}</span>
              </div>
              <span className="text-[10px] opacity-70 shrink-0">{s.sent}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden g-slide" style={{ animationDelay: '0.35s' }}>
        <div className="px-4 py-2.5 border-b border-line flex items-center justify-between"><h3 className="font-semibold text-[12px] text-fg">Overdue Invoices</h3><span className="text-[10px] text-fg3">4 overdue</span></div>
        <div className="grid grid-cols-[80px_1fr_100px_100px_120px] bg-surface-2 h-8 items-center px-4 text-[9px] font-semibold text-fg3 tracking-[0.14em]"><span>NO.</span><span>CUSTOMER</span><span>DUE</span><span>AMOUNT</span><span>STATUS</span></div>
        {[['#0298','Smith Corp','05/15','$12,400','REMINDER 2','error'],['#0287','M. Davis','05/08','$4,200','REMINDER 1','warning'],['#0341','The Johnsons','06/01','$24,500','REMINDED','info'],['#0312','Apex Builders','05/22','$8,920','REMINDED','info']].map((r, i) => (
          <div key={i} className={`g-slide grid grid-cols-[80px_1fr_100px_100px_120px] h-[38px] items-center px-4 ${i < 3 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.4 + i * 0.05}s` }}>
            <span className="text-[10px] text-fg2">{r[0]}</span>
            <span className="text-[11px] font-medium text-fg">{r[1]}</span>
            <span className="text-[10px] text-fg3">{r[2]}</span>
            <span className="text-[11px] font-semibold text-fg">{r[3]}</span>
            <Pill label={r[4]} tone={r[5] as 'error' | 'warning' | 'info'} />
          </div>
        ))}
      </Card>
    </DemoPopulated>
  );
}

export function DemoInternalView() {
  const connected = useDemoConnected();
  if (!connected) return (
    <DemoView message="Internal costs — operating expenses, fixed costs, and supplier invoices. Connect your accounting to track everything."><div /></DemoView>
  );
  return (
    <DemoPopulated message="Your operating costs — expenses by category, monthly burn rate, and automated invoice processing.">
      <div className="grid grid-cols-4 gap-3 g-slide" style={{ animationDelay: '0.15s' }}>
        {[{ l: 'EXPENSES / MONTH', v: '$18,400', c: 'text-warning' },{ l: 'EXPENSES / YEAR', v: '$220,800' },{ l: 'BREAK-EVEN', v: '1 order', s: 'per month at avg $25k' },{ l: 'CATEGORIES', v: '6', s: '48 vouchers' }].map(k => (
          <div key={k.l} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-1"><span className="font-medium text-[10px] text-fg3 tracking-[0.14em]">{k.l}</span><span className={`font-bold text-[20px] ${k.c || 'text-fg'}`}>{k.v}</span>{k.s && <span className="text-[10px] text-fg3">{k.s}</span>}</div>
        ))}
      </div>
      <div className="flex gap-4 items-start g-slide" style={{ animationDelay: '0.25s' }}>
        <Card className="flex-1 min-w-0 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-line flex items-center justify-between"><h3 className="font-semibold text-[12px] text-fg">Expenses by Category</h3><Pill label="LIVE" tone="success" /></div>
          <div className="grid grid-cols-[1fr_100px_90px_70px] bg-surface-2 h-8 items-center px-4 text-[9px] font-semibold text-fg3 tracking-[0.14em]"><span>CATEGORY</span><span>TOTAL</span><span>AVG/MO</span><span>COUNT</span></div>
          {[['Insurance & Licensing','$14,200','$2,367','8'],['Vehicle & Fleet','$9,800','$1,633','12'],['Office & Rent','$7,200','$1,200','6'],['Tools & Equipment','$5,400','$900','9'],['Software & SaaS','$3,600','$600','7'],['Marketing','$2,800','$467','6']].map((r, i) => (
            <div key={i} className={`g-slide grid grid-cols-[1fr_100px_90px_70px] h-[38px] items-center px-4 ${i < 5 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.3 + i * 0.05}s` }}>
              <span className="text-[11px] font-medium text-fg">{r[0]}</span>
              <span className="text-[11px] font-semibold text-warning">{r[1]}</span>
              <span className="text-[10px] text-fg2">{r[2]}</span>
              <span className="text-[10px] text-fg3">{r[3]}</span>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_100px_90px_70px] h-[36px] items-center px-4 bg-surface-2 border-t border-line">
            <span className="text-[11px] font-bold text-fg">Total (48 vouchers)</span>
            <span className="text-[11px] font-bold text-warning">$43,000</span>
            <span className="text-[10px] font-semibold text-fg">$18,400</span>
            <span className="text-[10px] text-fg3">48</span>
          </div>
        </Card>
        <div className="w-[320px] shrink-0 flex flex-col gap-3">
          <Card>
            <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-info/10 flex items-center justify-center text-[11px]">📨</div>
              <div className="flex flex-col"><span className="font-semibold text-[12px] text-fg">Invoice Receipts</span><span className="text-[10px] text-fg2">Email → Expense Bot</span></div>
              <div className="ml-auto"><Pill label="ACTIVE" tone="success" /></div>
            </div>
            <div className="px-4 py-2.5 border-t border-line flex flex-col gap-1.5">
              {['n8n webhook receives emails','Extract amount & supplier','Match to project','Create expense entry'].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${i < 2 ? 'bg-success' : 'bg-accent'} shrink-0`} />
                  <span className={i < 2 ? 'text-fg2' : 'text-fg3'}>{s}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center text-[11px]">📦</div>
              <div className="flex flex-col"><span className="font-semibold text-[12px] text-fg">Delivery Confirmations</span><span className="text-[10px] text-fg2">Distributor → Customer</span></div>
              <div className="ml-auto"><Pill label="n8n" tone="info" /></div>
            </div>
            <div className="px-4 py-2.5 border-t border-line text-[10px] text-fg2 leading-[16px]">
              Distributor shipment confirmations are automatically forwarded to end customers with tracking info.
            </div>
          </Card>
        </div>
      </div>
    </DemoPopulated>
  );
}

export function DemoCalendarView() {
  const connected = useDemoConnected();
  if (!connected) return (
    <DemoView message="Your team calendar — site visits, inspections, sales calls. Connect Google Workspace to sync your schedule.">
      <div className="grid grid-cols-5 gap-2">
        {['Mon','Tue','Wed','Thu','Fri'].map(d => (
          <div key={d} className="bg-surface border border-line rounded-lg p-2 opacity-60 min-h-[80px]">
            <span className="text-[10px] font-semibold text-fg3">{d}</span>
          </div>
        ))}
      </div>
    </DemoView>
  );
  return (
    <DemoPopulated message="Your week — synced from Google Calendar. Site visits, inspections, and sales calls all in one view.">
      <div className="grid grid-cols-5 gap-2 g-slide" style={{ animationDelay: '0.15s' }}>
        {[
          { day: 'Mon', events: [{ t: '9am', e: 'Martinez — site survey', c: 'bg-accent/15 text-accent' }] },
          { day: 'Tue', events: [{ t: '10am', e: 'Johnson — install day 1', c: 'bg-success/15 text-success' },{ t: '2pm', e: 'Williams — proposal call', c: 'bg-info/15 text-info' }] },
          { day: 'Wed', events: [{ t: '8am', e: 'Johnson — install day 2', c: 'bg-success/15 text-success' }] },
          { day: 'Thu', events: [{ t: '10am', e: 'Davis — inspection', c: 'bg-warning/15 text-warning' },{ t: '3pm', e: 'Team standup', c: 'bg-accent/15 text-accent' }] },
          { day: 'Fri', events: [{ t: '11am', e: 'Chen — activation', c: 'bg-success/15 text-success' }] },
        ].map(col => (
          <div key={col.day} className="bg-surface border border-line rounded-lg p-2 flex flex-col gap-1.5 min-h-[120px]">
            <span className="text-[10px] font-semibold text-fg3">{col.day}</span>
            {col.events.map((ev, i) => (
              <div key={i} className={`rounded-md px-2 py-1.5 ${ev.c}`}>
                <span className="text-[9px] font-semibold block">{ev.t}</span>
                <span className="text-[10px] leading-tight">{ev.e}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </DemoPopulated>
  );
}
