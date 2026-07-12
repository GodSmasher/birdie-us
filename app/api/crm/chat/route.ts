import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface ChatMessage {
  role: string;
  text: string;
}

function isDemo(): boolean {
  try {
    return cookies().get('birdie_demo')?.value === '1';
  } catch {
    return false;
  }
}

function generateReply(message: string, _history: ChatMessage[]): string {
  const msg = message.toLowerCase();

  // Pause / resume a bot
  if (msg.includes('pause') || msg.includes('resume')) {
    const botNames = [
      'AI Document Filler', 'Dunning Bot', 'Lead Enrichment',
      'Email Classifier', 'Appointment Scheduler', 'Inspection Reminder',
      'Utility Tracker', 'Reporting Bot',
    ];
    const matched = botNames.find((b) => msg.includes(b.toLowerCase()));
    if (msg.includes('pause')) {
      return matched
        ? `Done — ${matched} is paused. I'll resume it when you say so.`
        : 'Which bot would you like me to pause? You have 8 active bots: AI Document Filler, Dunning Bot, Lead Enrichment, Email Classifier, Appointment Scheduler, Inspection Reminder, Utility Tracker, and Reporting Bot.';
    }
    return matched
      ? `${matched} is back online and running. I'll monitor it for the next hour to make sure everything's smooth.`
      : 'Which bot should I resume?';
  }

  // Dunning / payment
  if (msg.includes('dunning') || msg.includes('payment') || msg.includes('overdue') || msg.includes('invoice')) {
    return 'The Dunning Bot currently sends reminders on Day 7, Day 14, and Day 30 after an invoice is due. Right now there are 2 overdue invoices: Diane Meyer ($8,360, 9 days) and The Nguyens ($9,120, 7 days). Want me to adjust the schedule or escalate any of these?';
  }

  // Workflow / add step
  if (msg.includes('workflow') || msg.includes('add step') || msg.includes('add a step')) {
    return 'You have 3 active workflows:\n\n1. Lead onboarding: Enrich → Score → Auto-Assign → Welcome Email\n2. Deal won → install: Create Project → File Permit → Order Equipment → Schedule Install\n3. IC close-out: Notify Customer → Schedule Inspection → File PTO\n\nWhich workflow do you want to modify, and what step should I add?';
  }

  // Lead / enrichment
  if (msg.includes('lead') || msg.includes('enrichment') || msg.includes('enrich')) {
    return 'The Lead Enrichment bot has processed 247 leads so far with a 94% success rate. It pulls property data (roof size, shading, utility) and enriches each record automatically when a new lead comes in from Aurora Solar or your website. 12 leads were enriched in the last batch. Want me to re-run enrichment on any specific leads?';
  }

  // Schedule / crew
  if (msg.includes('schedule') || msg.includes('crew') || msg.includes('install')) {
    return 'This week you have 4 installs, 2 site visits, and 1 inspection scheduled across 3 crews. Crew Alpha (Mike Torres) is on the Osei install Thursday. There are 4 unscheduled jobs that still need crew assignment. Want me to auto-assign them based on availability?';
  }

  // Interconnection / utility
  if (msg.includes('interconnection') || msg.includes('utility') || msg.includes('ic ') || msg.includes('pto')) {
    return 'You have 28 interconnection applications in the system. 8 are pending review, and 3 need immediate action (info requested by the utility): R. Osei (Xcel, 13 days), Amara Okafor (FPL, 11 days), and K. Alvarez (ComEd, 12 days). The Utility Tracker bot checks portals every 30 minutes. Want me to draft responses for the info requests?';
  }

  // Status
  if (msg.includes('status') || msg.includes('overview') || msg.includes('summary') || msg.includes('how are things')) {
    return 'Here’s your current status:\n\n• 8 bots running, 1 paused (Inspection Reminder)\n• 3 workflows active\n• 247 leads in pipeline, 17 open deals ($486K weighted)\n• 12 active projects, 6 installs this month\n• Revenue MTD: $127.3K (+18%)\n• 3 IC apps need action\n\nAnything you want me to dig into?';
  }

  // Help / capabilities
  if (msg.includes('help') || msg.includes('what can you') || msg.includes('what do you')) {
    return 'I can help you with:\n\n• Pause, resume, or configure any bot\n• Modify workflow steps and triggers\n• Check lead enrichment and pipeline status\n• Review crew schedules and assign jobs\n• Track interconnection applications\n• Adjust dunning and payment reminders\n• Generate reports and summaries\n\nJust tell me what you need!';
  }

  // Explain / how does
  if (msg.includes('explain') || msg.includes('how does') || msg.includes('what is') || msg.includes('tell me about')) {
    if (msg.includes('filler') || msg.includes('document')) {
      return 'The AI Document Filler automatically populates interconnection forms using your project data — customer info, system specs, site details, and utility requirements. It has a 98% success rate across 412 runs. When it can’t fill a field, it flags it for manual review. Want me to show you its recent activity?';
    }
    if (msg.includes('email') || msg.includes('classifier')) {
      return 'The Email Classifier reads incoming emails and auto-tags them by category (Utility Response, Customer Question, Payment, Team, System Alert). It routes urgent items to the top of your inbox and can auto-reply to common questions. 1,308 emails processed with 96% accuracy.';
    }
    return 'Sure — what would you like me to explain? I can tell you about any bot, workflow, or process in your system.';
  }

  // Default
  return 'I can help with that. Would you like me to adjust a bot, modify a workflow, or pull up specific data?';
}

export async function POST(req: Request) {
  if (!isDemo()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { message, history } = body as { message: string; history: ChatMessage[] };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    // Small random delay to feel realistic (300-800ms)
    const delay = 300 + Math.floor(Math.random() * 500);
    await new Promise((r) => setTimeout(r, delay));

    const reply = generateReply(message, history || []);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
