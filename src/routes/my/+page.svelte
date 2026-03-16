<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	type Item = { id: string; name: string; category: string; memo: string | null };
	type Slot = typeof data.slots[number];

	let items: Item[] = $state(data.items);
	let slots: Slot[] = $state(data.slots);
	let showAddItem = $state(false);
	let newItemName = $state('');
	let newItemCategory = $state('연고');
	let newItemMemo = $state('');
	let isAddingItem = $state(false);

	// 아이템 선택 삭제
	let itemEditMode = $state(false);
	let selectedItems: Set<string> = $state(new Set());
	let isDeletingItems = $state(false);

	// 슬롯 선택 삭제
	let slotEditMode = $state(false);
	let selectedSlots: Set<string> = $state(new Set());
	let isDeletingSlots = $state(false);

	// 슬롯 편집 (이름/날짜)
	let editingSlotId: string | null = $state(null);
	let editName = $state('');
	let editDate = $state('');

	const CATEGORIES = ['연고', '패치', '세안제', '토너', '세럼', '마스크', '보습제', '선크림', '기타'];

	const categoryIcon: Record<string, string> = {
		연고: '💊', 패치: '🩹', 세안제: '🧴', 토너: '💧', 세럼: '✨',
		마스크: '🎭', 보습제: '🧊', 선크림: '☀️', 기타: '📦'
	};

	const severityColor: Record<string, string> = {
		경증: 'bg-green-100 text-green-700',
		중등증: 'bg-yellow-100 text-yellow-700',
		중증: 'bg-red-100 text-red-700'
	};

	const acneTypeColor: Record<string, string> = {
		'화농성 여드름': 'bg-red-100 text-red-600 border-red-200',
		'블랙헤드': 'bg-gray-100 text-gray-600 border-gray-200',
		'구진성 여드름': 'bg-orange-100 text-orange-600 border-orange-200',
		'낭종성 여드름': 'bg-purple-100 text-purple-600 border-purple-200',
		'좁쌀 여드름': 'bg-yellow-100 text-yellow-600 border-yellow-200',
		'화이트헤드': 'bg-blue-100 text-blue-600 border-blue-200'
	};

	const defaultAcneTypeColor = 'bg-rose-100 text-rose-600 border-rose-200';

	function daysSince(dateStr: string): number {
		return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	function toDateInputValue(dateStr: string): string {
		return new Date(dateStr).toISOString().split('T')[0];
	}

	async function addItem() {
		if (!newItemName.trim()) return;
		isAddingItem = true;
		try {
			const res = await fetch('/api/items', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newItemName.trim(), category: newItemCategory, memo: newItemMemo.trim() || null })
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

	function toggleItemSelect(id: string) {
		const next = new Set(selectedItems);
		if (next.has(id)) next.delete(id); else next.add(id);
		selectedItems = next;
	}

	function toggleAllItems() {
		selectedItems = selectedItems.size === items.length ? new Set() : new Set(items.map((i) => i.id));
	}

	async function deleteSelectedItems() {
		if (selectedItems.size === 0) return;
		isDeletingItems = true;
		try {
			await Promise.all([...selectedItems].map((id) => fetch(`/api/items/${id}`, { method: 'DELETE' })));
			items = items.filter((item) => !selectedItems.has(item.id));
			selectedItems = new Set();
			itemEditMode = false;
		} finally {
			isDeletingItems = false;
		}
	}

	function cancelItemEdit() {
		itemEditMode = false;
		selectedItems = new Set();
	}

	function toggleSlotSelect(id: string) {
		const next = new Set(selectedSlots);
		if (next.has(id)) next.delete(id); else next.add(id);
		selectedSlots = next;
	}

	function toggleAllSlots() {
		selectedSlots = selectedSlots.size === slots.length ? new Set() : new Set(slots.map((s) => s.id));
	}

	async function deleteSelectedSlots() {
		if (selectedSlots.size === 0) return;
		isDeletingSlots = true;
		try {
			await Promise.all([...selectedSlots].map((id) => fetch(`/api/slots/${id}`, { method: 'DELETE' })));
			slots = slots.filter((slot) => !selectedSlots.has(slot.id));
			selectedSlots = new Set();
			slotEditMode = false;
		} finally {
			isDeletingSlots = false;
		}
	}

	function cancelSlotEdit() {
		slotEditMode = false;
		selectedSlots = new Set();
	}

	function startEditSlot(slot: Slot) {
		editingSlotId = slot.id;
		editName = slot.name;
		editDate = toDateInputValue(slot.startDate);
	}

	async function saveEditSlot() {
		if (!editingSlotId) return;
		const res = await fetch(`/api/slots/${editingSlotId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: editName, startDate: editDate })
		});
		if (res.ok) {
			slots = slots.map((s) =>
				s.id === editingSlotId
					? { ...s, name: editName, startDate: new Date(editDate).toISOString() }
					: s
			);
			editingSlotId = null;
		}
	}

	function cancelEditSlot() {
		editingSlotId = null;
	}
</script>

<svelte:head>
	<title>마이홈 — AcneScan</title>
</svelte:head>

<div class="min-h-screen bg-gray-50" style="background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px); background-size: 24px 24px;">
	<header class="border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href="/" class="flex items-center gap-2.5">
				<div class="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs text-white font-black tracking-tight">AI</div>
				<span class="text-xl font-bold text-gray-900">AcneScan</span>
			</a>
			<nav class="flex items-center gap-5 text-sm text-gray-500">
				<a href="/" class="hover:text-gray-900 transition-colors">홈</a>
				<a href="/my" class="text-gray-900 font-medium">마이홈</a>
				{#if data.user}
					<span class="text-gray-700 font-medium">{data.user.name}님</span>
					<form method="POST" action="/logout" use:enhance>
						<button type="submit" class="rounded-lg bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors">로그아웃</button>
					</form>
				{/if}
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-6 py-12">
		<div class="mb-10">
			<h1 class="text-3xl font-black text-gray-900">마이홈</h1>
			<p class="mt-1 text-sm text-gray-400">내 여드름 치료 현황을 확인하세요</p>
		</div>

		<!-- 피부 아이템 섹션 -->
		<section class="mb-12">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-bold text-gray-800">🧴 내 피부 아이템</h2>
				<div class="flex items-center gap-2">
					{#if itemEditMode}
						<button onclick={toggleAllItems} class="rounded-xl px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
							{selectedItems.size === items.length ? '전체 해제' : '전체 선택'}
						</button>
						<button onclick={deleteSelectedItems} disabled={selectedItems.size === 0 || isDeletingItems} class="rounded-xl bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-40 transition-colors">
							{isDeletingItems ? '삭제 중...' : `삭제 (${selectedItems.size})`}
						</button>
						<button onclick={cancelItemEdit} class="rounded-xl px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">취소</button>
					{:else}
						{#if items.length > 0}
							<button onclick={() => (itemEditMode = true)} class="rounded-xl px-3 py-1.5 text-sm font-medium text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors">편집</button>
						{/if}
						<button onclick={() => (showAddItem = !showAddItem)} class="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
							{showAddItem ? '취소' : '+ 아이템 추가'}
						</button>
					{/if}
				</div>
			</div>

			{#if showAddItem}
				<div class="mb-4 rounded-2xl bg-white p-5 shadow-sm">
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<div>
							<label for="item-name" class="mb-1 block text-xs font-medium text-gray-500">아이템 이름</label>
							<input id="item-name" bind:value={newItemName} type="text" placeholder="예: 벤조일퍼옥사이드 연고" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100" />
						</div>
						<div>
							<label for="item-category" class="mb-1 block text-xs font-medium text-gray-500">카테고리</label>
							<select id="item-category" bind:value={newItemCategory} class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100">
								{#each CATEGORIES as cat}
									<option value={cat}>{categoryIcon[cat]} {cat}</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="item-memo" class="mb-1 block text-xs font-medium text-gray-500">메모 (선택)</label>
							<input id="item-memo" bind:value={newItemMemo} type="text" placeholder="예: 2% 농도, 야간용" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100" />
						</div>
					</div>
					<button onclick={addItem} disabled={!newItemName.trim() || isAddingItem} class="mt-3 rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors">
						{isAddingItem ? '추가 중...' : '추가하기'}
					</button>
				</div>
			{/if}

			{#if items.length === 0}
				<div class="rounded-2xl bg-white p-8 text-center shadow-sm">
					<p class="text-sm text-gray-400">보유한 피부 아이템을 등록하면 AI가 맞춤 해결방안을 제시해요.</p>
				</div>
			{:else}
				<div class="flex flex-wrap gap-2">
					{#each items as item}
						{#if itemEditMode}
							<button onclick={() => toggleItemSelect(item.id)} class="flex items-center gap-2 rounded-full px-4 py-2 shadow-sm transition-all {selectedItems.has(item.id) ? 'bg-red-50 border-2 border-red-300 ring-2 ring-red-100' : 'bg-white border-2 border-transparent hover:border-gray-200'}">
								<span class="flex h-5 w-5 items-center justify-center rounded border-2 text-xs {selectedItems.has(item.id) ? 'border-red-500 bg-red-500 text-white' : 'border-gray-300'}">
									{#if selectedItems.has(item.id)}✓{/if}
								</span>
								<span class="text-base">{categoryIcon[item.category] ?? '📦'}</span>
								<span class="text-sm font-medium text-gray-700">{item.name}</span>
							</button>
						{:else}
							<div class="group flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md">
								<span class="text-base">{categoryIcon[item.category] ?? '📦'}</span>
								<span class="text-sm font-medium text-gray-700">{item.name}</span>
								{#if item.memo}
									<span class="text-xs text-gray-400">· {item.memo}</span>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</section>

		<!-- 여드름 슬롯 섹션 -->
		<section>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-bold text-gray-800">🗂️ 내 여드름 슬롯</h2>
				{#if slotEditMode}
					<div class="flex items-center gap-2">
						<button onclick={toggleAllSlots} class="rounded-xl px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
							{selectedSlots.size === slots.length ? '전체 해제' : '전체 선택'}
						</button>
						<button onclick={deleteSelectedSlots} disabled={selectedSlots.size === 0 || isDeletingSlots} class="rounded-xl bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-40 transition-colors">
							{isDeletingSlots ? '삭제 중...' : `삭제 (${selectedSlots.size})`}
						</button>
						<button onclick={cancelSlotEdit} class="rounded-xl px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">취소</button>
					</div>
				{:else}
					<div class="flex items-center gap-2">
						{#if slots.length > 0}
							<button onclick={() => (slotEditMode = true)} class="rounded-xl px-3 py-1.5 text-sm font-medium text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors">편집</button>
						{/if}
						<a href="/my/slots/new" class="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">+ 슬롯 추가</a>
					</div>
				{/if}
			</div>

			{#if slots.length === 0}
				<div class="flex flex-col items-center justify-center rounded-3xl bg-white py-20 shadow-sm">
					<div class="mb-4 rounded-full bg-rose-100 p-6 text-5xl">🗂️</div>
					<h2 class="mb-2 text-xl font-bold text-gray-700">아직 저장된 여드름이 없어요</h2>
					<p class="mb-6 text-sm text-gray-400">사진을 분석하고 저장해보세요!</p>
					<a href="/my/slots/new" class="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800 transition-colors">+ 슬롯 추가하기</a>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each slots as slot}
						{#if slotEditMode}
							<button onclick={() => toggleSlotSelect(slot.id)} class="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm text-left transition-all {selectedSlots.has(slot.id) ? 'ring-3 ring-red-300 shadow-md' : 'hover:shadow-lg'}">
								<div class="relative h-48 overflow-hidden">
									<img src={slot.imageUrl} alt="{slot.acneType} 사진" class="h-full w-full object-cover" />
									<div class="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg shadow-sm text-sm {selectedSlots.has(slot.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-300'}">
										{#if selectedSlots.has(slot.id)}✓{:else}○{/if}
									</div>
									{#if selectedSlots.has(slot.id)}
										<div class="absolute inset-0 bg-red-500/10"></div>
									{/if}
								</div>
								<div class="p-5">
									<h3 class="text-lg font-bold text-gray-900">{slot.name}</h3>
									<div class="mt-2 text-sm text-gray-400">{formatDate(slot.startDate)}</div>
									<div class="mt-2">
										<span class="inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium {acneTypeColor[slot.acneType] ?? defaultAcneTypeColor}">{slot.acneType}</span>
									</div>
								</div>
							</button>
						{:else if editingSlotId === slot.id}
							<!-- 이름/날짜 편집 모드 -->
							<div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg ring-2 ring-rose-300">
								<div class="relative h-48 overflow-hidden">
									<img src={slot.imageUrl} alt="{slot.acneType} 사진" class="h-full w-full object-cover" />
								</div>
								<div class="p-5">
									<div class="mb-3">
										<label class="mb-1 block text-xs font-medium text-gray-500">슬롯 이름</label>
										<input bind:value={editName} type="text" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100" />
									</div>
									<div class="mb-3">
										<label class="mb-1 block text-xs font-medium text-gray-500">시작 날짜</label>
										<input bind:value={editDate} type="date" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100" />
									</div>
									<div class="mb-3">
										<span class="inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium {acneTypeColor[slot.acneType] ?? defaultAcneTypeColor}">{slot.acneType}</span>
									</div>
									<div class="flex gap-2">
										<button onclick={saveEditSlot} class="flex-1 rounded-xl bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition-colors">저장</button>
										<button onclick={cancelEditSlot} class="flex-1 rounded-xl bg-gray-100 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors">취소</button>
									</div>
								</div>
							</div>
						{:else}
							<!-- 일반 카드 -->
							<a href="/my/slots/{slot.id}" class="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
								<div class="relative h-48 overflow-hidden">
									<img src={slot.imageUrl} alt="{slot.acneType} 사진" class="h-full w-full object-cover transition-transform group-hover:scale-105" />
									<span class="absolute right-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-rose-600 backdrop-blur-sm">D+{daysSince(slot.startDate)}</span>
								</div>
								<div class="p-5">
									<div class="flex items-center justify-between">
										<h3 class="text-lg font-bold text-gray-900">{slot.name}</h3>
										<button
											onclick={(e) => { e.preventDefault(); e.stopPropagation(); startEditSlot(slot); }}
											class="rounded-lg p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-500 transition-colors"
											title="이름/날짜 수정"
										>✏️</button>
									</div>
									<div class="mt-2 text-sm text-gray-400">{formatDate(slot.startDate)}</div>
									<div class="mt-2 flex items-center gap-2">
										<span class="inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium {acneTypeColor[slot.acneType] ?? defaultAcneTypeColor}">{slot.acneType}</span>
										{#if slot.status === 'active'}
											<span class="inline-flex items-center gap-1 text-xs font-medium text-green-600">
												<span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
												진행중
											</span>
										{/if}
									</div>
								</div>
							</a>
						{/if}
					{/each}
				</div>
			{/if}
		</section>
	</main>
</div>
