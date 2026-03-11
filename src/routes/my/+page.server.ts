import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { acneSlots, userItems } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const [slots, items] = await Promise.all([
		db
			.select()
			.from(acneSlots)
			.where(eq(acneSlots.userId, locals.user.id))
			.orderBy(desc(acneSlots.startDate)),
		db
			.select()
			.from(userItems)
			.where(eq(userItems.userId, locals.user.id))
	]);

	return {
		slots: slots.map((slot) => ({
			id: slot.id,
			imageUrl: slot.imageUrl,
			acneType: slot.acneType,
			severity: slot.severity,
			startDate: slot.startDate.toISOString(),
			status: slot.status
		})),
		items: items.map((item) => ({
			id: item.id,
			name: item.name,
			category: item.category,
			memo: item.memo
		}))
	};
};
