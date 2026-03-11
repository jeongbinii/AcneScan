<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	type Item = { id: string; name: string; category: string; memo: string | null };

	let items: Item[] = $state(data.items);
	let showAddItem = $state(false);
	let newItemName = $state('');
	let newItemCategory = $state('연고');
	let newItemMemo = $state('');
	let isAddingItem = $state(false);

	const CATEGORIES = ['연고', '패치', '세안제', '토너', '세럼', '마스크', '보습제', '선크림', '기타'];

	const categoryIcon: Record<string, string> = {
		연고: '💊',
		패치: '🩹',
		세안제: '🧴',
		토너: '💧',
		세럼: '✨',
		마스크: '🎭',
		보습제: '🧊',
		선크림: '☀️',
		기타: '📦'
	};

	function daysSince(dateStr: string): number {
		const start = new Date(dateStr);
		const now = new Date();
		return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	const severityColor: Record<string, string> = {
		경증: 'bg-green-100 text-green-700',
		중등증: 'bg-yellow-100 text-yellow-700',
		중증: 'bg-red-100 text-red-700'
	};

	async function addItem() {
		if (!newItemName.trim()) return;

		isAddingItem = true;
		try {
			const res = await fetch('/api/items', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: newItemName.trim(),
					category: newItemCategory,
					memo: newItemMemo.trim() || null
				})
			});

			if (res.ok) {
				const item: Item = await res.json();
				items = [...items, item];
				newItemName = '';
				newItemMemo = '';
				newItemCategory = '연고';
				showAddItem = false;
			}
		} finally {
			isAddingItem = false;
		}
	}

	async function deleteItem(id: string) {
		const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
		if (res.ok) {
			items = items.filter((item) => item.id !== id);
		}
	}
</script>

<svelte:head>
	<title>마이홈 — AcneScan</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-rose-50 via-white to-pink-50">
	<!-- Header -->
	<header class="border-b border-rose-100 bg-white/70 backdrop-blur-sm">
		<div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
			<a href="/" class="flex items-center gap-2">
				<span class="text-2xl">🔬</span>
				<span class="text-xl font-bold text-rose-600">AcneScan</span>
			</a>
			<nav class="flex items-center gap-4 text-sm text-gray-500">
				<a href="/" class="hover:text-rose-500 transition-colors">홈</a>
				<a href="/my" class="text-rose-500 font-medium">마이홈</a>
				{#if data.user}
					<span class="text-gray-700 font-medium">{data.user.name}님</span>
					<form method="POST" action="/logout" use:enhance>
						<button type="submit" class="rounded-xl bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors">로그아웃</button>
					</form>
				{/if}
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-6 py-12">
		<!-- Title -->
		<div class="mb-10 flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-extrabold text-gray-900">마이홈</h1>
				<p class="mt-1 text-sm text-gray-400">내 여드름 치료 현황을 확인하세요</p>
			</div>
			<a
				href="/"
				class="rounded-2xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
			>
				+ 새 분석하기
			</a>
		</div>

		<!-- My Items Section -->
		<section class="mb-12">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-bold text-gray-800">🧴 내 피부 아이템</h2>
				<button
					onclick={() => (showAddItem = !showAddItem)}
					class="rounded-xl px-4 py-1.5 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
				>
					{showAddItem ? '취소' : '+ 아이템 추가'}
				</button>
			</div>

			<!-- Add Item Form -->
			{#if showAddItem}
				<div class="mb-4 rounded-2xl bg-white p-5 shadow-sm">
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<div>
							<label for="item-name" class="mb-1 block text-xs font-medium text-gray-500">아이템 이름</label>
							<input
								id="item-name"
								bind:value={newItemName}
								type="text"
								placeholder="예: 벤조일퍼옥사이드 연고"
								class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
							/>
						</div>
						<div>
							<label for="item-category" class="mb-1 block text-xs font-medium text-gray-500">카테고리</label>
							<select
								id="item-category"
								bind:value={newItemCategory}
								class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
							>
								{#each CATEGORIES as cat}
									<option value={cat}>{categoryIcon[cat]} {cat}</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="item-memo" class="mb-1 block text-xs font-medium text-gray-500">메모 (선택)</label>
							<input
								id="item-memo"
								bind:value={newItemMemo}
								type="text"
								placeholder="예: 2% 농도, 야간용"
								class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
							/>
						</div>
					</div>
					<button
						onclick={addItem}
						disabled={!newItemName.trim() || isAddingItem}
						class="mt-3 rounded-xl bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
					>
						{isAddingItem ? '추가 중...' : '추가하기'}
					</button>
				</div>
			{/if}

			<!-- Items List -->
			{#if items.length === 0}
				<div class="rounded-2xl bg-white p-8 text-center shadow-sm">
					<p class="text-sm text-gray-400">
						보유한 피부 아이템을 등록하면 AI가 맞춤 해결방안을 제시해요.
					</p>
				</div>
			{:else}
				<div class="flex flex-wrap gap-2">
					{#each items as item}
						<div class="group flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md">
							<span class="text-base">{categoryIcon[item.category] ?? '📦'}</span>
							<span class="text-sm font-medium text-gray-700">{item.name}</span>
							{#if item.memo}
								<span class="text-xs text-gray-400">· {item.memo}</span>
							{/if}
							<button
								onclick={() => deleteItem(item.id)}
								class="ml-1 hidden h-5 w-5 items-center justify-center rounded-full text-xs text-gray-300 hover:bg-red-50 hover:text-red-500 group-hover:flex transition-colors"
							>
								✕
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Acne Slots Section -->
		<section>
			<h2 class="mb-4 text-xl font-bold text-gray-800">🗂️ 내 여드름 슬롯</h2>

			{#if data.slots.length === 0}
				<div class="flex flex-col items-center justify-center rounded-3xl bg-white py-20 shadow-sm">
					<div class="mb-4 rounded-full bg-rose-100 p-6 text-5xl">🗂️</div>
					<h2 class="mb-2 text-xl font-bold text-gray-700">아직 저장된 여드름이 없어요</h2>
					<p class="mb-6 text-sm text-gray-400">사진을 분석하고 저장해보세요!</p>
					<a
						href="/"
						class="rounded-2xl bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-600 transition-colors"
					>
						여드름 분석하러 가기
					</a>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.slots as slot}
						<a href="/my/slots/{slot.id}" class="group block overflow-hidden rounded-3xl bg-white shadow-sm transition-shadow hover:shadow-lg">
							<div class="relative h-48 overflow-hidden">
								<img
									src={slot.imageUrl}
									alt="{slot.acneType} 사진"
									class="h-full w-full object-cover transition-transform group-hover:scale-105"
								/>
								<span class="absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium {severityColor[slot.severity] ?? 'bg-gray-100 text-gray-600'}">
									{slot.severity}
								</span>
							</div>
							<div class="p-5">
								<h3 class="text-lg font-bold text-gray-900">{slot.acneType}</h3>
								<div class="mt-3 flex items-center justify-between text-sm">
									<span class="text-gray-400">{formatDate(slot.startDate)}</span>
									<span class="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-600">
										D+{daysSince(slot.startDate)}
									</span>
								</div>
								<div class="mt-3">
									{#if slot.status === 'active'}
										<span class="inline-flex items-center gap-1 text-xs font-medium text-green-600">
											<span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
											치료 진행중
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
											<span class="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
											보관됨
										</span>
									{/if}
								</div>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</section>
	</main>
</div>
