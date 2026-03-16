import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { acneSlots, chatMessages } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) redirect(302, '/login');

	const [slot] = await db
		.select()
		.from(acneSlots)
		.where(and(eq(acneSlots.id, params.id), eq(acneSlots.userId, locals.user.id)))
		.limit(1);

	if (!slot) error(404, '슬롯을 찾을 수 없습니다.');

	const messages = await db
		.select()
		.from(chatMessages)
		.where(eq(chatMessages.slotId, params.id))
		.orderBy(asc(chatMessages.createdAt));

	return {
		slot: {
			id: slot.id,
			name: slot.name,
			imageUrl: slot.imageUrl,
			acneType: slot.acneType,
			severity: slot.severity,
			description: slot.description,
			treatments: slot.treatments as { item: string; usage: string }[],
			caution: slot.caution,
			startDate: slot.startDate.toISOString(),
			status: slot.status
		},
		messages: messages.map((m) => ({
			id: m.id,
			role: m.role,
			content: m.content,
			imageUrl: m.imageUrl,
			createdAt: m.createdAt.toISOString()
		}))
	};
};
