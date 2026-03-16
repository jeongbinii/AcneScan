<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import PhotoEditor from '$lib/components/PhotoEditor.svelte';

	let { data } = $props();

	type Message = {
		id: string;
		role: string;
		content: string;
		imageUrl: string | null;
		createdAt: string;
	};

	let messages: Message[] = $state(data.messages);
	let inputText = $state('');
	let isSending = $state(false);
	let chatContainer: HTMLDivElement = $state() as HTMLDivElement;
	let fileInput: HTMLInputElement = $state() as HTMLInputElement;
	let pendingImage: string | null = $state(null);
	let rawImage: string | null = $state(null);
	let isEditingImage = $state(false);
	let showImageMenu = $state(false);
	let isCameraOpen = $state(false);
	let videoEl: HTMLVideoElement = $state() as HTMLVideoElement;
	let cameraStream: MediaStream | null = $state(null);

	function openCamera() {
		showImageMenu = false;
		isCameraOpen = true;
		navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
			.then((stream) => {
				cameraStream = stream;
				if (videoEl) videoEl.srcObject = stream;
			})
			.catch(() => {
				isCameraOpen = false;
			});
	}

	function capturePhoto() {
		if (!videoEl) return;
		const canvas = document.createElement('canvas');
		canvas.width = videoEl.videoWidth;
		canvas.height = videoEl.videoHeight;
		canvas.getContext('2d')!.drawImage(videoEl, 0, 0);
		rawImage = canvas.toDataURL('image/jpeg', 0.9);
		isEditingImage = true;
		closeCamera();
	}

	function closeCamera() {
		if (cameraStream) {
			cameraStream.getTracks().forEach((t) => t.stop());
			cameraStream = null;
		}
		isCameraOpen = false;
	}

	// 슬롯 이름/날짜 편집
	let slotName = $state(data.slot.name);
	let slotStartDate = $state(data.slot.startDate);
	let isEditingHeader = $state(false);
	let editName = $state('');
	let editDate = $state('');

	function daysSince(dateStr: string): number {
		return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
	}

	function formatTime(dateStr: string): string {
		return new Date(dateStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
	}

	function toDateInputValue(dateStr: string): string {
		return new Date(dateStr).toISOString().split('T')[0];
	}

	async function scrollToBottom() {
		await tick();
		if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
	}

	function handleImageSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file || !file.type.startsWith('image/')) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			rawImage = ev.target?.result as string;
			isEditingImage = true;
		};
		reader.readAsDataURL(file);
	}

	function onImageEditorConfirm(editedUrl: string) {
		pendingImage = editedUrl;
		rawImage = null;
		isEditingImage = false;
	}

	function onImageEditorCancel() {
		rawImage = null;
		isEditingImage = false;
		if (fileInput) fileInput.value = '';
	}

	function removePendingImage() {
		pendingImage = null;
		if (fileInput) fileInput.value = '';
	}

	async function sendMessage() {
		const content = inputText.trim();
		if (!content && !pendingImage) return;
		isSending = true;
		inputText = '';
		const imageToSend = pendingImage;
		pendingImage = null;
		if (fileInput) fileInput.value = '';

		const tempUserMsg: Message = {
			id: 'temp-user', role: 'user', content, imageUrl: imageToSend, createdAt: new Date().toISOString()
		};
		messages = [...messages, tempUserMsg];
		await scrollToBottom();

		try {
			const res = await fetch(`/api/slots/${data.slot.id}/messages`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content, imageUrl: imageToSend })
			});
			if (res.ok) {
				const { userMessage, aiMessage } = await res.json();
				messages = [...messages.filter((m) => m.id !== 'temp-user'), userMessage, aiMessage];
			}
		} finally {
			isSending = false;
			await scrollToBottom();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

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

	function startEditHeader() {
		editName = slotName;
		editDate = toDateInputValue(slotStartDate);
		isEditingHeader = true;
	}

	async function saveEditHeader() {
		const res = await fetch(`/api/slots/${data.slot.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: editName, startDate: editDate })
		});
		if (res.ok) {
			slotName = editName;
			slotStartDate = new Date(editDate).toISOString();
			isEditingHeader = false;
		}
	}

	$effect(() => { scrollToBottom(); });
</script>

<svelte:head>
	<title>{slotName} — AcneScan</title>
</svelte:head>

<div class="flex h-screen flex-col bg-gray-50" style="background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px); background-size: 24px 24px;">
	<header class="shrink-0 border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
			<a href="/my" class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">← 뒤로</a>
			<img src={data.slot.imageUrl} alt={data.slot.acneType} class="h-10 w-10 rounded-full object-cover" />
			{#if isEditingHeader}
				<div class="flex flex-1 items-center gap-2">
					<input bind:value={editName} type="text" class="w-32 rounded-lg border border-gray-200 px-2 py-1 text-sm font-bold focus:border-gray-400 focus:outline-none" />
					<input bind:value={editDate} type="date" class="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-gray-400 focus:outline-none" />
					<button onclick={saveEditHeader} class="rounded-lg bg-gray-900 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-800">저장</button>
					<button onclick={() => (isEditingHeader = false)} class="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200">취소</button>
				</div>
			{:else}
				<div class="flex-1">
					<div class="flex items-center gap-2">
						<h1 class="font-bold text-gray-900">{slotName}</h1>
						<button onclick={startEditHeader} class="rounded p-0.5 text-gray-300 hover:text-gray-500 transition-colors" title="이름/날짜 수정">✏️</button>
					</div>
					<div class="flex items-center gap-2 text-xs text-gray-400">
						<span>D+{daysSince(slotStartDate)}</span>
						<span>·</span>
						<span class="inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium {acneTypeColor[data.slot.acneType] ?? defaultAcneTypeColor}">{data.slot.acneType}</span>
					</div>
				</div>
			{/if}
		</div>
	</header>

	<!-- Chat Messages -->
	<div bind:this={chatContainer} class="flex-1 overflow-y-auto px-4 py-6">
		<div class="mx-auto max-w-2xl space-y-4">
			{#if messages.length === 0}
				<div class="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
					<div class="mb-3 text-4xl">🤖</div>
					<h2 class="mb-2 font-bold text-gray-800">AI 피부 상담사</h2>
					<p class="mb-4 text-sm text-gray-500">
						{data.slot.acneType}에 대해 궁금한 점을 물어보세요.<br />
						경과 사진을 보내면 상태를 분석해드려요.
					</p>
					<div class="flex flex-wrap justify-center gap-2 text-xs">
						<button onclick={() => { inputText = '증상이 가려워요'; sendMessage(); }} class="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200">가려움 상담</button>
						<button onclick={() => { inputText = '언제 나을 수 있을까요?'; sendMessage(); }} class="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200">치료 기간</button>
						<button onclick={() => { inputText = '짜도 되나요?'; sendMessage(); }} class="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200">압출 여부</button>
					</div>
				</div>
			{/if}

			{#each messages as message}
				{#if message.role === 'user'}
					<div class="flex justify-end">
						<div class="max-w-[75%]">
							{#if message.imageUrl}
								<img src={message.imageUrl} alt="경과 사진" class="mb-1 rounded-2xl rounded-tr-sm object-cover max-h-48" />
							{/if}
							{#if message.content}
								<div class="rounded-2xl rounded-tr-sm bg-gray-900 px-4 py-3 text-white">
									<p class="whitespace-pre-wrap text-sm">{message.content}</p>
								</div>
							{/if}
							<p class="mt-1 text-right text-[10px] text-gray-300">{formatTime(message.createdAt)}</p>
						</div>
					</div>
				{:else}
					<div class="flex justify-start gap-2">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm">🤖</div>
						<div class="max-w-[75%]">
							<div class="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
								<p class="whitespace-pre-wrap text-sm text-gray-700">{@html formatMarkdown(message.content)}</p>
							</div>
							<p class="mt-1 text-[10px] text-gray-300">{formatTime(message.createdAt)}</p>
						</div>
					</div>
				{/if}
			{/each}

			{#if isSending}
				<div class="flex justify-start gap-2">
					<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm">🤖</div>
					<div class="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
						<div class="flex gap-1">
							<div class="h-2 w-2 animate-bounce rounded-full bg-gray-300" style="animation-delay: 0ms"></div>
							<div class="h-2 w-2 animate-bounce rounded-full bg-gray-300" style="animation-delay: 150ms"></div>
							<div class="h-2 w-2 animate-bounce rounded-full bg-gray-300" style="animation-delay: 300ms"></div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- 사진 보정 에디터 -->
	{#if isEditingImage && rawImage}
		<div class="shrink-0 border-t border-gray-200 bg-white px-4 py-4">
			<div class="mx-auto max-w-2xl">
				<PhotoEditor
					imageUrl={rawImage}
					onConfirm={onImageEditorConfirm}
					onCancel={onImageEditorCancel}
				/>
			</div>
		</div>
	{:else if pendingImage}
		<div class="shrink-0 border-t border-gray-200 bg-white px-4 py-2">
			<div class="mx-auto flex max-w-2xl items-center gap-2">
				<img src={pendingImage} alt="첨부 이미지" class="h-16 w-16 rounded-xl object-cover" />
				<button onclick={removePendingImage} class="rounded-full bg-gray-100 p-1 text-xs text-gray-500 hover:bg-gray-200">✕</button>
			</div>
		</div>
	{/if}

	<!-- 카메라 촬영 -->
	{#if isCameraOpen}
		<div class="shrink-0 border-t border-gray-200 bg-black px-4 py-4">
			<div class="mx-auto max-w-2xl">
				<div class="relative overflow-hidden rounded-2xl">
					<video bind:this={videoEl} autoplay playsinline muted class="w-full rounded-2xl"></video>
				</div>
				<div class="mt-3 flex items-center justify-center gap-4">
					<button onclick={closeCamera} class="rounded-xl bg-gray-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-600 transition-colors">취소</button>
					<button onclick={capturePhoto} class="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-gray-900 text-white hover:bg-gray-800 transition-colors">
						<span class="h-10 w-10 rounded-full bg-white"></span>
					</button>
				</div>
			</div>
		</div>
	{/if}

	<div class="shrink-0 border-t border-gray-200 bg-white/90 backdrop-blur-sm">
		<div class="mx-auto flex max-w-2xl items-end gap-2 px-4 py-3">
			<div class="relative shrink-0">
				<button onclick={() => (showImageMenu = !showImageMenu)} class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">📷</button>
				{#if showImageMenu}
					<div class="absolute bottom-12 left-0 z-10 w-36 overflow-hidden rounded-xl bg-white shadow-lg border border-gray-100">
						<button
							onclick={() => { showImageMenu = false; fileInput.click(); }}
							class="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
						>
							🖼️ 사진 업로드
						</button>
						<button
							onclick={openCamera}
							class="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
						>
							📸 사진 찍기
						</button>
					</div>
				{/if}
			</div>
			<input bind:this={fileInput} type="file" accept="image/*" class="hidden" onchange={handleImageSelect} />
			<textarea bind:value={inputText} onkeydown={handleKeydown} placeholder="증상이나 경과를 알려주세요..." rows="1" class="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"></textarea>
			<button onclick={sendMessage} disabled={isSending || (!inputText.trim() && !pendingImage)} class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-rose-600 disabled:opacity-40">↑</button>
		</div>
	</div>
</div>

<script lang="ts" module>
	function formatMarkdown(text: string): string {
		return text
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/\n/g, '<br>');
	}
</script>
