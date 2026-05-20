import Link from 'next/link';
import { Brand } from '@/components/ui';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-[600px] flex-col bg-surface border-r border-line p-[60px]">
        <Brand />

        <div className="flex-1" />

        <div className="flex flex-col gap-6">
          <h1 className="font-semibold text-[36px] leading-[44px] tracking-tightest text-fg whitespace-pre-line">
            {`Eine Plattform.\nAlle Tools verbunden.\nKein BS.`}
          </h1>
          <p className="text-sm leading-[22px] text-fg2 max-w-[460px]">
            Bots, Connectoren und Automationen — eingerichtet von uns, kontrolliert von dir. Persönliches Onboarding inklusive.
          </p>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4 text-[11px] text-fg3">
          <span>EU-gehostet · DSGVO</span>
          <span className="text-fg4">·</span>
          <span>2FA Pflicht</span>
          <span className="text-fg4">·</span>
          <span>v1.0</span>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center bg-bg p-6">
        <div className="w-full max-w-[420px] flex flex-col gap-7 px-2 lg:px-10 py-10">
          <div className="lg:hidden">
            <Brand />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="font-semibold text-2xl tracking-tightest text-fg">Willkommen zurück</h2>
            <p className="text-[13px] text-fg2">Melde dich mit deiner Firmen-Mail an</p>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-fg2">E-Mail</label>
              <div className="h-11 bg-surface border border-line-2 rounded-[10px] px-3.5 flex items-center">
                <span className="text-[13px] text-fg">sarah@alpen-energie.ch</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center">
                <label className="text-xs font-medium text-fg2">Passwort</label>
                <span className="ml-auto text-xs font-medium text-accent">Vergessen?</span>
              </div>
              <div className="h-11 bg-surface border border-line-2 rounded-[10px] px-3.5 flex items-center">
                <span className="text-base text-fg tracking-widest">••••••••••••</span>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="h-[46px] bg-accent text-bg rounded-[10px] flex items-center justify-center gap-2 font-semibold text-sm hover:brightness-95"
            >
              Weiter <span className="font-bold">→</span>
            </Link>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-line" />
              <span className="text-[11px] text-fg3">oder</span>
              <div className="flex-1 h-px bg-line" />
            </div>

            <button className="h-[46px] bg-surface border border-line-2 rounded-[10px] flex items-center justify-center gap-2 font-medium text-[13px] text-fg">
              <span className="text-accent font-bold text-[13px]">✦</span> Magic-Link per E-Mail erhalten
            </button>
          </div>

          <div className="flex flex-col items-center gap-1.5 mt-2">
            <span className="text-xs text-fg3">Noch keinen Zugang?</span>
            <span className="text-xs font-medium text-accent">Schreib direkt an sarah@birdie.app</span>
          </div>
        </div>
      </div>
    </div>
  );
}
