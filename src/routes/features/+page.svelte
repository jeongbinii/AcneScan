<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

<svelte:head>
	<title>기능 소개 — AcneScan</title>
</svelte:head>

<div class="min-h-screen bg-gray-50" style="background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px); background-size: 24px 24px;">
	<header class="border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href="/" class="flex items-center gap-2.5">
				<div class="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs text-white font-black tracking-tight">AI</div>
				<span class="text-xl font-bold text-gray-900">AcneScan</span>
			</a>
			<nav class="flex items-center gap-5 text-sm text-gray-500">
				<a href="/how" class="hover:text-gray-900 transition-colors">이용 방법</a>
				<a href="/features" class="text-gray-900 font-medium">기능 소개</a>
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

	<main class="mx-auto max-w-4xl px-6 py-16">
		<div class="mb-12 text-center">
			<p class="mb-2 text-xs font-bold uppercase tracking-widest text-rose-500">Features</p>
			<h1 class="mb-3 text-4xl font-black text-gray-900">기능 소개</h1>
			<p class="text-gray-500">AcneScan이 제공하는 스마트 피부 관리 기능을 만나보세요.</p>
		</div>

		<div class="space-y-6">
			{#each [
				{ icon: '📷', title: '여드름 사진 분석', desc: '사진 한 장으로 여드름 종류와 심각도를 즉시 파악합니다.', details: ['화농성 여드름, 구진성 여드름, 블랙헤드 등 자동 분류', '경증 / 중등증 / 중증 심각도 판별', '약국에서 구할 수 있는 제품 기반 솔루션 제시'] },
				{ icon: '🗂️', title: '여드름 슬롯 관리', desc: '여드름별로 슬롯을 만들어 치료 경과를 개별 추적합니다.', details: ['슬롯마다 사진, 종류, 치료 시작일, 경과일(D+) 표시', '치료 진행중 / 보관됨 상태 관리', '한눈에 모든 여드름 현황 확인'] },
				{ icon: '💬', title: 'AI 채팅 상담', desc: '슬롯마다 전용 대화창이 생겨 AI와 1:1 상담이 가능합니다.', details: ['증상 설명(가려움, 통증, 붉어짐 등)에 따른 맞춤 조언', '경과 사진 업로드 시 상태 변화 분석', '치료 기간 예측 및 단계별 케어 가이드'] },
				{ icon: '🧴', title: '내 아이템 저장', desc: '보유 중인 피부 제품을 등록하면 AI가 맞춤 활용법을 제안합니다.', details: ['연고, 패치, 세안제, 토너, 세럼 등 카테고리별 관리', '보유 아이템을 활용한 최적의 케어 루틴 제안', '부족한 아이템 자동 추천'] },
				{ icon: '📊', title: '커뮤니티 분석 (예정)', desc: '다른 사용자의 치료 패턴을 분석해 효과 좋은 제품을 추천합니다.', details: ['같은 여드름 유형 사용자들의 치료 성공 데이터 분석', '가장 효과적인 아이템 조합 추천', '치료 기간 통계 및 비교'] }
			] as feature}
				<div class="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">{feature.icon}</div>
						<div>
							<h2 class="text-xl font-bold text-gray-900">{feature.title}</h2>
							<p class="text-sm text-gray-500">{feature.desc}</p>
						</div>
					</div>
					<ul class="ml-15 space-y-2">
						{#each feature.details as detail}
							<li class="flex items-start gap-2 text-sm text-gray-600">
								<span class="mt-0.5 text-rose-500">✓</span>
								{detail}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<div class="mt-12 text-center">
			<a href="/" class="inline-block rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white hover:bg-gray-800 transition-colors">
				지금 시작하기
			</a>
		</div>
	</main>

	<footer class="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-400">
		© 2026 AcneScan. 의학적 진단을 대체하지 않습니다.
	</footer>
</div>
