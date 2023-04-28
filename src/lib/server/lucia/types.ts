import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { users, authKeys, authSessions } from '../../schema';

export type AuthUserTable = typeof users;

export type AuthSessionTable = typeof authSessions;

export type AuthKeyTable = typeof authKeys;

export type DrizzleAdapterOptions = {
	db: NodePgDatabase;
	users: AuthUserTable;
	keys: AuthKeyTable;
	sessions: AuthSessionTable;
	type: 'pg';
};
