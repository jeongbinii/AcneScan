type SlotContext = {
	acneType: string;
	severity: string;
	treatments: { item: string; usage: string }[];
};

type UserItem = {
	name: string;
	category: string;
	memo: string | null;
};

function formatItemList(userItems: UserItem[]): string {
	if (userItems.length === 0) return '';
	return userItems.map((i) => `- ${i.name} (${i.category}${i.memo ? ', ' + i.memo : ''})`).join('\n');
}

function findMatchingItems(userItems: UserItem[], keywords: string[]): UserItem[] {
	return userItems.filter((item) => {
		const name = item.name.toLowerCase();
		return keywords.some((kw) => name.includes(kw));
	});
}

function generateItemAdvice(slot: SlotContext, userItems: UserItem[]): string {
	if (userItems.length === 0) return '';

	const ointments = userItems.filter((i) => i.category === '연고');
	const patches = userItems.filter((i) => i.category === '패치');
	const cleansers = userItems.filter((i) => ['세안제', '토너'].includes(i.category));
	const moisturizers = userItems.filter((i) => i.category === '보습제');
	const sunscreens = userItems.filter((i) => i.category === '선크림');

	const tips: string[] = [];

	if (ointments.length > 0) {
		tips.push(`보유한 **${ointments[0].name}**을 하루 1~2회 환부에 얇게 도포하세요.`);
	}
	if (patches.length > 0) {
		tips.push(`**${patches[0].name}**을 저녁에 붙이면 자연 배출을 도와줍니다.`);
	}
	if (cleansers.length > 0) {
		tips.push(`**${cleansers[0].name}**으로 아침·저녁 세안해주세요.`);
	}
	if (moisturizers.length > 0) {
		tips.push(`**${moisturizers[0].name}**으로 보습을 챙겨주세요. 피부 장벽 회복이 중요해요.`);
	}
	if (sunscreens.length > 0) {
		tips.push(`외출 시 **${sunscreens[0].name}**을 꼼꼼히 바르세요.`);
	}

	if (tips.length === 0) return '';
	return `\n\n**보유 아이템 활용법:**\n${tips.join('\n')}`;
}

function generateMissingRecommendations(slot: SlotContext, userItems: UserItem[]): string {
	const categories = new Set(userItems.map((i) => i.category));
	const missing: string[] = [];

	if (!categories.has('연고') && (slot.severity === '중증' || slot.severity === '중등증')) {
		missing.push('**벤조일퍼옥사이드 연고** — 항균·항염 효과로 염증성 여드름에 효과적');
	}
	if (!categories.has('패치')) {
		missing.push('**하이드로콜로이드 패치** — 여드름을 짜지 않고 자연 배출 유도');
	}
	if (!categories.has('선크림')) {
		missing.push('**저자극 선크림(SPF 50+)** — 염증 부위 색소침착 예방 필수');
	}
	if (!categories.has('보습제') && slot.severity !== '경증') {
		missing.push('**세라마이드 보습제** — 피부 장벽 강화, 치료 중 건조함 방지');
	}

	if (missing.length === 0) return '';
	return `\n\n**추가 구매 추천:**\n${missing.join('\n')}`;
}

