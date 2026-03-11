import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { userItems } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) error(401, '로그인이 필요합니다.');

	const items = await db
		.select()
		.from(userItems)
		.where(eq(userItems.userId, locals.user.id));

	return json(items.map((item) => ({
		id: item.id,
		name: item.name,
		category: item.category,
		memo: item.memo
	})));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, '로그인이 필요합니다.');

	const { name, category, memo } = await request.json();

	if (!name || !category) {
		error(400, '아이템 이름과 카테고리는 필수입니다.');
	}

	const [item] = await db
		.insert(userItems)
		.values({
			userId: locals.user.id,
			name,
			category,
			memo: memo ?? null
		})
		.returning();

	return json({ id: item.id, name: item.name, category: item.category, memo: item.memo });
};
