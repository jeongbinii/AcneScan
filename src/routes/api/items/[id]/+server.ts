import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { userItems } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) error(401, '로그인이 필요합니다.');

	const deleted = await db
		.delete(userItems)
		.where(and(eq(userItems.id, params.id), eq(userItems.userId, locals.user.id)))
		.returning({ id: userItems.id });

	if (deleted.length === 0) error(404, '아이템을 찾을 수 없습니다.');

	return json({ success: true });
};
