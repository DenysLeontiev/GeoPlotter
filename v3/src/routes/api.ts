import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { Env } from '../types/database';
import { createClient } from '@supabase/supabase-js';

// Define Hono context with typed variables
type HonoContext = {
	Bindings: Env;
	Variables: {
		userId: number;
	};
};

const api = new Hono<HonoContext>();

// Allow requests from the client's origin
api.use('*', cors({ origin: 'https://wars-adrian-gotten-certificate.trycloudflare.com' }));

api.use('/*', async (c, next) => {
	const authHeader = c.req.header('Authorization');
	if (!authHeader || !authHeader.startsWith('tma ')) {
		throw new HTTPException(401, { message: 'Unauthorized' });
	}

	const initData = authHeader.substring(4);

	const params = new URLSearchParams(initData);
	const hash = params.get('hash');
	params.delete('hash');

	const dataCheckString = Array.from(params.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');

	const secretKey = await crypto.subtle.importKey('raw', new TextEncoder().encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, true, [
		'sign',
	]);

	const secret = await crypto.subtle.sign('HMAC', secretKey, new TextEncoder().encode(c.env.BOT_TOKEN));

	const key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, true, ['sign']);

	const calculatedHash = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dataCheckString));

	const hexHash = [...new Uint8Array(calculatedHash)].map((b) => b.toString(16).padStart(2, '0')).join('');

	if (hexHash !== hash) {
		throw new HTTPException(401, { message: 'Unauthorized: Invalid hash' });
	}

	const authDate = params.get('auth_date');
	if (authDate) {
		const now = Math.floor(Date.now() / 1000);
		const diff = now - parseInt(authDate, 10);
		if (diff > 3600) {
			// 1 hour
			throw new HTTPException(401, { message: 'Unauthorized: Outdated request' });
		}
	}

	// Extract user ID and set it in the context
	const userString = params.get('user');
	if (!userString) {
		throw new HTTPException(401, { message: 'Unauthorized: User data not found' });
	}
	try {
		const user = JSON.parse(userString);
		if (!user || !user.id) {
			throw new Error('Invalid user data');
		}
		c.set('userId', user.id);
	} catch (e) {
		throw new HTTPException(401, { message: 'Unauthorized: Invalid user data' });
	}

	await next();
});

api.get('/journeys', async (c) => {
	const userId = c.get('userId');
	const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_API_KEY);
	const { data, error } = await supabase.from('journey').select('id, start_time, end_time, distance, avg_speed').eq('user_id', userId);
	if (error) {
		console.error('Supabase error fetching journeys:', error);
		throw new HTTPException(500, { message: 'Failed to fetch journeys' });
	}
	return c.json(data);
});

api.get('/journeys/:id/coordinates', async (c) => {
	const userId = c.get('userId');
	const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_API_KEY);
	const { id } = c.req.param();

	// First, verify the journey belongs to the user
	const { data: journeyData, error: journeyError } = await supabase
		.from('journey')
		.select('id')
		.eq('id', id)
		.eq('user_id', userId)
		.single();

	if (journeyError || !journeyData) {
		throw new HTTPException(404, { message: 'Journey not found or access denied' });
	}

	const { data, error } = await supabase.from('coordinate').select('latitude, longitude, timestamp').eq('journey_id', id);
	if (error) {
		console.error(`Supabase error fetching coordinates for journey ${id}:`, error);
		throw new HTTPException(500, { message: 'Failed to fetch coordinates' });
	}
	return c.json(data);
});

export default api;
