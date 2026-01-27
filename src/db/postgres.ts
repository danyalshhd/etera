import { Pool } from 'pg';

let pool: Pool | null = null;

export const connectToPostgres = async (connectionString: string) => {
  try {
    pool = new Pool({ connectionString });
    await pool.query('SELECT 1');
    console.log('Connected to Postgres');
  } catch (err) {
    console.error(err);
  }
};

export const getPool = (): Pool | null => {
  return pool;
};
