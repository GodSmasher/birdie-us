// One-time script: fetch all existing emails from Strato IMAP and push to birdie API
const { ImapFlow } = require('imapflow');

const BIRDIE_URL = 'https://birdie-demo.vercel.app/api/netzanmeldung/emails';

const MAILBOXES = [
  { user: 'netzanmeldung@volta-energietechnik.de', pass: 'Volta_1234', label: 'netzanmeldung@volta-energietechnik.de' },
  { user: 'na@volta-energietechnik.de', pass: 'Volta_1234', label: 'na@volta-energietechnik.de' },
];

async function fetchAndPush(box) {
  console.log(`\n=== ${box.label} ===`);
  const client = new ImapFlow({
    host: 'imap.strato.de',
    port: 993,
    secure: true,
    auth: { user: box.user, pass: box.pass },
    logger: false,
  });

  try {
    await client.connect();
    const status = await client.status('INBOX', { messages: true });
    console.log(`Messages: ${status.messages}`);
    if (!status.messages) { await client.logout(); return; }

    const lock = await client.getMailboxLock('INBOX');
    let pushed = 0, skipped = 0, errors = 0;

    try {
      // Fetch ALL messages
      for await (const msg of client.fetch('1:*', { uid: true, envelope: true }, { uid: false })) {
        const env = msg.envelope;
        if (!env) continue;

        const email = {
          mailbox: box.label,
          messageId: env.messageId || `uid-${msg.uid}`,
          from: env.from?.[0]?.address || '',
          fromName: env.from?.[0]?.name || '',
          to: env.to?.[0]?.address || '',
          subject: env.subject || '',
          body: '', // no body for bulk import, Haiku classifies from subject
          date: env.date ? new Date(env.date).toISOString() : new Date().toISOString(),
        };

        try {
          const res = await fetch(BIRDIE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(email),
          });
          const result = await res.json();
          if (result.duplicate) { skipped++; }
          else if (result.stored) { pushed++; console.log(`  ✓ ${email.subject.substring(0, 60)} → ${result.category} ${result.matched_customer || ''}`); }
          else { errors++; console.log(`  ✗ ${email.subject.substring(0, 60)}: ${result.error || 'unknown'}`); }
        } catch (e) {
          errors++;
          console.log(`  ✗ Push error: ${e.message}`);
        }
      }
    } finally {
      lock.release();
    }

    console.log(`Done: ${pushed} pushed, ${skipped} duplicates, ${errors} errors`);
    await client.logout();
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

(async () => {
  for (const box of MAILBOXES) {
    await fetchAndPush(box);
  }
  console.log('\nAll done!');
})();
