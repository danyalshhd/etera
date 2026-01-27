import { connectToPostgres } from '../db/postgres';
import { getPool } from '../db/postgres';

beforeAll(async () => {
  const testDbUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/etera_db';
  await connectToPostgres(testDbUrl);

  const pool = getPool();
  if (pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id uuid primary key,
        user_id text not null,
        vendor_reference text,
        amount numeric not null,
        status text not null,
        idempotency_key text unique not null,
        retries integer not null default 0,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `);
  }
});

beforeEach(async () => {
  const pool = getPool();
  if (pool) {
    await pool.query('DELETE FROM bookings;');
  }
});
