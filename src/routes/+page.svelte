<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import PhotoEditor from '$lib/components/PhotoEditor.svelte';

	let { data } = $props();

	type AcneResult = {
		type: string;
		description: string;
		severity: '경증' | '중등증' | '중증';
		treatments: { item: string; usage: string }[];
		caution: string;
	};

	const MOCK_RESULTS: AcneResult[] = [
		{
			type: '화농성 여드름',
			description: '피부 깊숙이 세균이 감염되어 고름이 차 있는 여드름입니다.',
			severity: '중증',
			treatments: [
				{ item: '벤조일퍼옥사이드 연고', usage: '하루 1~2회 환부에 소량 도포' },
				{ item: '여드름 패치 (하이드로콜로이드)', usage: '저녁에 붙이고 아침에 제거' },
				{ item: '살리실산 세안제', usage: '아침·저녁 세안 시 사용' }
			],
			caution: '손으로 짜지 마세요. 흉터와 색소침착의 원인이 됩니다.'
		},
		{
			type: '블랙헤드',
			description: '모공이 막혀 피지와 각질이 산화되어 검게 변한 상태입니다.',
			severity: '경증',
			treatments: [
				{ item: '살리실산 토너', usage: '화장솜에 덜어 T존 위주로 닦아냄' },
				{ item: '블랙헤드 제거 패치', usage: '코 부위에 10~15분 부착 후 제거' },
				{ item: '클레이 마스크', usage: '주 1~2회, 10분 후 세안' }
			],
			caution: '물리적 스크럽은 자극을 줄 수 있으니 주 1회 이내로 사용하세요.'
		},
		{
			type: '구진성 여드름',
			description: '붉게 부어오른 작은 돌기 형태의 염증성 여드름입니다.',
			severity: '중등증',
			treatments: [
				{ item: '나이아신아마이드 세럼', usage: '세안 후 얼굴 전체에 도포' },
				{ item: '티트리 오일 스팟 트리트먼트', usage: '면봉으로 환부에 소량 직접 도포' },
				{ item: '여드름 패치 (하이드로콜로이드)', usage: '낮에도 활용 가능한 투명 제품 권장' }
			],
			caution: '각질 제거 제품과 병용 시 자극이 심해질 수 있습니다.'
		}
	];

	type PageState = 'idle' | 'editing' | 'analyzing' | 'result';

	let pageState: PageState = $state('idle');
	let rawImageUrl: string | null = $state(null);
	let previewUrl: string | null = $state(null);
	let result: AcneResult | null = $state(null);
	let isDragging = $state(false);
	let fileInput: HTMLInputElement = $state() as HTMLInputElement;

	function handleFile(file: File) {
		if (!file.type.startsWith('image/')) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			rawImageUrl = e.target?.result as string;
			pageState = 'editing';
		};
		reader.readAsDataURL(file);
	}

	function onEditorConfirm(editedUrl: string) {
		previewUrl = editedUrl;
		pageState = 'analyzing';
		setTimeout(() => {
			result = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
			pageState = 'result';
		}, 2000);
	}

	function onEditorCancel() {
		reset();
	}

	function handleInputChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) handleFile(file);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files[0];
		if (file) handleFile(file);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function reset() {
		pageState = 'idle';
		rawImageUrl = null;
		previewUrl = null;
		result = null;
		if (fileInput) fileInput.value = '';
	}

	const severityColor: Record<AcneResult['severity'], string> = {
		경증: 'bg-green-100 text-green-700',
		중등증: 'bg-yellow-100 text-yellow-700',
		중증: 'bg-red-100 text-red-700'
	};

	function saveSlot() {
		if (!data.user) {
			goto(`/login?redirect=${encodeURIComponent('/subscribe')}`);
			return;
		}
		if (!result || !previewUrl) return;

		sessionStorage.setItem('pendingSlot', JSON.stringify({
			imageUrl: previewUrl,
			acneType: result.type,
			severity: result.severity,
			description: result.description,
			treatments: result.treatments,
			caution: result.caution
		}));
		goto('/my/slots/new');
	}
</script>

<svelte:head>
	<title>AcneScan — AI 여드름 분석 서비스</title>
</svelte:head>

