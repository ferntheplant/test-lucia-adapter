import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres('postgresql://admin:password123@localhost:5432/deftly');

export const db = drizzle(client, { logger: false });

export default db;