export function generateAIResponse(
	userMessage: string,
	hasImage: boolean,
	slot: SlotContext,
	userItems: UserItem[] = []
): string {
	const lower = userMessage.toLowerCase();
	const itemAdvice = generateItemAdvice(slot, userItems);
	const missingRecs = generateMissingRecommendations(slot, userItems);

	if (hasImage) {
		return generatePhotoResponse(slot, userItems);
	}

	if (lower.includes('아이템') || lower.includes('제품') || lower.includes('뭐 쓰') || lower.includes('가지고 있')) {
		if (userItems.length === 0) {
			return `현재 등록된 피부 아이템이 없어요. 마이홈에서 보유 아이템을 등록해주시면 맞춤 활용법을 안내해드릴게요!\n\n${slot.acneType}(${slot.severity}) 치료에 추천하는 기본 아이템:${missingRecs || '\n- 벤조일퍼옥사이드 연고\n- 하이드로콜로이드 패치\n- 저자극 선크림'}`;
		}
		return `등록된 아이템을 확인했어요:\n${formatItemList(userItems)}${itemAdvice}${missingRecs}`;
	}

	if (lower.includes('가렵') || lower.includes('간지')) {
		let response = `가려움이 느껴지시는군요. ${slot.acneType}의 경우 염증 반응으로 가려움이 동반될 수 있어요.\n\n**권장 조치:**\n- 환부를 긁지 마세요. 2차 감염 위험이 있습니다.\n- 차가운 수건으로 냉찜질하면 가려움이 완화됩니다.`;

		const calmingItems = findMatchingItems(userItems, ['진정', '시카', '알로에', '판테놀', '세라마이드']);
		if (calmingItems.length > 0) {
			response += `\n- 보유한 **${calmingItems[0].name}**을 활용해보세요.`;
		} else {
			response += `\n- 항히스타민 성분이 포함된 진정 크림을 얇게 발라보세요.`;
		}

		return response + '\n\n증상이 계속되면 피부과 방문을 권합니다.';
	}

	if (lower.includes('빨갛') || lower.includes('붉') || lower.includes('빨개')) {
		return `붉어진 상태가 걱정되시죠. 이는 ${slot.acneType}의 전형적인 염증 반응이에요.\n\n**현재 단계 케어:**\n- ${slot.treatments[0]?.item ?? '항염 연고'}를 얇게 도포하세요.\n- 자극적인 스킨케어(필링, 스크럽)는 당분간 중단하세요.\n- 자외선 차단제를 꼼꼼히 바르세요.${itemAdvice}\n\n2~3일 후 경과 사진을 보내주시면 호전 여부를 확인해드릴게요.`;
	}

	if (lower.includes('아프') || lower.includes('통증') || lower.includes('쑤시')) {
		return `통증이 느껴지시는군요. ${slot.severity === '중증' ? '중증 단계에서는 통증이 흔하게 나타납니다.' : '약간의 통증은 정상적인 염증 반응이에요.'}\n\n**통증 완화법:**\n- 이부프로펜 등 소염진통제를 복용하면 통증과 붓기가 줄어듭니다.\n- 따뜻한 찜질을 5분간 해주면 혈류가 개선되어 회복을 도와줍니다.\n- 절대로 짜려고 하지 마세요!${itemAdvice}\n\n통증이 심하거나 점점 커진다면 피부과 방문을 추천드려요.`;
	}

	if (lower.includes('나아') || lower.includes('좋아') || lower.includes('호전') || lower.includes('줄어')) {
		return `좋은 소식이네요! 호전되고 있다니 다행입니다.\n\n**현재 관리 유지 사항:**\n- 지금 사용 중인 케어 루틴을 유지해주세요.\n- 호전된다고 갑자기 제품 사용을 중단하면 재발할 수 있어요.\n- 최소 2주 이상 꾸준히 관리해주세요.${itemAdvice}\n\n경과 사진을 보내주시면 더 정확한 판단을 해드릴 수 있어요!`;
	}

	if (lower.includes('짜') || lower.includes('압출')) {
		const patches = userItems.filter((i) => i.category === '패치');
		const patchAdvice = patches.length > 0
			? `보유한 **${patches[0].name}**을 붙여서 자연 배출을 유도하세요.`
			: '여드름 패치(하이드로콜로이드)를 붙여서 자연 배출을 유도하세요.';

		return `**절대 직접 짜지 마세요!** ⚠️\n\n${slot.acneType}을 손으로 짜면:\n- 세균 감염이 확산될 수 있습니다.\n- 흉터와 색소침착이 생길 확률이 높아집니다.\n- 더 깊은 곳으로 염증이 퍼질 수 있어요.\n\n**대신 이렇게 하세요:**\n- ${patchAdvice}\n- ${slot.treatments[0]?.item ?? '전용 연고'}를 사용해주세요.`;
	}

	if (lower.includes('언제') || lower.includes('얼마나') || lower.includes('기간')) {
		const duration = slot.severity === '중증' ? '4~8주' : slot.severity === '중등증' ? '2~4주' : '1~2주';
		return `${slot.acneType}(${slot.severity})의 경우, 일반적으로 **${duration}** 정도의 치료 기간이 필요해요.\n\n개인차가 있으므로 꾸준한 관리가 중요합니다.${itemAdvice}${missingRecs}\n\n경과 사진을 주 1회 보내주시면 치료 진행 상황을 함께 확인할 수 있어요.`;
	}

	// 기본 응답
	let response = `${slot.acneType}(${slot.severity})에 대해 궁금한 점이 있으시군요.\n\n현재 추천드린 케어 방법을 꾸준히 실천하시는 것이 중요합니다:\n${slot.treatments.map((t, i) => `${i + 1}. **${t.item}** — ${t.usage}`).join('\n')}`;

	if (userItems.length > 0) {
		response += itemAdvice;
	}
	response += missingRecs;
	response += '\n\n경과 사진을 보내주시면 현재 상태를 분석해드릴게요. 증상 변화(가려움, 통증, 크기 변화 등)도 함께 알려주시면 더 정확한 조언이 가능합니다!';

	return response;
}

function generatePhotoResponse(slot: SlotContext, userItems: UserItem[]): string {
	const itemAdvice = generateItemAdvice(slot, userItems);
	const missingRecs = generateMissingRecommendations(slot, userItems);

	const observations = [
		`경과 사진을 확인했습니다. ${slot.acneType} 부위의 상태를 분석해볼게요.\n\n**관찰 소견:**\n- 염증 범위가 이전 대비 소폭 줄어든 것으로 보입니다.\n- 붉은기는 아직 남아있으나 점차 호전되는 추세예요.\n\n**다음 단계 권장:**\n- ${slot.treatments[0]?.item ?? '현재 사용 중인 제품'}을 계속 사용하세요.\n- 보습에 더 신경 써주세요. 피부 장벽 회복이 중요합니다.${itemAdvice}${missingRecs}\n\n3일 후 다시 경과 사진을 보내주세요.`,
		`사진 잘 받았습니다. 전체적으로 살펴볼게요.\n\n**분석 결과:**\n- ${slot.acneType} 부위의 크기가 유지되고 있습니다.\n- 아직 활발한 염증 단계로 보여요.\n\n**조치 사항:**\n- ${slot.treatments[0]?.item ?? '항염 제품'}의 사용 빈도를 유지해주세요.\n- 피부가 건조해지지 않도록 저자극 보습제를 함께 사용하세요.\n- 자외선 차단 필수입니다!${itemAdvice}${missingRecs}\n\n1주일 후 비교 사진을 보내주시면 변화를 추적해드릴게요.`,
		`경과 사진 확인했어요. 꾸준히 관리하고 계시네요!\n\n**현재 상태:**\n- 이전보다 붓기가 다소 가라앉은 것으로 보입니다.\n- 피부 톤이 안정되어 가는 중이에요.\n\n**유지 관리:**\n- 현재 루틴을 잘 유지해주세요.\n- 수면과 식이도 피부 회복에 큰 영향을 줍니다.${itemAdvice}${missingRecs}\n\n다음 경과 사진은 3~5일 뒤에 보내주세요!`
	];

	return observations[Math.floor(Math.random() * observations.length)];
}
