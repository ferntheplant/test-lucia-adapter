import { pgTable, text, bigint, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').notNull().primaryKey(),
  username: text('username').notNull(),
});

export const authSessions = pgTable('auth_sessions', {
  id: text('id').primaryKey().notNull(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  active_expires: bigint('active_expires', { mode: 'number' }).notNull(),
  idle_expires: bigint('idle_expires', { mode: 'number' }).notNull(),
  country: text('country'),
});

export const authKeys = pgTable('auth_keys', {
  id: text('id').primaryKey().notNull(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  hashed_password: text('hashed_password'),
});
