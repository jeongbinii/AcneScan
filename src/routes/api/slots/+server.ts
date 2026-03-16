import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { acneSlots, chatMessages } from '$lib/server/db/schema';

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

	// 첫 사진 (user 메시지)
	await db.insert(chatMessages).values({
		slotId: slot.id,
		role: 'user',
		content: '',
		imageUrl
	});

	// 분석 결과 (assistant 메시지)
	const treatmentList = (treatments ?? [])
		.map((t: { item: string; usage: string }, i: number) => `${i + 1}. **${t.item}** — ${t.usage}`)
		.join('\n');
	const aiContent = `분석이 완료되었습니다!\n\n**여드름 종류:** ${acneType}\n**심각도:** ${severity}\n**설명:** ${description}\n\n**추천 해결방안:**\n${treatmentList}\n\n⚠️ ${caution}\n\n궁금한 점이 있으면 언제든 물어보세요!`;

	await db.insert(chatMessages).values({
		slotId: slot.id,
		role: 'assistant',
		content: aiContent
	});

	return json({ id: slot.id });
};
