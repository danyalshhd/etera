import { Pool } from 'pg';
import { POSTGRES_URL } from '../config';
import { BookingStatus } from '../types/BookingStatus';
import { getPool } from './postgres';

export interface BookingRow {
  id: string;
  user_id: string;
  vendor_reference: string | null;
  amount: number;
  status: BookingStatus;
  idempotency_key: string;
  retries: number;
  created_at: Date;
  updated_at: Date;
}

export const ensureSchema = async () => {
  const pool = getPool();
  if (!pool) {
    console.warn('POSTGRES_URL not configured, skipping schema creation');
    return;
  }

  await pool.query(`
    create table if not exists bookings (
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
};

export const createBooking = async (row: Omit<BookingRow, 'created_at' | 'updated_at'>): Promise<BookingRow> => {
  const pool = getPool();
  if (!pool) {
    throw new Error('Postgres not configured');
  }

  const { rows } = await pool.query(
    `insert into bookings (id, user_id, vendor_reference, amount, status, idempotency_key, retries)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning *;`,
    [row.id, row.user_id, row.vendor_reference, row.amount, row.status, row.idempotency_key, row.retries]
  );

  return rows[0];
};

export const findBookingById = async (id: string): Promise<BookingRow | null> => {
  const pool = getPool();
  if (!pool) {
    return null;
  }

  const { rows } = await pool.query(`select * from bookings where id = $1 limit 1;`, [id]);
  return rows[0] || null;
};

export const findBookingByKey = async (key: string): Promise<BookingRow | null> => {
  const pool = getPool();
  if (!pool) {
    return null;
  }

  const { rows } = await pool.query(`select * from bookings where idempotency_key = $1 limit 1;`, [key]);
  return rows[0] || null;
};

export const updateBookingStatus = async (
  id: string,
  status: BookingStatus,
  vendor_reference: string | null,
  retries: number
): Promise<BookingRow | null> => {
  const pool = getPool();
  if (!pool) {
    return null;
  }

  const { rows } = await pool.query(
    `update bookings
      set status = $2,
          vendor_reference = $3,
          retries = $4,
          updated_at = now()
     where id = $1
     returning *;`,
    [id, status, vendor_reference, retries]
  );

  return rows[0] || null;
};
