'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { Card, KpiCard, Pill } from './ui';

// ============ DUOLINGO-STYLE CSS ============
export function GuideStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      /* === SPRING BOUNCE === */
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
      @keyframes heroEntrance {
        0% { opacity: 0; transform: translateX(-60px) scale(0.6) rotate(-15deg); }
        40% { opacity: 1; transform: translateX(12px) scale(1.1) rotate(5deg); }
        60% { transform: translateX(-4px) scale(0.97) rotate(-2deg); }
        80% { transform: translateX(2px) scale(1.01) rotate(1deg); }
        100% { transform: translateX(0) scale(1) rotate(0deg); }
      }
      /* === BIRDIE ANIMATIONS === */
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
      /* === SPARKLE & CONFETTI === */
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1) rotate(180deg); }
      }
      @keyframes confettiFall {
        0% { opacity: 1; transform: translateY(0) rotate(0deg); }
        100% { opacity: 0; transform: translateY(120px) rotate(720deg); }
      }
      @keyframes confettiPop {
        0% { transform: scale(0); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
      }
      @keyframes ringPulse {
        0% { transform: scale(0.8); opacity: 0.6; }
        50% { transform: scale(1.2); opacity: 0; }
        100% { transform: scale(0.8); opacity: 0; }
      }
      /* === UI EFFECTS === */
      @keyframes shimmerWave {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes borderGlow {
        0%, 100% { border-color: rgba(250, 204, 21, 0.06); box-shadow: 0 0 0 0 rgba(250,204,21,0); }
        50% { border-color: rgba(250, 204, 21, 0.3); box-shadow: 0 0 20px 2px rgba(250,204,21,0.06); }
      }
      @keyframes barGrow {
        from { width: 0; }
      }
      @keyframes numberCount {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes typingDots {
        0%, 20% { content: '.'; }
        40% { content: '..'; }
        60%, 100% { content: '...'; }
      }
      @keyframes pulseScale {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes wiggle {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-3deg); }
        75% { transform: rotate(3deg); }
      }
      /* === CLASSES === */
      .g-spring { animation: springIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      .g-spring-pop { animation: springPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      .g-slide { animation: slideUpBounce 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) both; }
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
      .g-number { animation: numberCount 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
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
        <div
          key={i}
          className="absolute w-2 h-2"
          style={{
            left: `${15 + (i * 70 / count)}%`,
            top: `${10 + ((i * 37) % 60)}%`,
            animation: `sparkle 2s ease-in-out ${0.3 * i}s infinite`,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M4 0L4.8 3.2L8 4L4.8 4.8L4 8L3.2 4.8L0 4L3.2 3.2Z" fill="var(--accent)" opacity="0.5" />
          </svg>
        </div>
      ))}
    </div>
  );
}

// ============ BIRDIE CHARACTER (BIGGER, EXPRESSIVE) ============
export function BirdieChar({ size = 40, pose = 'default' }: { size?: number; pose?: 'default' | 'wave' | 'point' | 'celebrate' }) {
  const waveArm = pose === 'wave' ? 'g-wave' : pose === 'celebrate' ? 'g-wave' : '';
  const bodyBounce = pose === 'celebrate' ? 'g-hop' : '';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={bodyBounce}>
      {/* Shadow */}
      <ellipse cx="24" cy="44" rx="10" ry="2" fill="var(--accent)" opacity="0.1" />
      {/* Body */}
      <ellipse cx="24" cy="26" rx="14" ry="13" fill="var(--accent)" />
      {/* Belly lighter */}
      <ellipse cx="24" cy="30" rx="9" ry="7" fill="var(--accent)" opacity="0.5" />
      {/* Eyes - big Duolingo style */}
      <g className="g-blink">
        <circle cx="18" cy="22" r="4.5" fill="white" />
        <circle cx="30" cy="22" r="4.5" fill="white" />
        <circle cx="19.2" cy="21.5" r="2.2" fill="#1a1a2e" />
        <circle cx="31.2" cy="21.5" r="2.2" fill="#1a1a2e" />
        {/* Eye shine */}
        <circle cx="20" cy="20.5" r="0.8" fill="white" />
        <circle cx="32" cy="20.5" r="0.8" fill="white" />
      </g>
      {/* Beak - bigger, rounder */}
      <path d="M21 27 L24 31 L27 27" fill="#F97316" strokeLinejoin="round" />
      {/* Blush */}
      <circle cx="13" cy="28" r="3" fill="#F97316" opacity="0.15" />
      <circle cx="35" cy="28" r="3" fill="#F97316" opacity="0.15" />
      {/* Left wing */}
      <g className="g-wing" style={{ transformOrigin: '12px 26px' }}>
        <ellipse cx="9" cy="26" rx="6" ry="4.5" fill="var(--accent)" opacity="0.6" transform="rotate(-10 9 26)" />
      </g>
      {/* Right wing - wave pose */}
      <g className={waveArm} style={{ transformOrigin: '36px 22px' }}>
        {pose === 'wave' || pose === 'celebrate' ? (
          <ellipse cx="39" cy="18" rx="6" ry="4.5" fill="var(--accent)" opacity="0.6" transform="rotate(-45 39 18)" />
        ) : pose === 'point' ? (
          <ellipse cx="40" cy="24" rx="7" ry="3.5" fill="var(--accent)" opacity="0.6" transform="rotate(-5 40 24)" />
        ) : (
          <ellipse cx="39" cy="26" rx="6" ry="4.5" fill="var(--accent)" opacity="0.6" transform="rotate(10 39 26)" />
        )}
      </g>
      {/* Head tufts */}
      <path d="M20 14 L17 6" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 14 L31 6" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="17" cy="5" r="2.5" fill="var(--accent)" />
      <circle cx="31" cy="5" r="2.5" fill="var(--accent)" />
      {/* Celebrate stars */}
      {pose === 'celebrate' && (
        <>
          <circle cx="6" cy="12" r="1.5" fill="var(--accent)" opacity="0.6" style={{ animation: 'sparkle 1.5s ease-in-out 0s infinite' }} />
          <circle cx="42" cy="10" r="1.5" fill="var(--accent)" opacity="0.6" style={{ animation: 'sparkle 1.5s ease-in-out 0.3s infinite' }} />
          <circle cx="10" cy="6" r="1" fill="#F97316" opacity="0.5" style={{ animation: 'sparkle 1.5s ease-in-out 0.6s infinite' }} />
        </>
      )}
      {/* Feet */}
      <ellipse cx="20" cy="39" rx="3.5" ry="1.5" fill="#F97316" opacity="0.4" />
      <ellipse cx="28" cy="39" rx="3.5" ry="1.5" fill="#F97316" opacity="0.4" />
    </svg>
  );
}

