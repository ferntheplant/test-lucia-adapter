import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { users, authKeys, authSessions } from '../../schema';

export type AuthUserTable = typeof users;

export type AuthSessionTable = typeof authSessions;

export type AuthKeyTable = typeof authKeys;

export type DrizzleAdapterOptions = {
  db: PostgresJsDatabase;
  users: AuthUserTable;
  keys: AuthKeyTable;
  sessions: AuthSessionTable;
  type: 'pg';
};
