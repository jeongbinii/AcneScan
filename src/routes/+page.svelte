<script lang="ts">
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

	type PageState = 'idle' | 'analyzing' | 'result';

	let pageState: PageState = $state('idle');
	let previewUrl: string | null = $state(null);
	let result: AcneResult | null = $state(null);
	let isDragging = $state(false);
	let fileInput: HTMLInputElement;

	function handleFile(file: File) {
		if (!file.type.startsWith('image/')) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			previewUrl = e.target?.result as string;
			startAnalysis();
		};
		reader.readAsDataURL(file);
	}

	function startAnalysis() {
		pageState = 'analyzing';
		setTimeout(() => {
			result = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
			pageState = 'result';
		}, 2000);
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
		previewUrl = null;
		result = null;
		if (fileInput) fileInput.value = '';
	}

	const severityColor: Record<AcneResult['severity'], string> = {
		경증: 'bg-green-100 text-green-700',
		중등증: 'bg-yellow-100 text-yellow-700',
		중증: 'bg-red-100 text-red-700'
	};
</script>

<svelte:head>
	<title>AcneScan — AI 여드름 분석 서비스</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
	<!-- Header -->
	<header class="border-b border-rose-100 bg-white/70 backdrop-blur-sm">
		<div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
			<div class="flex items-center gap-2">
				<span class="text-2xl">🔬</span>
				<span class="text-xl font-bold text-rose-600">AcneScan</span>
			</div>
			<nav class="flex gap-4 text-sm text-gray-500">
				<a href="#how" class="hover:text-rose-500 transition-colors">이용 방법</a>
				<a href="#features" class="hover:text-rose-500 transition-colors">기능 소개</a>
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-6 py-16">
		<!-- Hero -->
		<section class="mb-16 text-center">
			<h1 class="mb-4 text-5xl font-extrabold tracking-tight text-gray-900">
				내 여드름,<br />
				<span class="text-rose-500">AI가 분석</span>해드립니다
			</h1>
			<p class="mx-auto max-w-xl text-lg text-gray-500">
				사진 한 장으로 여드름 종류를 파악하고,<br />
				약국에서 바로 구할 수 있는 아이템으로 해결방안을 제안해드려요.
			</p>
		</section>

		<!-- Upload / Analyze / Result -->
		<section class="mx-auto max-w-2xl">
			{#if pageState === 'idle'}
				<!-- Upload Zone -->
				<div
					role="button"
					tabindex="0"
					class="relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-200
						{isDragging
						? 'border-rose-400 bg-rose-50 scale-[1.01]'
						: 'border-rose-200 bg-white hover:border-rose-400 hover:bg-rose-50'}"
					ondrop={handleDrop}
					ondragover={handleDragOver}
					ondragleave={() => (isDragging = false)}
					onclick={() => fileInput.click()}
					onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
				>
					<div class="mb-4 rounded-full bg-rose-100 p-5 text-4xl">📷</div>
					<p class="mb-1 text-lg font-semibold text-gray-700">여드름 사진을 업로드하세요</p>
					<p class="text-sm text-gray-400">클릭하거나 사진을 여기에 드래그하세요</p>
					<p class="mt-3 text-xs text-gray-300">JPG, PNG, WEBP 지원</p>

					<input
						bind:this={fileInput}
						type="file"
						accept="image/*"
						class="hidden"
						onchange={handleInputChange}
					/>
				</div>
			{:else if pageState === 'analyzing'}
				<!-- Preview + Loading -->
				<div class="overflow-hidden rounded-3xl bg-white shadow-lg">
					{#if previewUrl}
						<div class="relative">
							<img
								src={previewUrl}
								alt="업로드된 여드름 사진 미리보기"
								class="h-72 w-full object-cover opacity-60 blur-sm"
							/>
							<div class="absolute inset-0 flex flex-col items-center justify-center gap-4">
								<div
									class="h-12 w-12 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500"
								></div>
								<p class="font-semibold text-rose-600 drop-shadow">분석 중...</p>
								<p class="text-sm text-gray-600 drop-shadow">AI가 사진을 살펴보고 있어요</p>
							</div>
						</div>
					{/if}

					<div class="flex items-center gap-3 px-6 py-4">
						{#each Array(3) as _, i}
							<div
								class="h-2 flex-1 animate-pulse rounded-full bg-rose-100"
								style="animation-delay: {i * 150}ms"
							></div>
						{/each}
					</div>
				</div>
			{:else if pageState === 'result' && result}
				<!-- Result -->
				<div class="overflow-hidden rounded-3xl bg-white shadow-lg">
					<!-- Preview -->
					{#if previewUrl}
						<img
							src={previewUrl}
							alt="분석된 여드름 사진"
							class="h-64 w-full object-cover"
						/>
					{/if}

					<div class="p-8">
						<!-- Type Header -->
						<div class="mb-6 flex items-start justify-between">
							<div>
								<p class="mb-1 text-sm text-gray-400">분석 결과</p>
								<h2 class="text-2xl font-bold text-gray-900">{result.type}</h2>
								<p class="mt-1 text-sm text-gray-500">{result.description}</p>
							</div>
							<span class="rounded-full px-3 py-1 text-sm font-medium {severityColor[result.severity]}">
								{result.severity}
							</span>
						</div>

						<!-- Treatments -->
						<div class="mb-6">
							<h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
								추천 해결방안
							</h3>
							<ul class="space-y-3">
								{#each result.treatments as treatment, i}
									<li class="flex gap-3 rounded-xl bg-rose-50 p-4">
										<span
											class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white"
										>
											{i + 1}
										</span>
										<div>
											<p class="font-medium text-gray-800">{treatment.item}</p>
											<p class="text-sm text-gray-500">{treatment.usage}</p>
										</div>
									</li>
								{/each}
							</ul>
						</div>

						<!-- Caution -->
						<div class="mb-8 flex gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
							<span>⚠️</span>
							<p>{result.caution}</p>
						</div>

						<!-- AI disclaimer -->
						<p class="mb-6 text-center text-xs text-gray-300">
							※ 이 결과는 AI 시범 분석으로, 의학적 진단을 대체하지 않습니다.
						</p>

						<!-- Reset Button -->
						<button
							onclick={reset}
							class="w-full rounded-2xl bg-rose-500 py-3 font-semibold text-white transition-colors hover:bg-rose-600 active:scale-95"
						>
							다른 사진 분석하기
						</button>
					</div>
				</div>
			{/if}
		</section>

		<!-- How it works -->
		<section id="how" class="mt-24">
			<h2 class="mb-10 text-center text-2xl font-bold text-gray-800">이용 방법</h2>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
				{#each [
					{ icon: '📷', step: '01', title: '사진 업로드', desc: '여드름 부위를 촬영하거나 갤러리에서 사진을 선택하세요.' },
					{ icon: '🤖', step: '02', title: 'AI 분석', desc: 'AI가 여드름 종류와 심각도를 즉시 분석합니다.' },
					{ icon: '💊', step: '03', title: '해결방안 확인', desc: '약국에서 구할 수 있는 제품으로 맞춤 케어 방법을 제안해드려요.' }
				] as item}
					<div class="rounded-2xl bg-white p-6 shadow-sm text-center">
						<div class="mb-3 text-4xl">{item.icon}</div>
						<p class="mb-1 text-xs font-bold text-rose-400">STEP {item.step}</p>
						<h3 class="mb-2 font-bold text-gray-800">{item.title}</h3>
						<p class="text-sm text-gray-500">{item.desc}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Features -->
		<section id="features" class="mt-20">
			<h2 class="mb-10 text-center text-2xl font-bold text-gray-800">주요 기능</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{#each [
					{ icon: '🗂️', title: '여드름 슬롯 관리', desc: '여드름별로 슬롯을 만들어 치료 경과를 개별 추적할 수 있어요.' },
					{ icon: '💬', title: 'AI 채팅 상담', desc: '전문가처럼 대화하며 경과 사진을 올리고 조언을 받아보세요.' },
					{ icon: '🧴', title: '내 아이템 저장', desc: '보유 중인 피부 제품을 저장하면 AI가 맞춤 활용법을 제안해요.' },
					{ icon: '📊', title: '커뮤니티 분석', desc: '다른 사용자의 치료 패턴을 분석해 효과 좋은 제품을 추천해드려요.' }
				] as feature}
					<div class="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
						<span class="text-3xl">{feature.icon}</span>
						<div>
							<h3 class="font-bold text-gray-800">{feature.title}</h3>
							<p class="mt-1 text-sm text-gray-500">{feature.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</main>

	<footer class="mt-20 border-t border-rose-100 py-8 text-center text-sm text-gray-400">
		© 2026 AcneScan. 의학적 진단을 대체하지 않습니다.
	</footer>
</div>
