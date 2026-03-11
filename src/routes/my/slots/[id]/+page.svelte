<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';

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

	function daysSince(dateStr: string): number {
		const start = new Date(dateStr);
		const now = new Date();
		return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
	}

	function formatTime(dateStr: string): string {
		return new Date(dateStr).toLocaleTimeString('ko-KR', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function scrollToBottom() {
		await tick();
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}

	function handleImageSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file || !file.type.startsWith('image/')) return;

		const reader = new FileReader();
		reader.onload = (ev) => {
			pendingImage = ev.target?.result as string;
		};
		reader.readAsDataURL(file);
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

		// 낙관적 UI: 사용자 메시지 바로 표시
		const tempUserMsg: Message = {
			id: 'temp-user',
			role: 'user',
			content,
			imageUrl: imageToSend,
			createdAt: new Date().toISOString()
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
				// 임시 메시지를 실제 메시지로 교체
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

	// 초기 스크롤
	$effect(() => {
		scrollToBottom();
	});
</script>

<svelte:head>
	<title>{data.slot.acneType} 채팅 — AcneScan</title>
</svelte:head>

<div class="flex h-screen flex-col bg-linear-to-br from-rose-50 via-white to-pink-50">
	<!-- Header -->
	<header class="shrink-0 border-b border-rose-100 bg-white/70 backdrop-blur-sm">
		<div class="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
			<a href="/my" class="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
				← 뒤로
			</a>
			<img
				src={data.slot.imageUrl}
				alt={data.slot.acneType}
				class="h-10 w-10 rounded-full object-cover"
			/>
			<div class="flex-1">
				<div class="flex items-center gap-2">
					<h1 class="font-bold text-gray-900">{data.slot.acneType}</h1>
					<span class="rounded-full px-2 py-0.5 text-xs font-medium {severityColor[data.slot.severity] ?? ''}">
						{data.slot.severity}
					</span>
				</div>
				<p class="text-xs text-gray-400">D+{daysSince(data.slot.startDate)} · 치료 진행중</p>
			</div>
		</div>
	</header>

	<!-- Chat Messages -->
	<div
		bind:this={chatContainer}
		class="flex-1 overflow-y-auto px-4 py-6"
	>
		<div class="mx-auto max-w-2xl space-y-4">
			<!-- Welcome message -->
			{#if messages.length === 0}
				<div class="mx-auto max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
					<div class="mb-3 text-4xl">🤖</div>
					<h2 class="mb-2 font-bold text-gray-800">AI 피부 상담사</h2>
					<p class="mb-4 text-sm text-gray-500">
						{data.slot.acneType}에 대해 궁금한 점을 물어보세요.<br />
						경과 사진을 보내면 상태를 분석해드려요.
					</p>
					<div class="flex flex-wrap justify-center gap-2 text-xs">
						<button
							onclick={() => { inputText = '증상이 가려워요'; sendMessage(); }}
							class="rounded-full bg-rose-50 px-3 py-1.5 text-rose-500 hover:bg-rose-100"
						>가려움 상담</button>
						<button
							onclick={() => { inputText = '언제 나을 수 있을까요?'; sendMessage(); }}
							class="rounded-full bg-rose-50 px-3 py-1.5 text-rose-500 hover:bg-rose-100"
						>치료 기간</button>
						<button
							onclick={() => { inputText = '짜도 되나요?'; sendMessage(); }}
							class="rounded-full bg-rose-50 px-3 py-1.5 text-rose-500 hover:bg-rose-100"
						>압출 여부</button>
					</div>
				</div>
			{/if}

			{#each messages as message}
				{#if message.role === 'user'}
					<!-- User Message -->
					<div class="flex justify-end">
						<div class="max-w-[75%]">
							{#if message.imageUrl}
								<img
									src={message.imageUrl}
									alt="경과 사진"
									class="mb-1 rounded-2xl rounded-tr-sm object-cover max-h-48"
								/>
							{/if}
							{#if message.content}
								<div class="rounded-2xl rounded-tr-sm bg-rose-500 px-4 py-3 text-white">
									<p class="whitespace-pre-wrap text-sm">{message.content}</p>
								</div>
							{/if}
							<p class="mt-1 text-right text-[10px] text-gray-300">{formatTime(message.createdAt)}</p>
						</div>
					</div>
				{:else}
					<!-- AI Message -->
					<div class="flex justify-start gap-2">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm">
							🤖
						</div>
						<div class="max-w-[75%]">
							<div class="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
								<p class="whitespace-pre-wrap text-sm text-gray-700">{@html formatMarkdown(message.content)}</p>
							</div>
							<p class="mt-1 text-[10px] text-gray-300">{formatTime(message.createdAt)}</p>
						</div>
					</div>
				{/if}
			{/each}

			<!-- Typing Indicator -->
			{#if isSending}
				<div class="flex justify-start gap-2">
					<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm">
						🤖
					</div>
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

	<!-- Pending Image Preview -->
	{#if pendingImage}
		<div class="shrink-0 border-t border-rose-100 bg-white px-4 py-2">
			<div class="mx-auto flex max-w-2xl items-center gap-2">
				<img src={pendingImage} alt="첨부 이미지" class="h-16 w-16 rounded-xl object-cover" />
				<button
					onclick={removePendingImage}
					class="rounded-full bg-gray-100 p-1 text-xs text-gray-500 hover:bg-gray-200"
				>✕</button>
			</div>
		</div>
	{/if}

	<!-- Input Area -->
	<div class="shrink-0 border-t border-rose-100 bg-white/90 backdrop-blur-sm">
		<div class="mx-auto flex max-w-2xl items-end gap-2 px-4 py-3">
			<button
				onclick={() => fileInput.click()}
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
			>
				📷
			</button>
			<input
				bind:this={fileInput}
				type="file"
				accept="image/*"
				class="hidden"
				onchange={handleImageSelect}
			/>

			<textarea
				bind:value={inputText}
				onkeydown={handleKeydown}
				placeholder="증상이나 경과를 알려주세요..."
				rows="1"
				class="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
			></textarea>

			<button
				onclick={sendMessage}
				disabled={isSending || (!inputText.trim() && !pendingImage)}
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white transition-colors hover:bg-rose-600 disabled:opacity-40"
			>
				↑
			</button>
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
