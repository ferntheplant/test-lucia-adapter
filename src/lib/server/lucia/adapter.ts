import type { Adapter, AdapterFunction } from 'lucia-auth';
import { eq, and } from 'drizzle-orm';
import type { DrizzleAdapterOptions } from '$lib/server/lucia/types';
import { users } from '$lib/schema';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

const newUserValidator = createInsertSchema(users, {
	id: z.string(),
	username: z.string()
});

export const pgAdapter =
	({ db, users, sessions, keys }: DrizzleAdapterOptions): AdapterFunction<Adapter> =>
	(LuciaError) => {
		const adapter = {
			async deleteKeysByUserId(userId) {
				await db.delete(keys).where(eq(keys.user_id, userId)).execute();
			},
			async deleteSession(sessionId) {
				await db.delete(sessions).where(eq(sessions.id, sessionId)).execute();
			},
			async deleteNonPrimaryKey(key) {
				await db
					.delete(keys)
					.where(and(eq(keys.id, key), eq(keys.primary_key, false)))
					.execute();
			},
			async deleteSessionsByUserId(userId) {
				await db.delete(sessions).where(eq(sessions.user_id, userId)).execute();
			},
			async deleteUser(userId) {
				await db.delete(users).where(eq(users.id, userId)).execute();
			},
			async getKeysByUserId(userId) {
				return await db.select().from(keys).where(eq(keys.user_id, userId)).execute();
			},
			async getKey(keyId, shouldDataBeDeleted) {
				const key = (await db.select().from(keys).where(eq(keys.id, keyId)).execute())[0];

				if (await shouldDataBeDeleted(key)) {
					await db.delete(keys).where(eq(keys.id, keyId)).execute();
				}
				return key;
			},
			async getSession(sessionId) {
				return (await db.select().from(sessions).where(eq(sessions.id, sessionId)).execute())[0];
			},
			async getSessionsByUserId(userId) {
				return db.select().from(sessions).where(eq(sessions.user_id, userId)).execute();
			},
			async getUser(userId) {
				const res = await db.select().from(users).where(eq(users.id, userId)).execute();
				return res.length === 0 ? null : res[0];
			},
			async setKey(key) {
				try {
					await db.insert(keys).values(key).execute();
				} catch (e) {
					if (typeof e === 'object' && e !== null && 'code' in e && e.code === '23503') {
						throw new LuciaError('AUTH_INVALID_USER_ID');
					}
					if (typeof e === 'object' && e !== null && 'code' in e && e.code === '23505') {
						throw new LuciaError('AUTH_DUPLICATE_KEY_ID');
					}
				}
			},
			async setSession(session) {
				try {
					await db
						.insert(sessions)
						.values({
							...session,
							active_expires: Number(session.active_expires),
							idle_expires: Number(session.idle_expires)
						})
						.execute();
				} catch (e) {
					if (typeof e === 'object' && e !== null && 'code' in e && e.code === '23503') {
						throw new LuciaError('AUTH_INVALID_USER_ID');
					}
					if (typeof e === 'object' && e !== null && 'code' in e && e.code === '23505') {
						throw new LuciaError('AUTH_DUPLICATE_SESSION_ID');
					}
				}
			},
			async setUser(userId, userAttributes, key) {
				const user = { id: userId, ...userAttributes };
				// Will throw zod validation error for us to deal with later
				const parsedUser = newUserValidator.parse(user);
				// TODO: validate the insert returns actually have a row
				if (!key) {
					const inserted = await db.insert(users).values(parsedUser).returning();
					return inserted[0];
				}
				try {
					const res = await db.transaction(async (tx) => {
						const user = await tx.insert(users).values(parsedUser).returning();
						await tx.insert(keys).values(key).execute();
						return user;
					});
					return res[0];
				} catch (e) {
					if (typeof e === 'object' && e !== null && 'code' in e && e.code === '23505') {
						throw new LuciaError('AUTH_DUPLICATE_KEY_ID');
					}
					throw e;
				}
			},
			async updateKeyPassword(key, hashedPassword) {
				const res = await db
					.update(keys)
					.set({ hashed_password: hashedPassword })
					.where(eq(keys.id, key))
					.execute();

				if (res.rowCount === 0) {
					throw new LuciaError('AUTH_INVALID_KEY_ID');
				}
			},
			async updateUserAttributes(userId, attributes) {
				const updatedUsers = await db
					.update(users)
					.set(attributes)
					.where(eq(users.id, userId))
					.returning();

				if (updatedUsers.length > 0) {
					return updatedUsers[0];
				}
				throw new LuciaError('AUTH_INVALID_USER_ID');
			},
			async getSessionAndUserBySessionId(sessionId) {
				const res = (
					await db
						.select()
						.from(sessions)
						.where(eq(sessions.id, sessionId))
						.innerJoin(users, eq(users.id, sessions.user_id))
						.execute()
				)[0];
				if (!res) {
					return null;
				}

				return { user: res.users, session: res.auth_sessions };
			}
		} satisfies Adapter;

		return adapter;
	};
