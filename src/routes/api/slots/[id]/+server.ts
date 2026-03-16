import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { acneSlots } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) error(401, '로그인이 필요합니다.');

	const body = await request.json();
	const updates: Record<string, unknown> = {};

	if (body.name !== undefined) updates.name = body.name;
	if (body.startDate !== undefined) updates.startDate = new Date(body.startDate);

	if (Object.keys(updates).length === 0) error(400, '수정할 데이터가 없습니다.');

	const updated = await db
		.update(acneSlots)
		.set(updates)
		.where(and(eq(acneSlots.id, params.id), eq(acneSlots.userId, locals.user.id)))
		.returning();

	if (updated.length === 0) error(404, '슬롯을 찾을 수 없습니다.');

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) error(401, '로그인이 필요합니다.');

	const deleted = await db
		.delete(acneSlots)
		.where(and(eq(acneSlots.id, params.id), eq(acneSlots.userId, locals.user.id)))
		.returning({ id: acneSlots.id });

	if (deleted.length === 0) error(404, '슬롯을 찾을 수 없습니다.');

	return json({ success: true });
};
