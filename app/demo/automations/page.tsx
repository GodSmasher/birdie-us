'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { CrmSidebar } from '@/components/crm-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import { bots as initialBots, workflows, aiChat, aiSuggest } from '../crm-data';

interface ChatMsg {
  role: 'ai' | 'user';
  text: string;
}

/* ── Typing indicator (3 bouncing dots) ─────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-start gap-3 max-w-[80%]">
      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-bg text-[13px] shrink-0">
        &#9671;
      </div>
      <div className="bg-surface-2 border border-line rounded-xl px-4 py-2.5 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-fg3"
            style={{
              animation: 'dotBounce 1.2s infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function AutomationsPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([...aiChat]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [bots, setBots] = useState(
    initialBots.map((b) => ({ ...b, status: b.status as 'live' | 'paused' }))
  );
  const [expandedBot, setExpandedBot] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMsg = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/crm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: [...messages, userMsg],
        }),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function toggleBotStatus(botName: string) {
    setBots((prev) =>
      prev.map((b) =>
        b.name === botName
          ? { ...b, status: b.status === 'live' ? 'paused' : 'live' }
          : b
      )
    );
  }

  const liveBotCount = bots.filter((b) => b.status === 'live').length;

  return (
    <>
      <CrmSidebar active="automations" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Automations"
          subtitle={`${liveBotCount} bots live · ${workflows.length} workflows`}
        />
        <div className="flex-1 px-8 py-6 overflow-y-auto space-y-8">

          {/* -- AI Assistant ----------------------------------------- */}
          <section>
            <div className="bg-surface border border-line rounded-xl p-5">
              {/* Chat messages */}
              <div className="flex flex-col gap-3 mb-4 max-h-[360px] overflow-y-auto pr-1">
                {messages.map((msg, i) =>
                  msg.role === 'ai' ? (
                    <div key={i} className="flex items-start gap-3 max-w-[80%]">
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-bg text-[13px] shrink-0">
                        &#9671;
                      </div>
                      <div className="bg-surface-2 border border-line rounded-xl px-4 py-2.5 text-[12px] text-fg leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex items-start gap-3 max-w-[80%] self-end flex-row-reverse">
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-bg text-[11px] font-semibold shrink-0">
                        SV
                      </div>
                      <div className="bg-accent text-bg rounded-xl px-4 py-2.5 text-[12px] leading-relaxed">
                        {msg.text}
                      </div>
                    </div>
                  )
                )}
                {isTyping && <TypingDots />}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {aiSuggest.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    disabled={isTyping}
                    className="bg-surface border border-line rounded-full px-3.5 py-1.5 text-[11px] text-fg2 hover:text-fg hover:border-line-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Input bar */}
              <form onSubmit={handleSubmit} className="flex items-center bg-surface-2 border border-line rounded-xl px-4 py-2.5 gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the AI assistant..."
                  disabled={isTyping}
                  className="bg-transparent text-[12px] text-fg placeholder:text-fg4 flex-1 outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-bg text-[12px] shrink-0 disabled:opacity-30 hover:brightness-110 transition-all"
                  aria-label="Send message"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>
            </div>
          </section>

          {/* -- Active Bots ------------------------------------------ */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[14px] font-semibold text-fg">Active bots</h2>
              <span className="text-[11px] text-fg3">({bots.length})</span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {bots.map((bot) => (
                <Card
                  key={bot.name}
                  className={`p-4 flex flex-col gap-2 cursor-pointer transition-all hover:border-line-2 ${
                    expandedBot === bot.name ? 'ring-1 ring-accent/30' : ''
                  }`}
                  onClick={() =>
                    setExpandedBot(expandedBot === bot.name ? null : bot.name)
                  }
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13px]">{bot.icon}</span>
                    <span className="text-[13px] font-semibold text-fg flex-1 truncate">
                      {bot.name}
                    </span>
                    <Pill
                      label={bot.status === 'live' ? 'LIVE' : 'PAUSED'}
                      tone={bot.status === 'live' ? 'success' : 'warning'}
                      dot={false}
                    />
                  </div>
                  <p className="text-[10px] text-fg3 leading-relaxed">{bot.desc}</p>
                  <div className="flex items-center gap-3 text-[10px] text-fg4 mt-auto pt-1">
                    <span>Last run: {bot.last}</span>
                    <span>Success: {bot.rate}</span>
                    <span>Runs: {bot.runs}</span>
                  </div>

                  {expandedBot === bot.name && (
                    <div className="pt-2 mt-1 border-t border-line flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBotStatus(bot.name);
                        }}
                        className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          bot.status === 'live'
                            ? 'bg-warning-bg text-warning hover:bg-warning/20'
                            : 'bg-success-bg text-success hover:bg-success/20'
                        }`}
                      >
                        {bot.status === 'live' ? 'Pause' : 'Resume'}
                      </button>
                      <span className="text-[10px] text-fg4">
                        {bot.status === 'live' ? 'Bot is running normally' : 'Bot is currently paused'}
                      </span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>

          {/* -- Workflows -------------------------------------------- */}
          <section>
            <h2 className="text-[14px] font-semibold text-fg mb-3">Workflows</h2>

            <div className="flex flex-col gap-3">
              {workflows.map((wf) => (
                <Card key={wf.name} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[13px] font-semibold text-fg">
                      {wf.name}
                    </span>
                    <span className="bg-surface-2 border border-line rounded-full px-2.5 py-0.5 text-[10px] text-fg2">
                      Trigger: {wf.trigger}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {wf.nodes.map((node, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="bg-surface-2 border border-line rounded-lg px-3 py-2 text-[11px] text-fg">
                          {node}
                        </div>
                        {j < wf.nodes.length - 1 && (
                          <span className="text-fg3 text-[11px]">&rarr;</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
