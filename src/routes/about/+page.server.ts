import type { PageServerLoad } from './$types';
import { pgAdapter } from '$lib/server/lucia/adapter';
import { testAdapter } from '@lucia-auth/adapter-test';
import type { LuciaQueryHandler, TestUserSchema } from '@lucia-auth/adapter-test';
import type { SessionSchema, KeySchema } from 'lucia-auth';
import { LuciaError } from 'lucia-auth';
import { users, authKeys, authSessions } from '$lib/schema';
import db from '$lib/server/database/db';

const queryHandler: LuciaQueryHandler = {
  user: {
    get: async () => {
      return await db.select().from(users);
    },
    insert: async (data: TestUserSchema) => {
      await db.insert(users).values(data);
    },
    clear: async () => {
      await db.delete(users);
    },
  },
  session: {
    get: async () => {
      return await db.select().from(authSessions);
    },
    insert: async (data: SessionSchema) => {
      await db.insert(authSessions).values(
        data as {
          id: string;
          active_expires: number;
          user_id: string;
          idle_expires: number;
        },
      );
    },
    clear: async () => {
      await db.delete(authSessions);
    },
  },
  key: {
    get: async () => {
      return await db.select().from(authKeys);
    },
    insert: async (data: KeySchema) => {
      await db.insert(authKeys).values(data);
    },
    clear: async () => {
      await db.delete(authKeys);
    },
  },
};

async function test() {
  const adapter = pgAdapter({
    db: db,
    users: users,
    sessions: authSessions,
    keys: authKeys,
    type: 'pg',
  })(LuciaError);
  await testAdapter(adapter, queryHandler, false);
}

export const load: PageServerLoad = async () => {
  await test();
};