// ============ WELCOME HERO (BIG, ANIMATED) ============
export function BirdieWelcome({ title, message }: { title: string; message: string }) {
  return (
    <div className="relative flex items-start gap-6 mb-1">
      <Sparkles count={5} />
      <div className="g-hero shrink-0 w-20 h-20 rounded-3xl bg-accent/10 border-2 border-accent/20 flex items-center justify-center relative">
        <BirdieChar size={56} pose="wave" />
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center" style={{ animation: 'springPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.8s both' }}>
          <span className="text-bg text-[8px] font-bold">!</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 pt-1 min-w-0">
        <h2 className="g-slide text-xl font-bold text-fg tracking-tight" style={{ animationDelay: '0.3s' }}>{title}</h2>
        <div className="g-slide relative bg-surface-2 border border-accent/15 rounded-2xl px-5 py-4 max-w-[580px]" style={{ animationDelay: '0.5s' }}>
          <div className="absolute -left-2 top-5 w-3.5 h-3.5 bg-surface-2 border-l border-b border-accent/15 rotate-45" />
          <p className="text-[13px] text-fg2 leading-relaxed relative z-10">
            <Typewriter text={message} delay={700} speed={18} />
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ INLINE ANNOTATION (BOUNCY) ============
export function BirdieNote({ message, delay = 0, step, pose = 'point' }: { message: string; delay?: number; step?: number; pose?: 'default' | 'wave' | 'point' | 'celebrate' }) {
  return (
    <div className="g-spring flex items-center gap-3" style={{ animationDelay: `${delay}s` }}>
      <div className="g-float shrink-0 w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
        <BirdieChar size={24} pose={pose} />
      </div>
      {step != null && (
        <span className="g-spring-pop shrink-0 w-6 h-6 rounded-full bg-accent text-bg text-[11px] font-bold flex items-center justify-center shadow-lg shadow-accent/20" style={{ animationDelay: `${delay + 0.15}s` }}>
          {step}
        </span>
      )}
      <div className="g-slide relative bg-surface-2/80 backdrop-blur-sm border border-accent/12 rounded-2xl px-4 py-2.5 max-w-[500px] shadow-sm" style={{ animationDelay: `${delay + 0.1}s` }}>
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-surface-2/80 border-l border-b border-accent/12 rotate-45" />
        <p className="text-[11.5px] text-fg2 leading-[17px] relative z-10">{message}</p>
      </div>
    </div>
  );
}

// ============ CTA (PULSING) ============
export function ConnectCTA({ tool, href = '/connectors' }: { tool: string; href?: string }) {
  return (
    <div className="g-spring flex flex-col items-center gap-4 py-6" style={{ animationDelay: '1.4s' }}>
      <div className="flex items-center gap-3">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent/20" />
        <BirdieChar size={32} pose="celebrate" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent/20" />
      </div>
      <a href={href} className="g-pulse group relative flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-accent text-bg font-bold text-[14px] shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:scale-105 transition-all">
        <span>Connect {tool}</span>
        <span className="group-hover:translate-x-1.5 transition-transform text-lg">&rarr;</span>
      </a>
      <p className="text-[11px] text-fg3">Takes less than 2 minutes &middot; No credit card needed</p>
    </div>
  );
}

// ============ GHOST SECTION (GLOWING) ============
function GhostSection({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <div className="g-slide g-glow g-ghost g-shimmer rounded-xl relative" style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

// ============ ANIMATED FUNNEL BAR ============
function FunnelBar({ label, value, max, color = 'bg-accent', delay = 0 }: { label: string; value: number; max: number; color?: string; delay?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-fg3 w-[100px] truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
        <div className={`g-bar h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%`, animationDelay: `${delay}s` }} />
      </div>
      <span className="g-number text-[10px] font-medium text-fg w-5 text-right" style={{ animationDelay: `${delay}s` }}>{value}</span>
    </div>
  );
}

// ============ SAMPLE BOT ROW ============
function BotRow({ name, status, delay = 0 }: { name: string; status: 'live' | 'setup'; delay?: number }) {
  return (
    <div className="g-slide flex items-center gap-2.5" style={{ animationDelay: `${delay}s` }}>
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${status === 'live' ? 'bg-success g-pulse' : 'bg-warning'}`} />
      <span className="text-[12px] text-fg2 flex-1">{name}</span>
      <span className={`text-[9px] font-bold tracking-wider uppercase ${status === 'live' ? 'text-success' : 'text-warning'}`}>
        {status === 'live' ? 'LIVE' : 'SETUP'}
      </span>
    </div>
  );
}

// ============ SAMPLE KANBAN COLUMN ============
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
          <div key={c} className="g-slide bg-surface border border-line rounded-lg px-3 py-2.5 hover:border-accent/20 transition-colors cursor-default" style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
            <p className="text-[11px] text-fg2 leading-tight whitespace-pre-line">{c}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ EMAIL ROW ============
function EmailRow({ from, subject, tag, tagTone, delay = 0 }: { from: string; subject: string; tag: string; tagTone: 'success' | 'info' | 'warning' | 'accent'; delay?: number }) {
  return (
    <div className="g-slide flex items-center gap-3 px-4 py-2.5 border-b border-line" style={{ animationDelay: `${delay}s` }}>
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
function SampleConnector({ name, cat, connected, delay = 0 }: { name: string; cat: string; connected: boolean; delay?: number }) {
  return (
    <div className="g-spring bg-surface border border-line rounded-xl p-4 flex flex-col gap-2.5 hover:border-accent/20 transition-colors" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center font-semibold text-xs text-fg">
          {name.slice(0, 2)}
        </div>
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
//  PAGE GUIDES — Duolingo-style inline walkthroughs
// ════════════════════════════════════════════════════════

// ──────── DASHBOARD ────────
export function DashboardGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 h-[calc(100vh-64px)] overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Welcome to .birdie"
        message="Hey there! I'm birdie — the transparency layer for your solar business. Let me walk you through what this dashboard looks like once your tools are connected. Everything here updates in real-time."
      />

      <BirdieNote message="Real-time KPIs pulled live from your CRM — pipeline value, win rate, and interconnection status at a glance." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        <div className="grid grid-cols-4 gap-3 p-1">
          <div className="flex-1 min-w-[180px] bg-surface border border-line rounded-xl p-5 flex flex-col gap-2">
            <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">PIPELINE</span>
            <div className="font-semibold text-[28px] leading-none tracking-tightest text-fg g-number" style={{ animationDelay: '0.8s' }}>
              <Counter end={125400} prefix="$" duration={1800} />
            </div>
            <span className="text-[11px] text-fg3">18 open deals</span>
          </div>
          <div className="flex-1 min-w-[180px] bg-surface border border-line rounded-xl p-5 flex flex-col gap-2">
            <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">WON</span>
            <div className="font-semibold text-[28px] leading-none tracking-tightest text-success g-number" style={{ animationDelay: '1s' }}>
              <Counter end={48200} prefix="$" duration={1500} />
            </div>
            <span className="text-[11px] text-fg3">7 closed</span>
          </div>
          <div className="flex-1 min-w-[180px] bg-surface border border-line rounded-xl p-5 flex flex-col gap-2">
            <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">CLOSE RATE</span>
            <div className="font-semibold text-[28px] leading-none tracking-tightest text-success g-number" style={{ animationDelay: '1.2s' }}>
              <Counter end={32} suffix="%" duration={1200} />
            </div>
            <span className="text-[11px] text-fg3">7/22</span>
          </div>
          <div className="flex-1 min-w-[180px] bg-surface border border-line rounded-xl p-5 flex flex-col gap-2">
            <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">INTERCONNECTION</span>
            <div className="font-semibold text-[28px] leading-none tracking-tightest text-fg g-number" style={{ animationDelay: '1.4s' }}>
              <Counter end={12} duration={1000} />
            </div>
            <span className="text-[11px] text-fg3">4 in review &middot; 3 submitted</span>
          </div>
        </div>
      </GhostSection>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <BirdieNote message="Smart insights flag what needs your attention — overdue proposals, upcoming inspections, bot errors." delay={0.8} step={2} />
          <GhostSection delay={0.9}>
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
                <div key={i} className={`g-slide flex items-start gap-2.5 px-4 py-2.5 ${i < 2 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${1.0 + i * 0.15}s` }}>
                  <span className="text-sm g-wiggle" style={{ animationDelay: `${1.2 + i * 0.3}s` }}>{r.icon}</span>
                  <p className={`text-[11px] leading-[16px] ${r.tone}`}>{r.msg}</p>
                </div>
              ))}
            </Card>
          </GhostSection>

          <BirdieNote message="Pipeline funnel and lead sources — know exactly where your deals stand and which channels perform." delay={1.2} step={3} />
          <GhostSection delay={1.3}>
            <Card className="p-4 flex flex-col gap-3">
              <h3 className="font-semibold text-[12px] text-fg">Pipeline & Leads</h3>
              <div className="flex flex-col gap-1.5">
                <FunnelBar label="New Lead" value={45} max={45} delay={1.5} />
                <FunnelBar label="Contacted" value={28} max={45} delay={1.6} />
                <FunnelBar label="Proposal Sent" value={15} max={45} delay={1.7} />
                <FunnelBar label="Negotiation" value={8} max={45} delay={1.8} />
                <FunnelBar label="Won" value={7} max={45} color="bg-success" delay={1.9} />
              </div>
            </Card>
          </GhostSection>
        </div>

        <div className="flex flex-col gap-4">
          <BirdieNote message="Calendar events and interconnection pipeline — synced from Google Calendar and utility portals." delay={0.9} step={4} />
          <GhostSection delay={1.0}>
            <Card className="overflow-hidden">
              <div className="px-4 py-2.5 border-b border-line">
                <h3 className="font-semibold text-[12px] text-fg">Schedule & Interconnection</h3>
              </div>
              <div className="px-4 py-3 border-b border-line flex gap-4">
                {[
                  { label: 'Open', n: 3, c: 'text-fg3' },
                  { label: 'Review', n: 4, c: 'text-warning' },
                  { label: 'Approved', n: 2, c: 'text-info' },
                  { label: 'PTO', n: 3, c: 'text-success' },
                ].map((s, i) => (
                  <div key={s.label} className="text-center g-spring-pop" style={{ animationDelay: `${1.1 + i * 0.1}s` }}>
                    <div className={`text-[18px] font-bold ${s.c}`}><Counter end={s.n} duration={800} /></div>
                    <div className="text-[9px] text-fg4">{s.label}</div>
                  </div>
                ))}
              </div>
              {[
                { t: 'Site Survey — Johnson', d: 'Tomorrow 2pm', icon: '🏠' },
                { t: 'Installation — Williams', d: 'Thu 8am', icon: '🔧' },
                { t: 'Inspection — Chen', d: 'Fri 10am', icon: '✅' },
              ].map((e, i) => (
                <div key={i} className={`g-slide flex gap-3 px-4 py-2.5 ${i < 2 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${1.3 + i * 0.12}s` }}>
                  <div className="w-7 h-7 rounded-lg bg-info-bg flex items-center justify-center text-xs">{e.icon}</div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-fg">{e.t}</span>
                    <span className="text-[10px] text-fg3">{e.d}</span>
                  </div>
                </div>
              ))}
            </Card>
          </GhostSection>

          <BirdieNote message="Your automation army — bots run 24/7 in the background. CRM sync, doc filling, dunning, email routing." delay={1.3} step={5} pose="celebrate" />
          <GhostSection delay={1.4}>
            <Card className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-[12px] text-fg">Bots & System</h3>
                <Pill label="ALL ONLINE" tone="success" />
              </div>
              <BotRow name="CRM Sync Bot" status="live" delay={1.5} />
              <BotRow name="Document Filler AI" status="live" delay={1.6} />
              <BotRow name="Dunning Bot" status="live" delay={1.7} />
              <BotRow name="Email Classifier" status="live" delay={1.8} />
              <BotRow name="Fleet Monitor" status="setup" delay={1.9} />
            </Card>
          </GhostSection>
        </div>
      </div>

      <ConnectCTA tool="Aurora Solar" />
    </div>
  );
}

// ──────── SALES ────────
export function SalesGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Your Sales Pipeline"
        message="This is where your sales pipeline lives. Once connected, every deal, every rep, and every lead source shows up here — live from your CRM. No manual entry, ever."
      />

      <BirdieNote message="Five KPIs that matter — pipeline value, closed-won, lost, close rate, and total leads. Updated every hour from your CRM." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        <div className="grid grid-cols-5 gap-3 p-1">
          {[
            { label: 'PIPELINE', val: 245000, pre: '$', color: '' },
            { label: 'WON', val: 92400, pre: '$', color: 'text-success' },
            { label: 'LOST', val: 18600, pre: '$', color: 'text-error' },
            { label: 'CLOSE RATE', val: 38, suf: '%', color: 'text-success' },
            { label: 'LEADS', val: 156, color: '' },
          ].map((k, i) => (
            <div key={k.label} className="flex-1 min-w-[140px] bg-surface border border-line rounded-xl p-4 flex flex-col gap-1.5">
              <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{k.label}</span>
              <div className={`font-semibold text-[24px] leading-none tracking-tightest ${k.color || 'text-fg'}`}>
                <Counter end={k.val} prefix={k.pre || ''} suffix={k.suf || ''} duration={1500 + i * 200} />
              </div>
            </div>
          ))}
        </div>
      </GhostSection>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="flex flex-col gap-4">
          <BirdieNote message="Every deal in a sortable, searchable table — customer, system size, value, status, rep. Click any row for details." delay={0.7} step={2} />
          <GhostSection delay={0.8}>
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                <h3 className="font-semibold text-[13px] text-fg">Recent Offers</h3>
                <span className="text-[10px] text-fg3">50 of 156</span>
              </div>
              <div className="grid grid-cols-[1fr_80px_100px_120px_100px] bg-surface-2 h-8 items-center px-4 text-[9px] font-semibold text-fg3 tracking-[0.14em]">
                <span>CUSTOMER</span><span>SIZE</span><span>VALUE</span><span>STATUS</span><span>REP</span>
              </div>
              {[
                ['Martinez Residence', '8.4 kW', '$32,500', 'Proposal Sent', 'J. Miller'],
                ['Johnson Commercial', '45 kW', '$128,000', 'Negotiation', 'S. Parker'],
                ['Williams Home', '6.2 kW', '$24,800', 'New Lead', 'M. Chen'],
                ['Chen Duplex', '12.6 kW', '$48,200', 'Won', 'J. Miller'],
                ['Davis Property', '9.8 kW', '$38,400', 'Site Survey', 'S. Parker'],
                ['Brown Residence', '7.1 kW', '$28,600', 'Proposal Sent', 'M. Chen'],
              ].map((row, i) => (
                <div key={i} className={`g-slide grid grid-cols-[1fr_80px_100px_120px_100px] h-[38px] items-center px-4 ${i < 5 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.9 + i * 0.08}s` }}>
                  <span className="text-[11px] text-accent font-medium truncate">{row[0]}</span>
                  <span className="text-[10px] text-fg2">{row[1]}</span>
                  <span className="text-[11px] font-semibold text-fg">{row[2]}</span>
                  <span className="text-[10px] text-fg2">{row[3]}</span>
                  <span className="text-[10px] text-fg3">{row[4]}</span>
                </div>
              ))}
            </Card>
          </GhostSection>
        </div>

        <div className="flex flex-col gap-4">
          <BirdieNote message="Visual funnel — see where deals get stuck and identify bottlenecks instantly." delay={1.0} step={3} />
          <GhostSection delay={1.1}>
            <Card className="p-4 flex flex-col gap-2">
              <h3 className="font-semibold text-[12px] text-fg mb-1">Status Funnel</h3>
              <FunnelBar label="New Lead" value={45} max={45} delay={1.3} />
              <FunnelBar label="Site Survey" value={32} max={45} delay={1.4} />
              <FunnelBar label="Proposal" value={22} max={45} delay={1.5} />
              <FunnelBar label="Negotiation" value={12} max={45} delay={1.6} />
              <FunnelBar label="Won" value={14} max={45} color="bg-success" delay={1.7} />
              <FunnelBar label="Lost" value={4} max={45} color="bg-error" delay={1.8} />
            </Card>
          </GhostSection>

          <BirdieNote message="Lead source breakdown — know which channels bring the best leads and optimize spend." delay={1.3} step={4} />
          <GhostSection delay={1.4}>
            <Card className="p-4 flex flex-col gap-2">
              <h3 className="font-semibold text-[12px] text-fg mb-1">Lead Sources</h3>
              <FunnelBar label="Google Ads" value={48} max={48} color="bg-success" delay={1.6} />
              <FunnelBar label="Referral" value={35} max={48} color="bg-success" delay={1.7} />
              <FunnelBar label="Door-to-Door" value={28} max={48} color="bg-success" delay={1.8} />
              <FunnelBar label="Website" value={24} max={48} color="bg-success" delay={1.9} />
              <FunnelBar label="EnergySage" value={21} max={48} color="bg-success" delay={2.0} />
            </Card>
          </GhostSection>

          <BirdieNote message="Leaderboard — see who's closing. Compare reps by revenue and close rate." delay={1.6} step={5} pose="celebrate" />
          <GhostSection delay={1.7}>
            <Card className="p-4 flex flex-col gap-2">
              <h3 className="font-semibold text-[12px] text-fg mb-1">Sales Reps (3)</h3>
              {[
                { name: 'John Miller', won: 6, val: '$42,800' },
                { name: 'Sarah Parker', won: 5, val: '$38,200' },
                { name: 'Mike Chen', won: 3, val: '$11,400' },
              ].map((s, i) => (
                <div key={s.name} className="g-slide flex items-center justify-between text-[11px] py-0.5" style={{ animationDelay: `${1.8 + i * 0.1}s` }}>
                  <span className="text-accent truncate flex-1">{s.name}</span>
                  <span className="text-fg3 mx-2">{s.won} won</span>
                  <span className="text-success font-semibold">{s.val}</span>
                </div>
              ))}
            </Card>
          </GhostSection>
        </div>
      </div>

      <ConnectCTA tool="your CRM" href="/connectors" />
    </div>
  );
}

// ──────── INTERCONNECTION ────────
export function InterconnectionGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Interconnection Tracking"
        message="The interconnection nightmare? Over. I track every project from utility application through PTO. No more spreadsheets, no more portal-checking — just a clean Kanban board."
      />

      <BirdieNote message="Interconnection KPIs — total active projects, by stage, average days to PTO. All calculated live." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        <div className="grid grid-cols-5 gap-3 p-1">
          {[
            { label: 'ACTIVE', val: 12, color: '' },
            { label: 'UNDER REVIEW', val: 4, color: 'text-warning' },
            { label: 'APPROVED', val: 3, color: 'text-info' },
            { label: 'PTO', val: 8, color: 'text-success' },
            { label: 'AVG DAYS', val: 23, color: '' },
          ].map((k, i) => (
            <div key={k.label} className="flex-1 bg-surface border border-line rounded-xl p-4 flex flex-col gap-1.5">
              <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{k.label}</span>
              <div className={`font-semibold text-[28px] leading-none tracking-tightest ${k.color || 'text-fg'}`}>
                <Counter end={k.val} duration={1000 + i * 200} />
              </div>
            </div>
          ))}
        </div>
      </GhostSection>

      <BirdieNote message="Kanban board — drag projects between stages. Filter by utility, installer, or timeline." delay={0.7} step={2} />
      <GhostSection delay={0.8}>
        <div className="bg-surface border border-line rounded-xl p-4 overflow-x-auto">
          <div className="flex gap-3 min-w-[900px]">
            <KanbanCol title="Application" count={3} color="bg-fg3" cards={['Johnson 12.6kW\nOncor · 2 days', 'Williams 6.2kW\nAEP Texas · 1 day', 'Brown 9.8kW\nCenterPoint · 3 days']} />
            <KanbanCol title="Under Review" count={2} color="bg-warning" cards={['Davis 8.4kW\nOncor · 12 days', 'Garcia 15kW\nTNMP · 8 days']} />
            <KanbanCol title="Approved" count={2} color="bg-info" cards={['Martinez 8.4kW\nOncor · Approved', 'Lee 10.2kW\nAEP · Approved']} />
            <KanbanCol title="Inspection" count={1} color="bg-accent" cards={['Chen 12.6kW\nScheduled Fri']} />
            <KanbanCol title="PTO" count={3} color="bg-success" cards={['Thompson 7.1kW\nPTO 06/12', 'Wilson 9.4kW\nPTO 06/08', 'Moore 6.8kW\nPTO 06/05']} />
          </div>
        </div>
      </GhostSection>

      <BirdieNote message="Bot auto-fills utility apps from project data — NEC 690, single-line diagrams, site plans. Zero copy-pasting." delay={1.1} step={3} pose="celebrate" />
      <GhostSection delay={1.2}>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-xl g-wiggle">🤖</div>
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-[13px] font-semibold text-fg">Interconnection Bot</span>
            <span className="text-[11px] text-fg2">Auto-fills applications, monitors utility portals, tracks status changes</span>
          </div>
          <Pill label="WILL ACTIVATE" tone="accent" />
        </Card>
      </GhostSection>

      <ConnectCTA tool="your CRM" href="/connectors" />
    </div>
  );
}

// ──────── FLEET ────────
export function FleetGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Fleet Monitoring"
        message="Every system you've installed, in one dashboard. I pull live production data from your inverter clouds — if something underperforms, you'll know before the customer calls."
      />

      <BirdieNote message="Fleet-wide KPIs — total systems, installed capacity, uptime, and active alerts." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        <div className="grid grid-cols-4 gap-3 p-1">
          {[
            { label: 'SYSTEMS', val: 47, suf: '', color: '' },
            { label: 'CAPACITY', val: 423, suf: ' kW', color: '' },
            { label: 'UPTIME', val: 99, suf: '.2%', color: 'text-success' },
            { label: 'ALERTS', val: 2, suf: '', color: 'text-warning' },
          ].map((k, i) => (
            <div key={k.label} className="flex-1 bg-surface border border-line rounded-xl p-4 flex flex-col gap-1.5">
              <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{k.label}</span>
              <div className={`font-semibold text-[28px] leading-none tracking-tightest ${k.color || 'text-fg'}`}>
                <Counter end={k.val} suffix={k.suf} duration={1200 + i * 200} />
              </div>
            </div>
          ))}
        </div>
      </GhostSection>

      <BirdieNote message="Each system card shows live production, daily yield, and status. Click for performance history." delay={0.7} step={2} />
      <GhostSection delay={0.8}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Martinez Residence', kw: '8.4 kW', prod: '6.2 kW now', status: 'Online', tone: 'success' as const },
            { name: 'Johnson Commercial', kw: '45 kW', prod: '38.1 kW now', status: 'Online', tone: 'success' as const },
            { name: 'Chen Duplex', kw: '12.6 kW', prod: '0 kW', status: 'Alert', tone: 'warning' as const },
            { name: 'Williams Home', kw: '6.2 kW', prod: '5.1 kW now', status: 'Online', tone: 'success' as const },
            { name: 'Davis Property', kw: '9.8 kW', prod: '7.4 kW now', status: 'Online', tone: 'success' as const },
            { name: 'Brown Residence', kw: '7.1 kW', prod: '5.8 kW now', status: 'Online', tone: 'success' as const },
          ].map((s, i) => (
            <Card key={s.name} className="g-spring p-4 flex flex-col gap-2" style={{ animationDelay: `${0.9 + i * 0.1}s` }}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-fg truncate">{s.name}</span>
                <Pill label={s.status.toUpperCase()} tone={s.tone} />
              </div>
              <div>
                <div className="text-[18px] font-bold text-fg">{s.prod}</div>
                <span className="text-[10px] text-fg3">{s.kw} installed</span>
              </div>
            </Card>
          ))}
        </div>
      </GhostSection>

      <BirdieNote message="Performance alerts fire when a system drops below expected yield — before the customer calls." delay={1.1} step={3} />
      <GhostSection delay={1.2}>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning-bg flex items-center justify-center text-xl g-wiggle">⚠️</div>
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-[13px] font-semibold text-fg">Chen Duplex — Production Alert</span>
            <span className="text-[11px] text-fg2">System producing 0 kW. Expected: 9.2 kW. Possible inverter issue.</span>
          </div>
        </Card>
      </GhostSection>

      <ConnectCTA tool="SolarEdge or Enphase" href="/connectors" />
    </div>
  );
}

// ──────── INBOX ────────
export function InboxGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Smart Inbox"
        message="Remember that approval email from the utility that got buried in your inbox? Never again. I scan, categorize, and match every email to the right project automatically."
      />

      <BirdieNote message="Emails auto-categorized and matched to the right project by address, permit #, or customer name." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        <Card className="overflow-hidden">
          <div className="px-4 py-2.5 border-b border-line flex items-center gap-3">
            <h3 className="font-semibold text-[12px] text-fg">Inbox</h3>
            <Pill label="12 NEW" tone="accent" />
          </div>
          <EmailRow from="Oncor Electric" subject="Interconnection Application Approved — Martinez #IC-2024-1847" tag="UTILITY" tagTone="success" delay={0.7} />
          <EmailRow from="Sarah Martinez" subject="Re: Solar installation timeline question" tag="CUSTOMER" tagTone="info" delay={0.8} />
          <EmailRow from="CED Greentech" subject="Order #4821 shipped — tracking inside" tag="VENDOR" tagTone="warning" delay={0.9} />
          <EmailRow from="Duke Energy" subject="Inspection scheduled — Johnson property 06/20" tag="UTILITY" tagTone="success" delay={1.0} />
          <EmailRow from="Mike Chen" subject="Updated proposal for the Williams project" tag="INTERNAL" tagTone="accent" delay={1.1} />
        </Card>
      </GhostSection>

      <BirdieNote message="Attachments auto-filed to the right project folder. Full-text search across everything." delay={0.9} step={2} pose="celebrate" />
      <GhostSection delay={1.0}>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-xl g-wiggle">📎</div>
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-[13px] font-semibold text-fg">3 attachments auto-filed today</span>
            <span className="text-[11px] text-fg2">Interconnection approval (Martinez) &middot; Shipping manifest (CED) &middot; Inspection notice (Johnson)</span>
          </div>
        </Card>
      </GhostSection>

      <ConnectCTA tool="Google Workspace" href="/connectors" />
    </div>
  );
}

// ──────── TEAM ────────
export function TeamGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Team Management"
        message="Your team at a glance. Invite members, assign roles, control who sees what. Sales reps see their pipeline, installers see the fleet, admins see everything."
      />

      <BirdieNote message="User cards with role, last active, and team. Invite new members by email in seconds." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Sarah Vogel', role: 'Owner', team: 'Admin', active: 'Online' },
            { name: 'John Miller', role: 'Sales Rep', team: 'Sales West', active: '2h ago' },
            { name: 'Sarah Parker', role: 'Sales Rep', team: 'Sales East', active: '4h ago' },
            { name: 'Mike Chen', role: 'Project Mgr', team: 'Operations', active: '1h ago' },
            { name: 'Lisa Torres', role: 'Installer', team: 'Crew A', active: 'Yesterday' },
          ].map((u, i) => (
            <Card key={u.name} className="g-spring p-4 flex items-center gap-3" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                {u.name.split(' ').map(w => w[0]).join('')}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-semibold text-fg truncate">{u.name}</span>
                <span className="text-[10px] text-fg3">{u.role} &middot; {u.team}</span>
                <span className="text-[9px] text-fg4">{u.active}</span>
              </div>
            </Card>
          ))}
          <Card className="g-spring p-4 flex items-center justify-center border-dashed border-accent/20 cursor-pointer hover:bg-accent/5 transition-colors" style={{ animationDelay: '1.1s' }}>
            <span className="text-accent text-[13px] font-medium g-pulse">+ Invite Member</span>
          </Card>
        </div>
      </GhostSection>

      <BirdieNote message="Role-based access control — sales reps see their deals, installers see fleet, admins see everything." delay={0.9} step={2} />
      <GhostSection delay={1.0}>
        <Card className="p-4">
          <h3 className="font-semibold text-[12px] text-fg mb-3">Permissions</h3>
          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <span className="text-fg3 font-semibold">ROLE</span><span className="text-fg3 font-semibold">SALES</span><span className="text-fg3 font-semibold">FLEET</span><span className="text-fg3 font-semibold">FINANCE</span>
            <span className="text-fg2">Owner</span><span className="text-success">Full</span><span className="text-success">Full</span><span className="text-success">Full</span>
            <span className="text-fg2">Sales Rep</span><span className="text-success">Own deals</span><span className="text-fg4">&mdash;</span><span className="text-fg4">&mdash;</span>
            <span className="text-fg2">Installer</span><span className="text-fg4">&mdash;</span><span className="text-success">Assigned</span><span className="text-fg4">&mdash;</span>
          </div>
        </Card>
      </GhostSection>

      <ConnectCTA tool="your team" href="/team" />
    </div>
  );
}

// ──────── CATALOG ────────
export function CatalogGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Product Catalog"
        message="Your entire product catalog — modules, inverters, batteries — with pricing and spec sheets. Import once, use everywhere: proposals, BOMs, margin calculations."
      />

      <BirdieNote message="Searchable component database. Set retail/wholesale prices and calculate margins per project." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'REC Alpha Pure-R 430W', cat: 'Module', price: '$185' },
            { name: 'SolarEdge SE10000H', cat: 'Inverter', price: '$1,420' },
            { name: 'Tesla Powerwall 3', cat: 'Battery', price: '$8,500' },
            { name: 'Enphase IQ8+', cat: 'Microinverter', price: '$195' },
            { name: 'IronRidge XR100', cat: 'Racking', price: '$45' },
            { name: 'Span Smart Panel', cat: 'Electrical', price: '$4,200' },
          ].map((p, i) => (
            <Card key={p.name} className="g-spring p-4 flex flex-col gap-2" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
              <div className="w-full h-20 rounded-lg bg-surface-2 flex items-center justify-center text-2xl">☀️</div>
              <span className="text-[12px] font-semibold text-fg truncate">{p.name}</span>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-fg3">{p.cat}</span>
                <span className="text-[13px] font-bold text-accent">{p.price}</span>
              </div>
            </Card>
          ))}
        </div>
      </GhostSection>

      <ConnectCTA tool="your catalog" href="/katalog" />
    </div>
  );
}

// ──────── CALENDAR ────────
export function CalendarGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Calendar"
        message="Site surveys, installations, inspections — all synced from your calendar. I'll remind you about AHJ inspections and utility deadlines so nothing slips."
      />

      <BirdieNote message="All events synced and color-coded: surveys, installations, inspections, meetings." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        <Card className="overflow-hidden">
          <div className="px-4 py-2.5 border-b border-line flex items-center justify-between">
            <h3 className="font-semibold text-[12px] text-fg">This Week</h3>
            <Pill label="6 EVENTS" tone="info" />
          </div>
          {[
            { day: 'Mon', t: 'Site Survey — Anderson Property', time: '9:00 AM', icon: '🏠', c: 'bg-info-bg' },
            { day: 'Tue', t: 'Installation — Williams 6.2kW', time: '8:00 AM', icon: '🔧', c: 'bg-accent-bg' },
            { day: 'Wed', t: 'Team Meeting — Pipeline Review', time: '2:00 PM', icon: '👥', c: 'bg-surface-2' },
            { day: 'Thu', t: 'Installation — Davis 9.8kW', time: '8:00 AM', icon: '🔧', c: 'bg-accent-bg' },
            { day: 'Fri', t: 'AHJ Inspection — Chen Duplex', time: '10:00 AM', icon: '✅', c: 'bg-success-bg' },
            { day: 'Fri', t: 'Utility Deadline — Martinez PTO docs', time: '5:00 PM', icon: '⚠️', c: 'bg-warning-bg' },
          ].map((e, i) => (
            <div key={i} className={`g-slide flex items-center gap-3 px-4 py-3 ${i < 5 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
              <span className="text-[10px] font-bold text-fg3 w-8">{e.day}</span>
              <div className={`w-7 h-7 rounded-lg ${e.c} flex items-center justify-center text-xs`}>{e.icon}</div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[11px] font-medium text-fg truncate">{e.t}</span>
                <span className="text-[10px] text-fg3">{e.time}</span>
              </div>
            </div>
          ))}
        </Card>
      </GhostSection>

      <ConnectCTA tool="Google Calendar" href="/connectors" />
    </div>
  );
}

// ──────── FILES ────────
export function FilesGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Files & Documents"
        message="All your documents in one place — proposals, permits, datasheets, contracts. Organized by project and synced with your cloud drive."
      />

      <BirdieNote message="Project folders auto-created for each deal. Proposals, contracts, permits, photos — all per project." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: 'Martinez Residence', files: 8, icon: '📁' },
            { name: 'Johnson Commercial', files: 12, icon: '📁' },
            { name: 'Williams Home', files: 5, icon: '📁' },
            { name: 'Chen Duplex', files: 15, icon: '📁' },
            { name: 'Templates', files: 6, icon: '📋' },
            { name: 'Spec Sheets', files: 24, icon: '📄' },
            { name: 'Contracts', files: 9, icon: '📝' },
          ].map((f, i) => (
            <Card key={f.name} className="g-spring p-4 flex items-center gap-3" style={{ animationDelay: `${0.6 + i * 0.08}s` }}>
              <span className="text-xl">{f.icon}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-medium text-fg truncate">{f.name}</span>
                <span className="text-[10px] text-fg3">{f.files} files</span>
              </div>
            </Card>
          ))}
          <Card className="g-spring p-4 flex items-center justify-center border-dashed border-accent/20" style={{ animationDelay: '1.2s' }}>
            <span className="text-accent text-[12px] font-medium g-pulse">+ New Folder</span>
          </Card>
        </div>
      </GhostSection>

      <ConnectCTA tool="Google Drive" href="/connectors" />
    </div>
  );
}

