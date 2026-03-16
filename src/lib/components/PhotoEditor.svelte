<script lang="ts">
	import { onMount } from 'svelte';

	let {
		imageUrl,
		onConfirm,
		onCancel
	}: {
		imageUrl: string;
		onConfirm: (editedDataUrl: string) => void;
		onCancel: () => void;
	} = $props();

	let brightness = $state(100);
	let contrast = $state(100);
	let saturation = $state(100);
	let rotation = $state(0);

	// 크롭 상태
	let isCropping = $state(false);
	let cropStartX = $state(0);
	let cropStartY = $state(0);
	let cropEndX = $state(0);
	let cropEndY = $state(0);
	let isDraggingCrop = $state(false);
	let imageContainer: HTMLDivElement = $state() as HTMLDivElement;
	let displayedImg: HTMLImageElement = $state() as HTMLImageElement;

	const filterStyle = $derived(
		`brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
	);

	const transformStyle = $derived(`rotate(${rotation}deg)`);

	// 크롭 영역 계산 (정규화)
	const cropLeft = $derived(Math.min(cropStartX, cropEndX));
	const cropTop = $derived(Math.min(cropStartY, cropEndY));
	const cropWidth = $derived(Math.abs(cropEndX - cropStartX));
	const cropHeight = $derived(Math.abs(cropEndY - cropStartY));

	function startCrop(e: MouseEvent) {
		if (!isCropping) return;
		const rect = imageContainer.getBoundingClientRect();
		cropStartX = e.clientX - rect.left;
		cropStartY = e.clientY - rect.top;
		cropEndX = cropStartX;
		cropEndY = cropStartY;
		isDraggingCrop = true;
	}

	function moveCrop(e: MouseEvent) {
		if (!isDraggingCrop) return;
		const rect = imageContainer.getBoundingClientRect();
		cropEndX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
		cropEndY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
	}

	function endCrop() {
		isDraggingCrop = false;
	}

	function applyCrop() {
		if (cropWidth < 10 || cropHeight < 10 || !displayedImg) return;

		const rect = imageContainer.getBoundingClientRect();
		const scaleX = displayedImg.naturalWidth / displayedImg.width;
		const scaleY = displayedImg.naturalHeight / displayedImg.height;

		// displayedImg offset within container
		const imgRect = displayedImg.getBoundingClientRect();
		const offsetX = imgRect.left - rect.left;
		const offsetY = imgRect.top - rect.top;

		const sx = Math.max(0, (cropLeft - offsetX) * scaleX);
		const sy = Math.max(0, (cropTop - offsetY) * scaleY);
		const sw = Math.min(displayedImg.naturalWidth - sx, cropWidth * scaleX);
		const sh = Math.min(displayedImg.naturalHeight - sy, cropHeight * scaleY);

		const canvas = document.createElement('canvas');
		canvas.width = sw;
		canvas.height = sh;
		const ctx = canvas.getContext('2d')!;
		ctx.drawImage(displayedImg, sx, sy, sw, sh, 0, 0, sw, sh);

		// imageUrl을 크롭된 이미지로 교체 (내부적으로)
		croppedUrl = canvas.toDataURL('image/jpeg', 0.95);
		isCropping = false;
	}

	function cancelCrop() {
		isCropping = false;
		cropStartX = cropStartY = cropEndX = cropEndY = 0;
	}

	let croppedUrl: string | null = $state(null);
	const currentImageUrl = $derived(croppedUrl ?? imageUrl);

	function resetAll() {
		brightness = 100;
		contrast = 100;
		saturation = 100;
		rotation = 0;
		croppedUrl = null;
		isCropping = false;
	}

	async function applyAndConfirm() {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.src = currentImageUrl;
		await new Promise((resolve) => { img.onload = resolve; });

		const rad = (rotation * Math.PI) / 180;
		const sin = Math.abs(Math.sin(rad));
		const cos = Math.abs(Math.cos(rad));
		const w = img.width;
		const h = img.height;
		const canvasW = Math.ceil(w * cos + h * sin);
		const canvasH = Math.ceil(w * sin + h * cos);

		const canvas = document.createElement('canvas');
		canvas.width = canvasW;
		canvas.height = canvasH;
		const ctx = canvas.getContext('2d')!;

		ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
		ctx.translate(canvasW / 2, canvasH / 2);
		ctx.rotate(rad);
		ctx.drawImage(img, -w / 2, -h / 2, w, h);

		onConfirm(canvas.toDataURL('image/jpeg', 0.9));
	}

	type ControlDef = { label: string; key: 'brightness' | 'contrast' | 'saturation' | 'rotation'; min: number; max: number; unit: string };

	const controls: ControlDef[] = [
		{ label: '밝기', key: 'brightness', min: 30, max: 200, unit: '%' },
		{ label: '대비', key: 'contrast', min: 30, max: 200, unit: '%' },
		{ label: '채도', key: 'saturation', min: 0, max: 200, unit: '%' },
		{ label: '회전', key: 'rotation', min: -180, max: 180, unit: '°' }
	];

	function getValue(key: ControlDef['key']): number {
		const map = { brightness, contrast, saturation, rotation };
		return map[key];
	}

	function setValue(key: ControlDef['key'], val: number) {
		if (key === 'brightness') brightness = val;
		else if (key === 'contrast') contrast = val;
		else if (key === 'saturation') saturation = val;
		else if (key === 'rotation') rotation = val;
	}
</script>

<svelte:window onmousemove={moveCrop} onmouseup={endCrop} />

<div class="flex flex-col gap-4">
	<!-- 미리보기 -->
	<div
		bind:this={imageContainer}
		class="relative flex items-center justify-center overflow-hidden rounded-2xl bg-gray-900 p-2 select-none"
		style="min-height: 280px;"
		onmousedown={startCrop}
		role={isCropping ? 'application' : undefined}
	>
		<img
			bind:this={displayedImg}
			src={currentImageUrl}
			alt="보정 미리보기"
			class="max-h-64 rounded-xl object-contain"
			style="filter: {filterStyle}; transform: {transformStyle};"
			draggable="false"
		/>

		{#if isCropping && (cropWidth > 2 || cropHeight > 2)}
			<!-- 어두운 오버레이 -->
			<div class="pointer-events-none absolute inset-0 bg-black/40"></div>
			<!-- 크롭 영역 (밝게) -->
			<div
				class="pointer-events-none absolute border-2 border-white shadow-lg"
				style="left: {cropLeft}px; top: {cropTop}px; width: {cropWidth}px; height: {cropHeight}px; background: transparent; box-shadow: 0 0 0 9999px rgba(0,0,0,0.4);"
			>
				<!-- 모서리 핸들 -->
				<div class="absolute -left-1 -top-1 h-3 w-3 rounded-sm bg-white"></div>
				<div class="absolute -right-1 -top-1 h-3 w-3 rounded-sm bg-white"></div>
				<div class="absolute -bottom-1 -left-1 h-3 w-3 rounded-sm bg-white"></div>
				<div class="absolute -bottom-1 -right-1 h-3 w-3 rounded-sm bg-white"></div>
				<!-- 크기 표시 -->
				<div class="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white whitespace-nowrap">
					{Math.round(cropWidth)} × {Math.round(cropHeight)}
				</div>
			</div>
		{/if}

		{#if isCropping && cropWidth < 3 && cropHeight < 3}
			<div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
				<p class="rounded-xl bg-black/60 px-4 py-2 text-sm font-medium text-white">드래그하여 자를 영역을 선택하세요</p>
			</div>
		{/if}
	</div>

	<!-- 자르기 모드 버튼 -->
	{#if isCropping}
		<div class="flex gap-2">
			<button onclick={cancelCrop} class="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
				자르기 취소
			</button>
			<button
				onclick={applyCrop}
				disabled={cropWidth < 10 || cropHeight < 10}
				class="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-40 transition-colors"
			>
				자르기 적용
			</button>
		</div>
	{/if}

	<!-- 슬라이더 컨트롤 -->
	{#if !isCropping}
		<div class="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
			{#each controls as ctrl}
				<div class="flex items-center gap-3">
					<span class="w-10 text-xs font-medium text-gray-500">{ctrl.label}</span>
					<input
						type="range"
						min={ctrl.min}
						max={ctrl.max}
						value={getValue(ctrl.key)}
						oninput={(e) => setValue(ctrl.key, Number((e.target as HTMLInputElement).value))}
						class="flex-1 accent-rose-500"
					/>
					<span class="w-12 text-right text-xs text-gray-400">{getValue(ctrl.key)}{ctrl.unit}</span>
				</div>
			{/each}
		</div>

		<!-- 버튼 -->
		<div class="flex gap-2">
			<button onclick={resetAll} class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
				초기화
			</button>
			<button onclick={() => { isCropping = true; cropStartX = cropStartY = cropEndX = cropEndY = 0; }} class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
				✂️ 자르기
			</button>
			<button onclick={onCancel} class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
				취소
			</button>
			<button onclick={applyAndConfirm} class="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 transition-colors">
				업로드
			</button>
		</div>
	{/if}
</div>
