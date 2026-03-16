import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { login, createSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		const redirectTo = url.searchParams.get('redirect') || '/';
		redirect(302, redirectTo);
	}
	return {
		redirect: url.searchParams.get('redirect') || ''
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString() ?? '';
		const password = data.get('password')?.toString() ?? '';
		const redirectTo = data.get('redirect')?.toString() || '/';

		if (!email || !password) {
			return fail(400, { email, error: '이메일과 비밀번호를 입력해주세요.' });
		}

		const user = await login(email, password);
		if (!user) {
			return fail(400, { email, error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
		}

		await createSession(user.id, cookies);
		redirect(302, redirectTo);
	}
};