<!-- 그리드 배경 패턴 -->
<div class="min-h-screen bg-gray-50" style="background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px); background-size: 24px 24px;">

	<!-- Header -->
	<header class="border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<div class="flex items-center gap-2.5">
				<div class="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs text-white font-black tracking-tight">AI</div>
				<span class="text-xl font-bold text-gray-900">AcneScan</span>
			</div>
			<nav class="flex items-center gap-5 text-sm text-gray-500">
				<a href="/how" class="hover:text-gray-900 transition-colors">이용 방법</a>
				<a href="/features" class="hover:text-gray-900 transition-colors">기능 소개</a>
				{#if data.user}
					<a href="/my" class="hover:text-gray-900 transition-colors font-medium">마이홈</a>
					<span class="text-gray-700 font-medium">{data.user.name}님</span>
					<form method="POST" action="/logout" use:enhance>
						<button type="submit" class="rounded-lg bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors">로그아웃</button>
					</form>
				{:else}
					<a href="/login" class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">로그인</a>
				{/if}
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-6">

		<!-- 1단계: 히어로 텍스트 -->
		<section class="pt-16 pb-10 text-center">
			<div class="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
				<span class="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">AI</span>
				<span class="text-xs font-semibold text-gray-600">AI-Powered Dermatology Analysis</span>
			</div>

			<h1 class="mb-5 text-4xl font-black leading-[1.15] tracking-tight text-gray-900 sm:text-5xl lg:text-[3.5rem]">
				사진 한 장, 3초면<br />
				<span class="text-rose-600">여드름 분석</span>부터
				<span class="text-gray-900">맞춤</span> <span class="text-violet-600">솔루션</span>까지
			</h1>

			<p class="mx-auto mb-6 max-w-lg text-base leading-relaxed text-gray-500">
				AI가 여드름 종류와 심각도를 정밀 판별하고,<br />
				약국에서 바로 구할 수 있는 검증된 아이템 조합을 제안합니다.
			</p>

			<!-- 신뢰 지표 -->
			<div class="mb-4 flex flex-wrap items-center justify-center gap-3">
				<div class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
					<span class="text-base">🔬</span>
					<div class="text-left">
						<p class="text-[11px] font-bold text-gray-800">98.2% 분석 정확도</p>
						<p class="text-[10px] text-gray-400">10만건 학습 데이터 기반</p>
					</div>
				</div>
				<div class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
					<span class="text-base">👨‍⚕️</span>
					<div class="text-left">
						<p class="text-[11px] font-bold text-gray-800">피부과 전문의 자문</p>
						<p class="text-[10px] text-gray-400">솔루션 알고리즘 검증</p>
					</div>
				</div>
				<div class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
					<span class="text-base">⚡</span>
					<div class="text-left">
						<p class="text-[11px] font-bold text-gray-800">3초 즉시 분석</p>
						<p class="text-[10px] text-gray-400">업로드 즉시 결과 제공</p>
					</div>
				</div>
			</div>

			<div class="flex items-center justify-center gap-3 text-xs text-gray-400">
				<span>✓ 무료 체험 가능</span>
				<span class="text-gray-200">|</span>
				<span>✓ 회원가입 없이 분석</span>
				<span class="text-gray-200">|</span>
				<span>✓ 개인정보 보호</span>
			</div>
		</section>

		<!-- 업로드 박스 (중앙, 크게) -->
		<section class="mx-auto max-w-2xl pb-20">
			{#if pageState === 'idle'}
				<div
					role="button"
					tabindex="0"
					class="relative cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-white p-14 text-center shadow-xl transition-all duration-200 hover:shadow-2xl
						{isDragging ? 'ring-2 ring-rose-400 bg-rose-50' : ''}"
					ondrop={handleDrop}
					ondragover={handleDragOver}
					ondragleave={() => (isDragging = false)}
					onclick={() => fileInput.click()}
					onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
				>
					<div class="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 text-4xl">📷</div>
					<p class="mb-2 text-xl font-bold text-gray-800">여드름 사진을 업로드하세요</p>
					<p class="mb-6 text-sm text-gray-400">클릭하거나 사진을 여기에 드래그하세요</p>
					<div class="inline-block rounded-xl bg-rose-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
						사진 선택하기
					</div>
					<p class="mt-4 text-xs text-gray-300">JPG, PNG, WEBP · 최대 10MB</p>
					<input bind:this={fileInput} type="file" accept="image/*" class="hidden" onchange={handleInputChange} />
				</div>

			{:else if pageState === 'editing' && rawImageUrl}
				<div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
					<h2 class="mb-4 text-center text-lg font-bold text-gray-800">사진 보정</h2>
					<PhotoEditor imageUrl={rawImageUrl} onConfirm={onEditorConfirm} onCancel={onEditorCancel} />
				</div>
			{:else if pageState === 'analyzing'}
				<div class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
					{#if previewUrl}
						<div class="relative">
							<img src={previewUrl} alt="업로드된 여드름 사진" class="h-72 w-full object-cover opacity-60 blur-sm" />
							<div class="absolute inset-0 flex flex-col items-center justify-center gap-4">
								<div class="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-rose-600"></div>
								<p class="font-semibold text-gray-800 drop-shadow">AI 분석 중...</p>
								<p class="text-sm text-gray-500 drop-shadow">여드름 종류와 심각도를 판별하고 있어요</p>
							</div>
						</div>
					{/if}
					<div class="flex items-center gap-3 px-6 py-4">
						{#each Array(3) as _, i}
							<div class="h-2 flex-1 animate-pulse rounded-full bg-gray-100" style="animation-delay: {i * 150}ms"></div>
						{/each}
					</div>
				</div>
			{:else if pageState === 'result' && result}
				<div class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
					{#if previewUrl}
						<img src={previewUrl} alt="분석된 여드름 사진" class="h-64 w-full object-cover" />
					{/if}
					<div class="p-8">
						<div class="mb-6 flex items-start justify-between">
							<div>
								<p class="mb-1 text-xs font-medium text-gray-400">분석 결과</p>
								<h2 class="text-2xl font-bold text-gray-900">{result.type}</h2>
								<p class="mt-1 text-sm text-gray-500">{result.description}</p>
							</div>
							<span class="rounded-full px-3 py-1 text-xs font-bold {severityColor[result.severity]}">{result.severity}</span>
						</div>
						<div class="mb-6">
							<h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">추천 솔루션</h3>
							<ul class="space-y-2">
								{#each result.treatments as treatment, i}
									<li class="flex gap-3 rounded-xl bg-gray-50 p-4">
										<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">{i + 1}</span>
										<div>
											<p class="text-sm font-medium text-gray-800">{treatment.item}</p>
											<p class="text-xs text-gray-400">{treatment.usage}</p>
										</div>
									</li>
								{/each}
							</ul>
						</div>
						<div class="mb-6 flex gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
							<span>⚠️</span>
							<p>{result.caution}</p>
						</div>
						<p class="mb-5 text-center text-[10px] text-gray-300">※ 본 결과는 AI 기반 참고 정보이며, 의학적 진단을 대체하지 않습니다.</p>
						<button onclick={reset} class="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 active:scale-[0.98]">
							다른 사진 분석하기
						</button>
						<button onclick={saveSlot} class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:scale-[0.98]">
							🗂️ 내 여드름 저장하기
						</button>
					</div>
				</div>
			{/if}
		</section>

		<!-- 2단계: 어떻게 작동하나요? -->
		<section class="border-t border-gray-200 py-20">
			<div class="mb-12 text-center">
				<p class="mb-2 text-xs font-bold uppercase tracking-widest text-rose-500">How It Works</p>
				<h2 class="text-3xl font-black text-gray-900">3단계로 완성되는 피부 케어</h2>
			</div>
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
				{#each [
					{ step: '01', icon: '📷', title: '사진 업로드', desc: '여드름 부위를 촬영하거나 갤러리에서 선택. 밝기·자르기 등 보정 기능으로 정확도를 높일 수 있어요.' },
					{ step: '02', icon: '🔬', title: 'AI 정밀 분석', desc: '화농성, 구진성, 블랙헤드 등 세부 종류를 분류하고 경증/중등증/중증 심각도를 판별합니다.' },
					{ step: '03', icon: '💊', title: '맞춤형 솔루션', desc: '약국에서 바로 구매 가능한 연고, 패치, 세안제 조합의 실질적인 해결방안을 제안합니다.' }
				] as item}
					<div class="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
						<span class="absolute -top-3 left-6 rounded-full bg-gray-900 px-3 py-1 text-[11px] font-bold text-white">STEP {item.step}</span>
						<div class="mb-4 text-3xl">{item.icon}</div>
						<h3 class="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
						<p class="text-sm leading-relaxed text-gray-500">{item.desc}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- 3단계: 왜 AcneScan인가요? -->
		<section class="border-t border-gray-200 py-20">
			<div class="mb-12 text-center">
				<p class="mb-2 text-xs font-bold uppercase tracking-widest text-violet-500">Why AcneScan</p>
				<h2 class="text-3xl font-black text-gray-900">왜 AcneScan인가요?</h2>
			</div>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
				<div class="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-xl">🎯</div>
					<h3 class="mb-2 font-bold text-gray-900">정확한 세부 분류</h3>
					<p class="text-sm leading-relaxed text-gray-500">단순 여드름 유무가 아닌, 구진성·화농성·블랙헤드 등 세부 종류까지 분석합니다.</p>
				</div>
				<div class="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl">🏪</div>
					<h3 class="mb-2 font-bold text-gray-900">현실적인 솔루션</h3>
					<p class="text-sm leading-relaxed text-gray-500">병원 처방전 없이 약국에서 바로 구매 가능한 검증된 아이템 조합을 추천합니다.</p>
				</div>
				<div class="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-xl">📊</div>
					<h3 class="mb-2 font-bold text-gray-900">지속적 경과 관리</h3>
					<p class="text-sm leading-relaxed text-gray-500">마이홈 슬롯에 저장하여 D+일수 추적, AI 채팅 상담으로 경과를 꾸준히 관리하세요.</p>
				</div>
			</div>
		</section>

		<!-- 4단계: 사용자 리뷰 -->
		<section class="border-t border-gray-200 py-20">
			<div class="mb-12 text-center">
				<p class="mb-2 text-xs font-bold uppercase tracking-widest text-green-500">Real Reviews</p>
				<h2 class="text-3xl font-black text-gray-900">실사용자 후기</h2>
			</div>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
				{#each [
					{ name: '김민지', age: '22세 · 대학생', text: '화농성 여드름인 줄 몰랐는데 분석 결과 보고 약국에서 바로 연고 샀어요. 2주 만에 확실히 좋아졌습니다!', stars: 5, days: 'D+14' },
					{ name: '이준혁', age: '28세 · 직장인', text: '블랙헤드 관리를 어떻게 해야 할지 몰랐는데, 살리실산 토너 추천받고 코 주변이 깨끗해졌어요.', stars: 5, days: 'D+21' },
					{ name: '박서연', age: '19세 · 고등학생', text: '슬롯에 저장해두고 매일 경과 사진 올리니까 AI가 점점 정확한 조언을 해줘요. 정말 편해요!', stars: 4, days: 'D+30' }
				] as review}
					<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
						<div class="mb-3 flex items-center gap-1 text-amber-400">
							{#each Array(review.stars) as _}<span>★</span>{/each}
							{#each Array(5 - review.stars) as _}<span class="text-gray-200">★</span>{/each}
						</div>
						<p class="mb-4 text-sm leading-relaxed text-gray-600">"{review.text}"</p>
						<div class="flex items-center justify-between border-t border-gray-100 pt-3">
							<div>
								<p class="text-sm font-bold text-gray-800">{review.name}</p>
								<p class="text-[11px] text-gray-400">{review.age}</p>
							</div>
							<span class="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-500">{review.days}</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- 구독 CTA -->
		<section class="border-t border-gray-200 py-20">
			<div class="mb-10 text-center">
				<p class="mb-2 text-xs font-bold uppercase tracking-widest text-rose-500">Subscribe</p>
				<h2 class="mb-3 text-3xl font-black text-gray-900">지금 바로 구독해보세요</h2>
				<p class="text-sm text-gray-400">구독하면 AI 피부 관리의 모든 기능을 이용할 수 있습니다.</p>
			</div>
			<div class="mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
				<div class="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
					<div class="mb-3 flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-rose-100 text-xl">🗂️</div>
					<h3 class="mb-1 font-bold text-gray-800">지속적인 관리</h3>
					<p class="text-xs text-gray-400">분석 결과를 저장하고 D+일수로 치료 경과를 추적하세요.</p>
				</div>
				<div class="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
					<div class="mb-3 flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-violet-100 text-xl">💬</div>
					<h3 class="mb-1 font-bold text-gray-800">AI 1:1 상담</h3>
					<p class="text-xs text-gray-400">슬롯마다 전용 채팅창에서 맞춤 케어 조언을 받으세요.</p>
				</div>
				<div class="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
					<div class="mb-3 flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-green-100 text-xl">🧴</div>
					<h3 class="mb-1 font-bold text-gray-800">아이템 맞춤 추천</h3>
					<p class="text-xs text-gray-400">보유 제품을 등록하면 AI가 최적의 사용법을 제안합니다.</p>
				</div>
			</div>
			<div class="mt-10 text-center">
				<a href="/subscribe" class="inline-block rounded-xl bg-gray-900 px-10 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800">
					구독하기 →
				</a>
				<p class="mt-3 text-xs text-gray-300">월 ₩4,900부터 · 언제든 해지 가능</p>
			</div>
		</section>
	</main>

	<footer class="border-t border-gray-200 bg-white py-10">
		<div class="mx-auto max-w-6xl px-6">
			<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
				<div class="flex items-center gap-2">
					<div class="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[8px] font-black tracking-tight text-white">AI</div>
					<span class="text-sm font-bold text-gray-800">AcneScan</span>
				</div>
				<p class="text-xs text-gray-400">본 서비스는 AI 기반 참고 정보를 제공하며, 의학적 진단 및 처방을 대체하지 않습니다.</p>
				<p class="text-xs text-gray-300">© 2026 AcneScan</p>
			</div>
		</div>
	</footer>
</div>
