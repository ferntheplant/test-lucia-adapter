import { eq } from 'drizzle-orm';
import type { Adapter, InitializeAdapter } from 'lucia';

import type { DrizzleAdapterOptions } from '$lib/server/lucia/types';
import {
  FK_VIOLATION_CODE,
  UNIQUE_VIOLATION_CODE,
  isConstraintError,
} from '$lib/utils/is-constraint-error';

// TODO: split up user and session adapter to use Redis for sessions
export const pgAdapter =
  ({ db, users, sessions, keys }: DrizzleAdapterOptions): InitializeAdapter<Adapter> =>
  (LuciaError) => {
    const adapter = {
      async deleteKeysByUserId(userId) {
        await db.delete(keys).where(eq(keys.user_id, userId));
      },
      async deleteSession(sessionId) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
      },
      async deleteSessionsByUserId(userId) {
        await db.delete(sessions).where(eq(sessions.user_id, userId));
      },
      async deleteUser(userId) {
        await db.delete(users).where(eq(users.id, userId));
      },
      async getKeysByUserId(userId) {
        return await db.select().from(keys).where(eq(keys.user_id, userId));
      },
      async getKey(keyId) {
        const [key] = await db.select().from(keys).where(eq(keys.id, keyId));
        return key ?? null;
      },
      async getSession(sessionId) {
        const [session] = await db
          .select()
          .from(sessions)
          .where(eq(sessions.id, sessionId))
          .limit(1);
        return session ?? null;
      },
      async updateSession(keyId, partialKey) {
        const updatedSessions = await db
          .update(sessions)
          .set(partialKey)
          .where(eq(sessions.id, keyId))
          .returning();

        if (updatedSessions.length === 0) {
          throw new LuciaError('AUTH_INVALID_SESSION_ID');
        }
      },
      async getSessionsByUserId(userId) {
        return db.select().from(sessions).where(eq(sessions.user_id, userId));
      },
      async getUser(userId) {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        return user ?? null;
      },
      async setKey(key) {
        try {
          await db.insert(keys).values(key);
        } catch (err) {
          if (isConstraintError(err, FK_VIOLATION_CODE)) {
            throw new LuciaError('AUTH_INVALID_USER_ID');
          }
          if (isConstraintError(err, UNIQUE_VIOLATION_CODE)) {
            throw new LuciaError('AUTH_DUPLICATE_KEY_ID');
          }
          throw err;
        }
      },
      async setSession(session) {
        try {
          await db.insert(sessions).values(session);
        } catch (err) {
          if (isConstraintError(err, FK_VIOLATION_CODE)) {
            throw new LuciaError('AUTH_INVALID_USER_ID');
          }
          throw err;
        }
      },
      async setUser(user, key) {
        if (!key) {
          await db.insert(users).values(user).returning();
          return;
        }
        try {
          await db.transaction(async (tx) => {
            await tx.insert(users).values(user).returning();
            await tx.insert(keys).values(key);
          });
        } catch (err) {
          if (isConstraintError(err, UNIQUE_VIOLATION_CODE)) {
            throw new LuciaError('AUTH_DUPLICATE_KEY_ID');
          }
          throw err;
        }
      },
      async updateUser(userId, attributes) {
        const updatedUsers = await db
          .update(users)
          .set(attributes)
          .where(eq(users.id, userId))
          .returning();

        if (updatedUsers.length === 0) {
          throw new LuciaError('AUTH_INVALID_USER_ID');
        }
      },
      async updateKey(keyId, partialKey) {
        const updatedKeys = await db
          .update(keys)
          .set(partialKey)
          .where(eq(keys.id, keyId))
          .returning();

        if (updatedKeys.length === 0) {
          throw new LuciaError('AUTH_INVALID_KEY_ID');
        }
      },
      async deleteKey(keyId) {
        await db.delete(keys).where(eq(keys.id, keyId));
      },
    } satisfies Adapter;

    return adapter;
  };
