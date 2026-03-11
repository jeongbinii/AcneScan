import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { deleteSession } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ cookies }) => {
		await deleteSession(cookies);
		redirect(302, '/');
	}
};
