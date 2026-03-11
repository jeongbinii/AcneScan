import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { chatMessages, acneSlots, userItems } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { generateAIResponse } from '$lib/server/mock-ai';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) error(401, '로그인이 필요합니다.');

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

	return json(
		messages.map((m) => ({
			id: m.id,
			role: m.role,
			content: m.content,
			imageUrl: m.imageUrl,
			createdAt: m.createdAt.toISOString()
		}))
	);
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) error(401, '로그인이 필요합니다.');

	const [slot] = await db
		.select()
		.from(acneSlots)
		.where(and(eq(acneSlots.id, params.id), eq(acneSlots.userId, locals.user.id)))
		.limit(1);

	if (!slot) error(404, '슬롯을 찾을 수 없습니다.');

	const body = await request.json();
	const { content, imageUrl } = body;

	if (!content && !imageUrl) error(400, '메시지를 입력해주세요.');

	// 사용자 메시지 저장
	const [userMsg] = await db
		.insert(chatMessages)
		.values({
			slotId: params.id,
			role: 'user',
			content: content ?? '',
			imageUrl: imageUrl ?? null
		})
		.returning();

	// 사용자 보유 아이템 조회
	const items = await db
		.select({ name: userItems.name, category: userItems.category, memo: userItems.memo })
		.from(userItems)
		.where(eq(userItems.userId, locals.user.id));

	// Mock AI 응답 생성 (1초 딜레이 시뮬레이션)
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const treatments = (slot.treatments as { item: string; usage: string }[]) ?? [];
	const aiContent = generateAIResponse(
		content ?? '',
		!!imageUrl,
		{ acneType: slot.acneType, severity: slot.severity, treatments },
		items
	);

	const [aiMsg] = await db
		.insert(chatMessages)
		.values({
			slotId: params.id,
			role: 'assistant',
			content: aiContent
		})
		.returning();

	return json({
		userMessage: {
			id: userMsg.id,
			role: userMsg.role,
			content: userMsg.content,
			imageUrl: userMsg.imageUrl,
			createdAt: userMsg.createdAt.toISOString()
		},
		aiMessage: {
			id: aiMsg.id,
			role: aiMsg.role,
			content: aiMsg.content,
			imageUrl: null,
			createdAt: aiMsg.createdAt.toISOString()
		}
	});
};