// ──────── FINANCE ────────
export function FinanceGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Finance & Dunning"
        message="I automate your invoicing and collections. No more chasing overdue payments — the dunning bot handles escalation for you."
      />

      <BirdieNote message="Live invoice metrics from your accounting software." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        <div className="grid grid-cols-4 gap-3 p-1">
          {[
            { label: 'OPEN', val: 84200, pre: '$', color: '' },
            { label: 'OVERDUE', val: 12400, pre: '$', color: 'text-error' },
            { label: 'COLLECTED', val: 156800, pre: '$', color: 'text-success' },
            { label: 'OUTSTANDING', val: 7, pre: '', color: 'text-warning' },
          ].map((k, i) => (
            <div key={k.label} className="flex-1 bg-surface border border-line rounded-xl p-4 flex flex-col gap-1.5">
              <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{k.label}</span>
              <div className={`font-semibold text-[28px] leading-none tracking-tightest ${k.color || 'text-fg'}`}>
                <Counter end={k.val} prefix={k.pre} duration={1500 + i * 200} />
              </div>
            </div>
          ))}
        </div>
      </GhostSection>

      <BirdieNote message="Full invoice table — customer, amount, due date, status. Overdue highlighted automatically." delay={0.7} step={2} />
      <GhostSection delay={0.8}>
        <Card className="overflow-hidden">
          <div className="px-4 py-2.5 border-b border-line flex items-center justify-between">
            <h3 className="font-semibold text-[12px] text-fg">Recent Invoices</h3>
            <Pill label="3 OVERDUE" tone="error" />
          </div>
          <div className="grid grid-cols-[1fr_100px_100px_100px] bg-surface-2 h-8 items-center px-4 text-[9px] font-semibold text-fg3 tracking-[0.14em]">
            <span>CUSTOMER</span><span>AMOUNT</span><span>DUE</span><span>STATUS</span>
          </div>
          {[
            ['Martinez Residence', '$16,250', 'Jun 10', 'Overdue', 'text-error'],
            ['Johnson Commercial', '$64,000', 'Jun 15', 'Due Soon', 'text-warning'],
            ['Chen Duplex', '$24,100', 'Jun 08', 'Overdue', 'text-error'],
            ['Williams Home', '$12,400', 'Jun 20', 'Sent', 'text-fg2'],
            ['Davis Property', '$19,200', 'May 28', 'Paid', 'text-success'],
          ].map((row, i) => (
            <div key={i} className={`g-slide grid grid-cols-[1fr_100px_100px_100px] h-[38px] items-center px-4 ${i < 4 ? 'border-b border-line' : ''}`} style={{ animationDelay: `${0.9 + i * 0.08}s` }}>
              <span className="text-[11px] text-accent font-medium">{row[0]}</span>
              <span className="text-[11px] font-semibold text-fg">{row[1]}</span>
              <span className="text-[10px] text-fg3">{row[2]}</span>
              <span className={`text-[10px] font-medium ${row[4]}`}>{row[3]}</span>
            </div>
          ))}
        </Card>
      </GhostSection>

      <BirdieNote message="Automated dunning — reminders on a schedule. Escalation: friendly, firm, final notice. You set the rules." delay={1.1} step={3} pose="celebrate" />
      <GhostSection delay={1.2}>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-xl g-wiggle">💸</div>
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-[13px] font-semibold text-fg">Dunning Bot</span>
            <span className="text-[11px] text-fg2">2 reminders sent today &middot; Next: Martinez final notice in 3 days</span>
          </div>
          <Pill label="ACTIVE" tone="success" />
        </Card>
      </GhostSection>

      <ConnectCTA tool="QuickBooks" href="/connectors" />
    </div>
  );
}

