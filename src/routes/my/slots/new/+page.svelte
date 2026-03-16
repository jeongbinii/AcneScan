<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import PhotoEditor from '$lib/components/PhotoEditor.svelte';

	let { data } = $props();

	type AcneResult = {
		type: string;
		description: string;
		severity: string;
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

	const severityColor: Record<string, string> = {
		경증: 'bg-green-100 text-green-700',
		중등증: 'bg-yellow-100 text-yellow-700',
		중증: 'bg-red-100 text-red-700'
	};

	type SlotPageState = 'upload' | 'editing' | 'analyzing' | 'result' | 'creating';

	let pageState: SlotPageState = $state('upload');
	let fileInput: HTMLInputElement = $state() as HTMLInputElement;
	let rawImageUrl: string | null = $state(null);
	let previewUrl: string | null = $state(null);
	let analysisResult: AcneResult | null = $state(null);
	let saving = $state(false);

	function handleFileSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file || !file.type.startsWith('image/')) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			rawImageUrl = ev.target?.result as string;
			pageState = 'editing';
		};
		reader.readAsDataURL(file);
	}

	function onEditorConfirm(editedUrl: string) {
		previewUrl = editedUrl;
		pageState = 'analyzing';
		setTimeout(() => {
			analysisResult = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
			pageState = 'result';
		}, 2000);
	}

	function onEditorCancel() {
		rawImageUrl = null;
		previewUrl = null;
		pageState = 'upload';
		if (fileInput) fileInput.value = '';
	}

	async function createSlot() {
		if (!analysisResult || !previewUrl) return;
		saving = true;
		try {
			const res = await fetch('/api/slots', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					imageUrl: previewUrl,
					acneType: analysisResult.type,
					severity: analysisResult.severity,
					description: analysisResult.description,
					treatments: analysisResult.treatments,
					caution: analysisResult.caution
				})
			});
			if (res.ok) {
				const { id } = await res.json();
				goto(`/my/slots/${id}`);
			}
		} finally {
			saving = false;
		}
	}

	onMount(async () => {
		const pending = sessionStorage.getItem('pendingSlot');
		if (!pending) return;
		sessionStorage.removeItem('pendingSlot');

		pageState = 'creating';
		const slot = JSON.parse(pending);
		try {
			const res = await fetch('/api/slots', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(slot)
			});
			if (res.ok) {
				const { id } = await res.json();
				goto(`/my/slots/${id}`);
			}
		} catch {
			pageState = 'upload';
		}
	});
</script>

<svelte:head>
	<title>새 슬롯 — AcneScan</title>
</svelte:head>

<div class="flex h-screen flex-col bg-gray-50" style="background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px); background-size: 24px 24px;">
	<header class="shrink-0 border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
			<a href="/my" class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">← 뒤로</a>
			<div class="flex-1">
				<h1 class="font-bold text-gray-900">새 여드름 슬롯</h1>
				<p class="text-xs text-gray-400">사진을 업로드해서 분석을 시작하세요</p>
			</div>
		</div>
	</header>

	<div class="flex-1 overflow-y-auto px-4 py-6">
		<div class="mx-auto max-w-2xl">
			{#if pageState === 'creating'}
				<div class="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
					<div class="flex flex-col items-center gap-4 py-4">
						<div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rose-600"></div>
						<p class="font-semibold text-gray-800">대화방 생성 중...</p>
					</div>
				</div>
			{:else if pageState === 'upload'}
				<div class="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
					<div class="flex flex-col items-center">
						<div class="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">📷</div>
						<h2 class="mb-2 font-bold text-gray-800">여드름 사진을 업로드하세요</h2>
						<p class="mb-4 text-sm text-gray-500">사진을 올리면 보정 후 AI가 분석합니다.</p>
						<button onclick={() => fileInput.click()} class="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800 transition-colors">
							사진 선택하기
						</button>
						<input bind:this={fileInput} type="file" accept="image/*" class="hidden" onchange={handleFileSelect} />
						<p class="mt-3 text-xs text-gray-300">JPG, PNG, WEBP 지원</p>
					</div>
				</div>
			{:else if pageState === 'editing' && rawImageUrl}
				<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
					<h2 class="mb-4 text-center text-lg font-bold text-gray-800">사진 보정</h2>
					<PhotoEditor imageUrl={rawImageUrl} onConfirm={onEditorConfirm} onCancel={onEditorCancel} />
				</div>
			{:else if pageState === 'analyzing'}
				<div class="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
					<div class="flex flex-col items-center gap-4 py-4">
						{#if previewUrl}
							<img src={previewUrl} alt="업로드 미리보기" class="h-40 w-40 rounded-2xl object-cover opacity-60 blur-sm" />
						{/if}
						<div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rose-600"></div>
						<p class="font-semibold text-gray-800">AI 분석 중...</p>
					</div>
				</div>
			{:else if pageState === 'result' && analysisResult}
				<div class="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
					<div class="flex flex-col items-center gap-4">
						{#if previewUrl}
							<img src={previewUrl} alt="분석된 사진" class="h-40 w-40 rounded-2xl object-cover" />
						{/if}
						<div class="text-center">
							<div class="mb-1 flex items-center justify-center gap-2">
								<h3 class="text-lg font-bold text-gray-900">{analysisResult.type}</h3>
								<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {severityColor[analysisResult.severity] ?? 'bg-gray-100 text-gray-600'}">{analysisResult.severity}</span>
							</div>
							<p class="mb-4 text-sm text-gray-500">{analysisResult.description}</p>
						</div>
						<button onclick={createSlot} disabled={saving} class="w-full rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition-colors">
							{saving ? '생성 중...' : '대화방 시작하기'}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
