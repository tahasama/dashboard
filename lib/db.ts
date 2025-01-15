// lib/db.ts
import { Client } from 'pg';

let client: Client | null = null;

export async function getClient() {
  // Check if client is already created and connected
  if (client) {
    return client;
  }

  client = new Client({
    connectionString: process.env.DATABASE_URL, // Your connection string from Vercel
    // ssl: {
    //     rejectUnauthorized: false, // If using SSL for secure connection
    //   },
  });
  await client.connect();
  return client;
}