// ──────── BOTS ────────
export function BotsGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Automation Bots"
        message="These are your tireless helpers. Each bot handles a specific job — syncing your CRM, filing documents, chasing invoices. They run 24/7 so you don't have to."
      />

      <BirdieNote message="Each bot shows what it does, how often it runs, today's count, and success rate. Click for logs." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'CRM Sync Bot', cat: 'CRM', desc: 'Pulls leads, deals, contacts from your CRM every hour.', runs: 24, rate: '100%', status: 'LIVE', tone: 'success' as const },
            { name: 'Document Filler', cat: 'PRJ', desc: 'Auto-fills interconnection forms and permit applications.', runs: 8, rate: '97%', status: 'LIVE', tone: 'success' as const },
            { name: 'Dunning Bot', cat: 'FIN', desc: 'Payment reminders. Escalates: reminder, warning, collections.', runs: 3, rate: '100%', status: 'LIVE', tone: 'success' as const },
            { name: 'Email Classifier', cat: 'KOM', desc: 'Scans emails, routes: utility, customer, vendor, internal.', runs: 156, rate: '94%', status: 'LIVE', tone: 'success' as const },
            { name: 'Fleet Monitor', cat: 'IOT', desc: 'Checks inverter APIs for underperforming systems.', runs: 48, rate: '100%', status: 'SETUP', tone: 'warning' as const },
            { name: 'Enrichment Bot', cat: 'CRM', desc: 'Fills missing data — utility lookup, AHJ rules, NEC reqs.', runs: 12, rate: '91%', status: 'LIVE', tone: 'success' as const },
          ].map((b, i) => (
            <Card key={b.name} className="g-spring p-5 flex flex-col gap-3" style={{ animationDelay: `${0.6 + i * 0.12}s` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center">
                  <span className="text-accent font-semibold text-[9px] tracking-[0.18em]">{b.cat}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-[13px] text-fg truncate">{b.name}</span>
                </div>
                <div className="ml-auto"><Pill label={b.status} tone={b.tone} /></div>
              </div>
              <p className="text-[11px] text-fg2 leading-[16px] flex-1">{b.desc}</p>
              <div className="border-t border-line pt-2.5 flex items-center justify-between text-[10px]">
                <span className="text-fg3">Today: <Counter end={b.runs} duration={1000} /> runs</span>
                <span className="text-fg3">Success {b.rate}</span>
              </div>
            </Card>
          ))}
        </div>
      </GhostSection>

      <BirdieNote message="Bots activate automatically when you connect data sources. The more you connect, the more they do." delay={1.0} step={2} pose="celebrate" />

      <ConnectCTA tool="your data sources" href="/connectors" />
    </div>
  );
}

