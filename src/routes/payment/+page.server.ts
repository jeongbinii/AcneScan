import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const currentUrl = `/payment?plan=${url.searchParams.get('plan') || 'pro'}`;
		redirect(302, `/login?redirect=${encodeURIComponent(currentUrl)}`);
	}

	const plan = url.searchParams.get('plan') || 'pro';
	const planInfo: Record<string, { name: string; price: string; period: string }> = {
		pro: { name: 'Pro', price: '₩4,900', period: '/월' },
		premium: { name: 'Premium', price: '₩9,900', period: '/월' }
	};

	return {
		plan: planInfo[plan] || planInfo.pro,
		planKey: plan
	};
};
