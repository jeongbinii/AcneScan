<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>로그인 — AcneScan</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-linear-to-br from-rose-50 via-white to-pink-50 px-4">
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="mb-8 text-center">
			<a href="/" class="inline-flex items-center gap-2">
				<span class="text-3xl">🔬</span>
				<span class="text-2xl font-bold text-rose-600">AcneScan</span>
			</a>
			<p class="mt-2 text-sm text-gray-400">계정에 로그인하세요</p>
		</div>

		<!-- Login Form -->
		<form method="POST" use:enhance class="rounded-3xl bg-white p-8 shadow-lg">
			{#if form?.error}
				<div class="mb-4 rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
					{form.error}
				</div>
			{/if}

			<div class="mb-4">
				<label for="email" class="mb-1 block text-sm font-medium text-gray-700">이메일</label>
				<input
					id="email"
					name="email"
					type="email"
					value={form?.email ?? ''}
					required
					class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
					placeholder="you@example.com"
				/>
			</div>

			<div class="mb-6">
				<label for="password" class="mb-1 block text-sm font-medium text-gray-700">비밀번호</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
					placeholder="비밀번호를 입력하세요"
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-2xl bg-rose-500 py-3 font-semibold text-white transition-colors hover:bg-rose-600 active:scale-95"
			>
				로그인
			</button>

			<p class="mt-6 text-center text-sm text-gray-400">
				계정이 없으신가요?
				<a href="/register" class="font-medium text-rose-500 hover:text-rose-600">회원가입</a>
			</p>
		</form>
	</div>
</div>
