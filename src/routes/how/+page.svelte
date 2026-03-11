<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

<svelte:head>
	<title>이용 방법 — AcneScan</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-rose-50 via-white to-pink-50">
	<header class="border-b border-rose-100 bg-white/70 backdrop-blur-sm">
		<div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
			<a href="/" class="flex items-center gap-2">
				<span class="text-2xl">🔬</span>
				<span class="text-xl font-bold text-rose-600">AcneScan</span>
			</a>
			<nav class="flex items-center gap-4 text-sm text-gray-500">
				<a href="/how" class="text-rose-500 font-medium">이용 방법</a>
				<a href="/features" class="hover:text-rose-500 transition-colors">기능 소개</a>
				{#if data.user}
					<a href="/my" class="hover:text-rose-500 transition-colors font-medium">마이홈</a>
					<span class="text-gray-700 font-medium">{data.user.name}님</span>
					<form method="POST" action="/logout" use:enhance>
						<button type="submit" class="rounded-xl bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors">로그아웃</button>
					</form>
				{:else}
					<a href="/login" class="rounded-xl bg-rose-500 px-4 py-1.5 text-white hover:bg-rose-600 transition-colors">로그인</a>
				{/if}
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-4xl px-6 py-16">
		<div class="mb-12 text-center">
			<h1 class="mb-3 text-4xl font-extrabold text-gray-900">이용 방법</h1>
			<p class="text-gray-500">간단한 3단계로 여드름을 분석하고 관리해보세요.</p>
		</div>

		<!-- Steps -->
		<div class="space-y-8">
			{#each [
				{
					icon: '📷', step: '01', title: '사진 업로드',
					desc: '여드름 부위를 촬영하거나 갤러리에서 사진을 선택하세요.',
					detail: '얼굴 전체가 아닌, 여드름이 있는 부위를 가까이서 촬영하면 더 정확한 분석이 가능합니다. JPG, PNG, WEBP 형식을 지원해요.'
				},
				{
					icon: '🤖', step: '02', title: 'AI 분석',
					desc: 'AI가 여드름 종류와 심각도를 즉시 분석합니다.',
					detail: '업로드한 사진을 AI가 분석하여 여드름 종류(화농성, 구진성, 블랙헤드 등)와 심각도(경증/중등증/중증)를 판별합니다. 약 2~3초면 결과를 확인할 수 있어요.'
				},
				{
					icon: '💊', step: '03', title: '해결방안 확인',
					desc: '약국에서 구할 수 있는 제품으로 맞춤 케어 방법을 제안해드려요.',
					detail: '분석 결과에 따라 연고, 패치, 세안제 등 시중에서 쉽게 구할 수 있는 아이템을 조합한 해결방안을 제시합니다. 마이홈에 보유 아이템을 등록해두면 AI가 이를 활용한 맞춤 방안을 제안해줘요.'
				}
			] as item}
				<div class="flex gap-6 rounded-3xl bg-white p-8 shadow-sm">
					<div class="flex shrink-0 flex-col items-center">
						<div class="mb-2 text-5xl">{item.icon}</div>
						<span class="text-xs font-bold text-rose-400">STEP {item.step}</span>
					</div>
					<div>
						<h2 class="mb-2 text-xl font-bold text-gray-900">{item.title}</h2>
						<p class="mb-2 font-medium text-gray-700">{item.desc}</p>
						<p class="text-sm text-gray-400">{item.detail}</p>
					</div>
				</div>
			{/each}
		</div>

		<!-- Subscription Flow -->
		<div class="mt-16">
			<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">구독 사용자라면?</h2>
			<div class="space-y-4">
				{#each [
					{ icon: '🗂️', title: '여드름 저장', desc: '분석 결과를 슬롯에 저장하여 치료 경과를 개별 관리할 수 있습니다.' },
					{ icon: '💬', title: 'AI 채팅 상담', desc: '슬롯마다 전용 채팅창이 개설되어 경과 사진 업로드와 실시간 조언을 받을 수 있어요.' },
					{ icon: '🧴', title: '아이템 활용', desc: '보유한 피부 제품을 등록하면 AI가 기존 아이템을 활용한 맞춤 케어를 제안합니다.' }
				] as item}
					<div class="flex items-start gap-4 rounded-2xl bg-rose-50 p-5">
						<span class="text-2xl">{item.icon}</span>
						<div>
							<h3 class="font-bold text-gray-800">{item.title}</h3>
							<p class="mt-1 text-sm text-gray-500">{item.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- CTA -->
		<div class="mt-12 text-center">
			<a
				href="/"
				class="inline-block rounded-2xl bg-rose-500 px-8 py-3 font-semibold text-white hover:bg-rose-600 transition-colors"
			>
				지금 분석해보기
			</a>
		</div>
	</main>

	<footer class="mt-20 border-t border-rose-100 py-8 text-center text-sm text-gray-400">
		© 2026 AcneScan. 의학적 진단을 대체하지 않습니다.
	</footer>
</div>