// ──────── WORKFLOWS ────────
export function WorkflowsGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Workflows"
        message="Workflows chain bots and connectors into end-to-end automations. Won deal? Automatically create interconnection app, schedule install, notify customer. All automatic."
      />

      <BirdieNote message="Each workflow shows trigger, steps, and connectors used. Activate templates or build custom." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        {[
          { cat: 'CRM & Projects', items: [
            { name: 'Deal → Project', trigger: 'Won deal in CRM', desc: 'Creates project, imports customer data, triggers interconnection flow.', conns: 'CRM → .birdie → Utility Portal' },
            { name: 'Lead Enrichment', trigger: 'New lead created', desc: 'Auto-fills utility, AHJ rules, NEC requirements from address.', conns: 'CRM → Enrichment API' },
          ]},
          { cat: 'Finance', items: [
            { name: 'Invoice on Milestone', trigger: 'Project stage change', desc: 'Generates invoice when project hits deposit, rough-in, or final.', conns: 'CRM → QuickBooks' },
            { name: 'Overdue Escalation', trigger: 'Invoice 7+ days overdue', desc: 'Reminder sequence: friendly, firm, final notice.', conns: 'QuickBooks → Email' },
          ]},
          { cat: 'Communication', items: [
            { name: 'Customer Updates', trigger: 'Stage change', desc: 'Emails customer at each milestone: filed, approved, inspection, PTO.', conns: 'Portal → Email' },
            { name: 'Team Alerts', trigger: 'Various', desc: 'Slack for urgent, email digest for routine, SMS for emergencies.', conns: 'All → Slack/Email/SMS' },
          ]},
        ].map((group, gi) => (
          <div key={group.cat} className="flex flex-col gap-3 mb-4">
            <h3 className="g-slide font-semibold text-[13px] text-fg" style={{ animationDelay: `${0.6 + gi * 0.3}s` }}>{group.cat}</h3>
            <div className="grid grid-cols-2 gap-3">
              {group.items.map((w, wi) => (
                <Card key={w.name} className="g-spring p-4 flex flex-col gap-2.5" style={{ animationDelay: `${0.7 + gi * 0.3 + wi * 0.1}s` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-accent text-sm g-wiggle" style={{ animationDelay: `${1 + gi * 0.3}s` }}>&rarr;</div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[12px] text-fg">{w.name}</span>
                      <span className="text-[10px] text-fg3">{w.trigger}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-fg2 leading-[16px]">{w.desc}</p>
                  <div className="border-t border-line pt-2 text-[10px] text-fg3">{w.conns}</div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </GhostSection>

      <ConnectCTA tool="your tools" href="/connectors" />
    </div>
  );
}

// ──────── CONNECTORS ────────
export function ConnectorsGuide() {
  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-auto">
      <GuideStyles />
      <BirdieWelcome
        title="Connectors"
        message="Connectors bridge .birdie and your existing tools. Each one syncs data in real-time — no more copy-pasting between systems. Set them up here."
      />

      <BirdieNote message="Click any connector to set up. Green dot = live, gray = available. The more you connect, the more birdie can do." delay={0.3} step={1} />
      <GhostSection delay={0.5}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-[13px] text-fg">Available Connectors</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SampleConnector name="Aurora Solar" cat="CRM &middot; Proposals" connected={false} delay={0.6} />
            <SampleConnector name="Salesforce" cat="CRM &middot; Pipeline" connected={false} delay={0.7} />
            <SampleConnector name="Google Workspace" cat="Email &middot; Calendar &middot; Drive" connected={false} delay={0.8} />
            <SampleConnector name="QuickBooks" cat="Accounting" connected={false} delay={0.9} />
            <SampleConnector name="SolarEdge" cat="Monitoring &middot; Fleet" connected={false} delay={1.0} />
            <SampleConnector name="Enphase" cat="Monitoring &middot; Fleet" connected={false} delay={1.1} />
            <SampleConnector name="HubSpot" cat="CRM &middot; Marketing" connected={false} delay={1.2} />
            <SampleConnector name="Stripe" cat="Payments" connected={false} delay={1.3} />
          </div>
        </div>
      </GhostSection>

      <BirdieNote message="Each connector unlocks automation bots and workflow templates. Here's what lights up:" delay={0.9} step={2} pose="celebrate" />
      <GhostSection delay={1.0}>
        <Card className="p-4 flex flex-col gap-3">
          <h3 className="font-semibold text-[12px] text-fg">What unlocks with connections</h3>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              { conn: 'CRM (Aurora/Salesforce)', unlocks: 'Sales Pipeline, Lead Analytics, Team Leaderboard' },
              { conn: 'Email (Google/Outlook)', unlocks: 'Smart Inbox, Email Matching, Attachment Filing' },
              { conn: 'Accounting (QuickBooks)', unlocks: 'Invoice Dashboard, Dunning Bot, Cash Flow' },
              { conn: 'Monitoring (SolarEdge)', unlocks: 'Fleet Dashboard, Performance Alerts' },
            ].map((r, i) => (
              <div key={r.conn} className="g-spring flex flex-col gap-1 p-3 rounded-lg bg-surface-2/50" style={{ animationDelay: `${1.1 + i * 0.1}s` }}>
                <span className="text-accent font-medium">{r.conn}</span>
                <span className="text-fg3 text-[10px]">{r.unlocks}</span>
              </div>
            ))}
          </div>
        </Card>
      </GhostSection>
    </div>
  );
}
