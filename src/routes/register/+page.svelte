<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>회원가입 — AcneScan</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-linear-to-br from-rose-50 via-white to-pink-50 px-4">
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="mb-8 text-center">
			<a href="/" class="inline-flex items-center gap-2">
				<span class="text-3xl">🔬</span>
				<span class="text-2xl font-bold text-rose-600">AcneScan</span>
			</a>
			<p class="mt-2 text-sm text-gray-400">새 계정을 만들어보세요</p>
		</div>

		<!-- Register Form -->
		<form method="POST" use:enhance class="rounded-3xl bg-white p-8 shadow-lg">
			{#if form?.error}
				<div class="mb-4 rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
					{form.error}
				</div>
			{/if}

			<div class="mb-4">
				<label for="name" class="mb-1 block text-sm font-medium text-gray-700">이름</label>
				<input
					id="name"
					name="name"
					type="text"
					value={form?.name ?? ''}
					required
					class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
					placeholder="홍길동"
				/>
			</div>

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

			<div class="mb-4">
				<label for="password" class="mb-1 block text-sm font-medium text-gray-700">비밀번호</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					minlength="6"
					class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
					placeholder="6자 이상"
				/>
			</div>

			<div class="mb-6">
				<label for="confirmPassword" class="mb-1 block text-sm font-medium text-gray-700">비밀번호 확인</label>
				<input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					required
					minlength="6"
					class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
					placeholder="비밀번호를 다시 입력하세요"
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-2xl bg-rose-500 py-3 font-semibold text-white transition-colors hover:bg-rose-600 active:scale-95"
			>
				회원가입
			</button>

			<p class="mt-6 text-center text-sm text-gray-400">
				이미 계정이 있으신가요?
				<a href="/login" class="font-medium text-rose-500 hover:text-rose-600">로그인</a>
			</p>
		</form>
	</div>
</div>
