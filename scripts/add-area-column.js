// scripts/add-area-column.js
// Usage: set your Postgres connection string in the CONNECTION_STRING environment variable,
// then run: node scripts/add-area-column.js

const { Client } = require('pg');

const connectionString = process.env.CONNECTION_STRING;

if (!connectionString) {
  console.error('ERROR: set CONNECTION_STRING environment variable to your Postgres connection string.');
  process.exit(1);
}

(async () => {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const res = await client.query(`ALTER TABLE public.wi_tickets ADD COLUMN IF NOT EXISTS area text;`);
    console.log('ALTER TABLE executed. Column `area` ensured on table `wi_tickets`.');
  } catch (err) {
    console.error('Failed to ensure column `area`:', err.message || err);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
})();
