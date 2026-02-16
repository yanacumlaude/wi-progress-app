// scripts/ensure-wi-tickets-columns.js
// Ensures commonly used columns exist on public.wi_tickets.
// Usage: set CONNECTION_STRING env var, then run:
//   node scripts/ensure-wi-tickets-columns.js

const { Client } = require('pg');

const connectionString = process.env.CONNECTION_STRING;
if (!connectionString) {
  console.error('ERROR: set CONNECTION_STRING environment variable to your Postgres connection string.');
  process.exit(1);
}

const columns = [
  { name: 'ticket_type', sql: "text" },
  { name: 'requester_name', sql: "text" },
  { name: 'part_number', sql: "text" },
  { name: 'area', sql: "text" },
  { name: 'description', sql: "text" },
  { name: 'priority', sql: "text" },
  { name: 'status', sql: "text" },
  { name: 'process_name', sql: "text" },
  { name: 'mold_number', sql: "text" },
  { name: 'model', sql: "text" },
  { name: 'wi_process', sql: "text" },
  { name: 'location', sql: "text" },
  { name: 'created_at', sql: "timestamp with time zone DEFAULT now()" }
];

(async () => {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    for (const col of columns) {
      const sql = `ALTER TABLE public.wi_tickets ADD COLUMN IF NOT EXISTS ${col.name} ${col.sql};`;
      await client.query(sql);
      console.log(`Ensured column: ${col.name}`);
    }
    console.log('All columns ensured on public.wi_tickets.');
  } catch (err) {
    console.error('Error ensuring columns:', err.message || err);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
})();
