import { db, closeDb } from './db.js';
const titles = [
  'Unable to reset password','Invoice shows incorrect amount','Dashboard loading slowly','Payment failed at checkout','Account verification issue',
  'Cannot download monthly report','Two-factor authentication problem','Duplicate charge on card','Email notifications not arriving','Subscription upgrade question',
  'Mobile layout issue','Export CSV contains missing rows','Customer profile update failed','API integration returning 401','Request for billing receipt',
  'Order confirmation missing','Search results are incomplete','Unable to upload attachment','Feature request: dark mode','Unexpected logout',
  'Refund status inquiry','Incorrect timezone in report','Webhook delivery delayed','User invitation not received','Data import validation error'
];
const descriptions = [
  'Customer reports this issue and needs assistance from the support team.',
  'The customer noticed unexpected behavior and provided the support team with the relevant details.',
  'Issue occurs intermittently and should be investigated with application logs.'
];
const emails = ['alex@example.com','maya@example.com','supporter@example.com','rahul@example.com','customer@example.com'];
const priorities = ['Low','Medium','High'];
const statuses = ['Open','In Progress','Resolved'];

db.prepare('DELETE FROM tickets').run();
const insert = db.prepare(`INSERT INTO tickets(title, description, customer_email, priority, status, created_at, updated_at)
VALUES(?,?,?,?,?,?,?)`);
const now = Date.now();
const seed = db.transaction(() => {
  titles.forEach((title, i) => {
    const created = new Date(now - i * 2 * 60 * 60 * 1000).toISOString();
    const status = statuses[i % statuses.length];
    const priority = priorities[(i * 2) % priorities.length];
    insert.run(title, descriptions[i % descriptions.length], emails[i % emails.length], priority, status, created, created);
  });
});
seed();
console.log(`Seeded ${titles.length} tickets.`);
closeDb();
