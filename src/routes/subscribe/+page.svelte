<script lang="ts">
	let { data } = $props();

	type Plan = {
		name: string;
		price: string;
		period: string;
		features: string[];
		highlight: boolean;
		key: string;
	};

	const plans: Plan[] = [
		{
			name: 'Free',
			price: '₩0',
			period: '',
			features: ['사진 업로드 분석 (1일 3회)', 'Mock 분석 결과 제공'],
			highlight: false,
			key: 'free'
		},
		{
			name: 'Pro',
			price: '₩4,900',
			period: '/월',
			features: [
				'무제한 사진 분석',
				'여드름 슬롯 최대 10개',
				'내 아이템 저장',
				'AI 채팅 상담',
				'치료 경과 추적'
			],
			highlight: true,
			key: 'pro'
		},
		{
			name: 'Premium',
			price: '₩9,900',
			period: '/월',
			features: [
				'Pro의 모든 기능',
				'여드름 슬롯 무제한',
				'커뮤니티 분석 리포트',
				'우선 AI 응답',
				'전문가 피드백 연결'
			],
			highlight: false,
			key: 'premium'
		}
	];

	function getSubscribeHref(plan: Plan): string {
		const paymentUrl = `/payment?plan=${plan.key}`;
		if (data.user) return paymentUrl;
		return `/login?redirect=${encodeURIComponent(paymentUrl)}`;
	}
</script>

<svelte:head>
	<title>구독 플랜 선택 — AcneScan</title>
</svelte:head>

<div class="min-h-screen bg-gray-50" style="background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px); background-size: 24px 24px;">
	<header class="border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href="/" class="flex items-center gap-2.5">
				<div class="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs text-white font-black tracking-tight">AI</div>
				<span class="text-xl font-bold text-gray-900">AcneScan</span>
			</a>
			<a href="/" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">← 홈으로</a>
		</div>
	</header>

	<main class="mx-auto max-w-4xl px-6 py-16">
		<div class="mb-12 text-center">
			<p class="mb-2 text-xs font-bold uppercase tracking-widest text-rose-500">Pricing</p>
			<h1 class="mb-3 text-4xl font-black text-gray-900">구독 플랜 선택</h1>
			<p class="text-gray-500">여드름을 저장하고 AI와 함께 관리하려면 구독이 필요해요.</p>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
			{#each plans as plan}
				<div class="relative flex flex-col rounded-2xl border bg-white p-8 transition-shadow hover:shadow-lg {plan.highlight ? 'border-rose-400 shadow-md' : 'border-gray-200'}">
					{#if plan.highlight}
						<span class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-4 py-1 text-xs font-bold text-white">인기</span>
					{/if}

					<h2 class="mb-1 text-lg font-bold text-gray-800">{plan.name}</h2>
					<div class="mb-6">
						<span class="text-3xl font-black text-gray-900">{plan.price}</span>
						{#if plan.period}
							<span class="text-sm text-gray-400">{plan.period}</span>
						{/if}
					</div>

					<ul class="mb-8 flex-1 space-y-3">
						{#each plan.features as feature}
							<li class="flex items-start gap-2 text-sm text-gray-600">
								<span class="mt-0.5 text-rose-500">✓</span>
								{feature}
							</li>
						{/each}
					</ul>

					{#if plan.key === 'free'}
						<button disabled class="w-full rounded-xl py-3 font-semibold border border-gray-200 text-gray-400 cursor-default">현재 플랜</button>
					{:else}
						<a href={getSubscribeHref(plan)} class="block w-full rounded-xl py-3 font-semibold text-center transition-colors active:scale-[0.98] {plan.highlight ? 'bg-gray-900 text-white hover:bg-gray-800' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}">
							구독하기
						</a>
					{/if}
				</div>
			{/each}
		</div>

		<p class="mt-10 text-center text-xs text-gray-300">결제는 아직 연동 전이며, 추후 실제 결제 시스템이 도입됩니다.</p>
	</main>
</div>
