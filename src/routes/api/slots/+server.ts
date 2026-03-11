import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { acneSlots } from '$lib/server/db/schema';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, '로그인이 필요합니다.');
	}

	const body = await request.json();
	const { imageUrl, acneType, severity, description, treatments, caution } = body;

	if (!imageUrl || !acneType || !severity) {
		error(400, '필수 데이터가 누락되었습니다.');
	}

	const [slot] = await db
		.insert(acneSlots)
		.values({
			userId: locals.user.id,
			imageUrl,
			acneType,
			severity,
			description: description ?? '',
			treatments: treatments ?? [],
			caution: caution ?? ''
		})
		.returning({ id: acneSlots.id });

	return json({ id: slot.id });
};
