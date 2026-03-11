import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { register, createSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString() ?? '';
		const email = data.get('email')?.toString() ?? '';
		const password = data.get('password')?.toString() ?? '';
		const confirmPassword = data.get('confirmPassword')?.toString() ?? '';

		if (!name || !email || !password) {
			return fail(400, { name, email, error: '모든 항목을 입력해주세요.' });
		}

		if (password.length < 6) {
			return fail(400, { name, email, error: '비밀번호는 6자 이상이어야 합니다.' });
		}

		if (password !== confirmPassword) {
			return fail(400, { name, email, error: '비밀번호가 일치하지 않습니다.' });
		}

		const user = await register(email, password, name);
		if (!user) {
			return fail(400, { name, email, error: '이미 사용 중인 이메일입니다.' });
		}

		await createSession(user.id, cookies);
		redirect(302, '/');
	}
};
