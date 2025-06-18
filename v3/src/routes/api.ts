import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { Env } from '../types/database';

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
	const db = c.env.DB;
	try {
		const { results } = await db
			.prepare('SELECT id, start_time, end_time, distance, avg_speed FROM journey WHERE user_id = ?')
			.bind(userId)
			.all();
		return c.json(results);
	} catch (error) {
		console.error('D1 error fetching journeys:', error);
		throw new HTTPException(500, { message: 'Failed to fetch journeys' });
	}
});

api.get('/journeys/:id/coordinates', async (c) => {
	const userId = c.get('userId');
	const db = c.env.DB;
	const { id } = c.req.param();

	try {
		// First, verify the journey belongs to the user
		const { results: journeyResults } = await db.prepare('SELECT id FROM journey WHERE id = ? AND user_id = ?').bind(id, userId).all();

		if (journeyResults.length === 0) {
			throw new HTTPException(404, { message: 'Journey not found or does not belong to the user' });
		}

		// Then, fetch the coordinates for that journey
		const { results: coordinateResults } = await db
			.prepare('SELECT latitude, longitude, timestamp, heading, horizontal_accuracy FROM coordinate WHERE journey_id = ?')
			.bind(id)
			.all();

		return c.json(coordinateResults);
	} catch (error) {
		if (error instanceof HTTPException) {
			throw error; // Re-throw HTTP exceptions
		}
		console.error('D1 error fetching coordinates:', error);
		throw new HTTPException(500, { message: 'Failed to fetch coordinates' });
	}
});

export default api;
