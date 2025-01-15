import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Your connection string
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined, // Enable SSL for production
});

export async function query(text: string, params: any[] = []) {
  const client = await pool.connect(); // Get a client from the pool
  try {
    const result = await client.query(text, params); // Perform the query
    return result;
  } finally {
    client.release(); // Release the client back to the pool
  }
}
