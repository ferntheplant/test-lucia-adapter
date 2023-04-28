import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const client = new Pool({
	connectionString: 'postgresql://admin:password123@localhost:5432/deftly'
});

export const db = drizzle(client, { logger: true });

export default db;
