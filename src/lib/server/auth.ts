import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { Cookies } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users, sessions } from './db/schema';

const scryptAsync = promisify(scrypt);
const SESSION_COOKIE = 'session_id';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7일 (초)

type User = { id: string; email: string; name: string };

async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex');
	const buf = (await scryptAsync(password, salt, 64)) as Buffer;
	return `${salt}:${buf.toString('hex')}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
	const [salt, key] = hash.split(':');
	const buf = (await scryptAsync(password, salt, 64)) as Buffer;
	return timingSafeEqual(buf, Buffer.from(key, 'hex'));
}

export async function register(email: string, password: string, name: string): Promise<User | null> {
	const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
	if (existing.length > 0) return null;

	const passwordHash = await hashPassword(password);
	const [user] = await db
		.insert(users)
		.values({ email, name, passwordHash })
		.returning({ id: users.id, email: users.email, name: users.name });

	return user;
}

export async function login(email: string, password: string): Promise<User | null> {
	const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
	if (!user) return null;

	const valid = await verifyPassword(password, user.passwordHash);
	if (!valid) return null;

	return { id: user.id, email: user.email, name: user.name };
}

export async function createSession(userId: string, cookies: Cookies): Promise<void> {
	const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

	const [session] = await db
		.insert(sessions)
		.values({ userId, expiresAt })
		.returning({ id: sessions.id });

	cookies.set(SESSION_COOKIE, session.id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: SESSION_MAX_AGE
	});
}

export async function getUserFromSession(cookies: Cookies): Promise<User | null> {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (!sessionId) return null;

	const result = await db
		.select({
			sessionId: sessions.id,
			expiresAt: sessions.expiresAt,
			userId: users.id,
			email: users.email,
			name: users.name
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId))
		.limit(1);

	if (result.length === 0) return null;

	const row = result[0];
	if (row.expiresAt < new Date()) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		cookies.delete(SESSION_COOKIE, { path: '/' });
		return null;
	}

	return { id: row.userId, email: row.email, name: row.name };
}

export async function deleteSession(cookies: Cookies): Promise<void> {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (sessionId) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
	}
	cookies.delete(SESSION_COOKIE, { path: '/' });
}
