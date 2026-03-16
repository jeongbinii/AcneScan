<script lang="ts">
	let { data } = $props();

	let cardNumber = $state('');
	let expiry = $state('');
	let cvc = $state('');
	let name = $state('');
	let processing = $state(false);
	let completed = $state(false);

	function formatCardNumber(value: string): string {
		const digits = value.replace(/\D/g, '').slice(0, 16);
		return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
	}

	function formatExpiry(value: string): string {
		const digits = value.replace(/\D/g, '').slice(0, 4);
		if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
		return digits;
	}

	function handleCardInput(e: Event) {
		const input = e.target as HTMLInputElement;
		cardNumber = formatCardNumber(input.value);
	}

	function handleExpiryInput(e: Event) {
		const input = e.target as HTMLInputElement;
		expiry = formatExpiry(input.value);
	}

	function handleCvcInput(e: Event) {
		const input = e.target as HTMLInputElement;
		cvc = input.value.replace(/\D/g, '').slice(0, 3);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		processing = true;
		await new Promise((r) => setTimeout(r, 2000));
		processing = false;
		completed = true;
	}
</script>

<svelte:head>
	<title>결제 — AcneScan</title>
</svelte:head>

<div class="min-h-screen bg-gray-50" style="background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px); background-size: 24px 24px;">
	<header class="border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href="/" class="flex items-center gap-2.5">
				<div class="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs text-white font-black tracking-tight">AI</div>
				<span class="text-xl font-bold text-gray-900">AcneScan</span>
			</a>
			<a href="/subscribe" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">← 플랜 선택으로</a>
		</div>
	</header>

	<main class="mx-auto max-w-lg px-6 py-16">
		{#if completed}
			<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-lg">
				<div class="mb-4 text-6xl">🎉</div>
				<h1 class="mb-2 text-2xl font-black text-gray-900">구독 완료!</h1>
				<p class="mb-2 text-gray-500">
					<span class="font-bold text-rose-600">{data.plan.name}</span> 플랜이 활성화되었습니다.
				</p>
				<p class="mb-8 text-sm text-gray-400">이제 모든 기능을 이용할 수 있어요.</p>
				<a href="/my" class="inline-block rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white hover:bg-gray-800 transition-colors">
					마이홈으로 이동
				</a>
			</div>
		{:else}
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-3xl font-black text-gray-900">결제 정보 입력</h1>
				<p class="text-gray-500">
					<span class="font-bold text-rose-600">{data.plan.name}</span> 플랜 ·
					<span class="font-bold">{data.plan.price}</span><span class="text-sm text-gray-400">{data.plan.period}</span>
				</p>
			</div>

			<div class="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-3 text-sm font-bold text-gray-700">주문 요약</h2>
				<div class="flex items-center justify-between border-t border-gray-100 pt-3">
					<span class="text-gray-600">{data.plan.name} 플랜 (월간)</span>
					<span class="font-bold text-gray-900">{data.plan.price}</span>
				</div>
				<div class="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
					<span class="font-bold text-gray-800">총 결제 금액</span>
					<span class="text-lg font-black text-rose-600">{data.plan.price}</span>
				</div>
			</div>

			<form onsubmit={handleSubmit} class="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
				<div class="mb-5">
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700">카드 소유자명</label>
					<input id="name" type="text" bind:value={name} required class="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100" placeholder="홍길동" />
				</div>

				<div class="mb-5">
					<label for="card" class="mb-1 block text-sm font-medium text-gray-700">카드 번호</label>
					<input id="card" type="text" value={cardNumber} oninput={handleCardInput} required maxlength="19" class="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm tracking-widest transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100" placeholder="0000 0000 0000 0000" />
				</div>

				<div class="mb-6 grid grid-cols-2 gap-4">
					<div>
						<label for="expiry" class="mb-1 block text-sm font-medium text-gray-700">유효기간</label>
						<input id="expiry" type="text" value={expiry} oninput={handleExpiryInput} required maxlength="5" class="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100" placeholder="MM/YY" />
					</div>
					<div>
						<label for="cvc" class="mb-1 block text-sm font-medium text-gray-700">CVC</label>
						<input id="cvc" type="text" value={cvc} oninput={handleCvcInput} required maxlength="3" class="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100" placeholder="000" />
					</div>
				</div>

				<button type="submit" disabled={processing} class="w-full rounded-xl bg-gray-900 py-3.5 font-semibold text-white transition-colors hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
					{#if processing}
						<span class="inline-flex items-center gap-2">
							<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
							결제 처리 중...
						</span>
					{:else}
						{data.plan.price} 결제하기
					{/if}
				</button>

				<p class="mt-4 text-center text-xs text-gray-300">이 결제는 데모용이며 실제 결제가 이루어지지 않습니다.</p>
			</form>
		{/if}
	</main>
</div>
