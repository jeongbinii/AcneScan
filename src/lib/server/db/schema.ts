import { pgTable, uuid, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 100 }).notNull(),
	passwordHash: varchar('password_hash', { length: 255 }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const sessions = pgTable('sessions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const acneSlots = pgTable('acne_slots', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	imageUrl: text('image_url').notNull(),
	acneType: varchar('acne_type', { length: 100 }).notNull(),
	severity: varchar('severity', { length: 20 }).notNull(),
	description: text('description').notNull(),
	treatments: jsonb('treatments').notNull(),
	caution: text('caution').notNull(),
	startDate: timestamp('start_date', { withTimezone: true }).notNull().defaultNow(),
	status: varchar('status', { length: 20 }).notNull().default('active'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const userItems = pgTable('user_items', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 200 }).notNull(),
	category: varchar('category', { length: 50 }).notNull(), // 연고, 패치, 세안제, 토너, 세럼, 마스크, 기타
	memo: text('memo'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const chatMessages = pgTable('chat_messages', {
	id: uuid('id').primaryKey().defaultRandom(),
	slotId: uuid('slot_id')
		.notNull()
		.references(() => acneSlots.id, { onDelete: 'cascade' }),
	role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant'
	content: text('content').notNull(),
	imageUrl: text('image_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
