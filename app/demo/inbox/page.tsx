'use client';

import { useState } from 'react';
import { CrmSidebar } from '@/components/crm-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import { messages, inboxTabs, getTagTone, getCatColor } from '../crm-data';

// export const metadata = { title: 'birdie — Inbox' };
// metadata export not supported in client components — set via layout or <title> if needed

export default function InboxPage() {
  const [inboxSel, setInboxSel] = useState(0);
  const [activeTab, setActiveTab] = useState('All');
  const msg = messages[inboxSel];

  return (
    <>
      <CrmSidebar active="inbox" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Inbox" subtitle="Unified communication · 3 unread" />

        {/* Tabs row */}
        <div className="flex items-center gap-1 px-8 pt-4 pb-2">
          {inboxTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-8 px-3 text-[12px] font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-surface-2 text-fg'
                  : 'text-fg3 hover:text-fg2 hover:bg-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Split view */}
        <div className="flex-1 flex min-h-0">
          {/* Left panel — message list */}
          <div className="w-[400px] shrink-0 border-r border-line overflow-y-auto">
            {messages.map((m, i) => (
              <div
                key={i}
                onClick={() => setInboxSel(i)}
                className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer border-b border-line transition-colors ${
                  inboxSel === i
                    ? 'bg-surface-2 border-l-2 border-l-accent'
                    : 'hover:bg-surface'
                }`}
              >
                {/* Unread dot */}
                <div className="pt-2">
                  <div
                    className={`w-2 h-2 rounded-full bg-info ${
                      m.read ? 'opacity-0' : ''
                    }`}
                  />
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-surface-3 flex items-center justify-center text-fg2 text-[11px] font-semibold shrink-0">
                  {m.init}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[12px] font-medium text-fg truncate">
                      {m.sender}
                    </span>
                    <span className="ml-auto text-[10px] text-fg4 shrink-0">
                      {m.time}
                    </span>
                  </div>
                  <p
                    className={`text-[12px] truncate mb-0.5 ${
                      m.read ? 'text-fg2' : 'text-fg font-semibold'
                    }`}
                  >
                    {m.subject}
                  </p>
                  <p className="text-[11px] text-fg3 truncate mb-1.5">
                    {m.preview}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium ${getCatColor(m.cat)}`}>
                      {m.cat}
                    </span>
                    <Pill
                      label={m.tag}
                      tone={getTagTone(m.tag) as any}
                      dot={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right panel — thread view */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Context chip */}
            <div className="px-6 pt-5 pb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 rounded-full text-[11px] text-fg2 font-medium">
                {msg.ctx}
              </span>
            </div>

            {/* Thread bubbles */}
            <div className="flex-1 overflow-y-auto px-6 py-2 flex flex-col gap-5">
              {/* Sender message */}
              <div className="max-w-[520px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-fg2 text-[10px] font-semibold">
                    {msg.init}
                  </div>
                  <span className="text-[12px] font-medium text-fg">
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-fg4">{msg.time}</span>
                </div>
                <div className="bg-surface-2 border border-line rounded-xl px-4 py-3">
                  <p className="text-[13px] text-fg leading-relaxed">
                    {msg.preview}
                  </p>
                </div>
              </div>

              {/* Reply message */}
              <div className="max-w-[520px] self-end">
                <div className="flex items-center gap-2 mb-1.5 justify-end">
                  <span className="text-[10px] text-fg4">just now</span>
                  <span className="text-[12px] font-medium text-fg">
                    Sarah Vogel
                  </span>
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-bg text-[10px] font-semibold">
                    SV
                  </div>
                </div>
                <div className="bg-accent text-bg rounded-xl px-4 py-3">
                  <p className="text-[13px] leading-relaxed">
                    Thanks for reaching out — pulling up the details now and will
                    get right back to you.
                  </p>
                </div>
              </div>
            </div>

            {/* Reply input */}
            <div className="px-6 py-4 border-t border-line">
              <div className="flex items-end gap-3">
                <textarea
                  placeholder="Reply..."
                  rows={2}
                  className="flex-1 bg-surface border border-line rounded-lg px-3 py-2 text-[13px] text-fg placeholder:text-fg4 resize-none focus:outline-none focus:border-accent transition-colors"
                />
                <button className="h-9 px-4 bg-accent text-bg text-[12px] font-semibold rounded-lg hover:opacity-90 transition-opacity shrink-0">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
