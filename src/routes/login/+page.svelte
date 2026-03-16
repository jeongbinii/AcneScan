<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { form } = $props();

	const redirectParam = $derived(page.url.searchParams.get('redirect') || '');
</script>

<svelte:head>
	<title>로그인 — AcneScan</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4" style="background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px); background-size: 24px 24px;">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<a href="/" class="inline-flex items-center gap-2.5">
				<div class="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-xs text-white font-bold">AI</div>
				<span class="text-2xl font-bold text-gray-900">AcneScan</span>
			</a>
			<p class="mt-2 text-sm text-gray-400">계정에 로그인하세요</p>
		</div>

		<form method="POST" use:enhance class="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
			{#if redirectParam}
				<input type="hidden" name="redirect" value={redirectParam} />
			{/if}

			{#if form?.error}
				<div class="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
					{form.error}
				</div>
			{/if}

			<div class="mb-4">
				<label for="email" class="mb-1 block text-sm font-medium text-gray-700">이메일</label>
				<input id="email" name="email" type="email" value={form?.email ?? ''} required class="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100" placeholder="you@example.com" />
			</div>

			<div class="mb-6">
				<label for="password" class="mb-1 block text-sm font-medium text-gray-700">비밀번호</label>
				<input id="password" name="password" type="password" required class="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100" placeholder="비밀번호를 입력하세요" />
			</div>

			<button type="submit" class="w-full rounded-xl bg-gray-900 py-3 font-semibold text-white transition-colors hover:bg-gray-800 active:scale-[0.98]">
				로그인
			</button>

			<p class="mt-6 text-center text-sm text-gray-400">
				계정이 없으신가요?
				<a href="/register{redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}" class="font-medium text-rose-600 hover:text-rose-700">회원가입</a>
			</p>
		</form>
	</div>
</div>
