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

// Centralized error handler
api.onError((err, c) => {
	if (err instanceof HTTPException) {
		// For expected errors, return the specific response
		return err.getResponse();
	}
	// For unexpected errors, log them and return a generic 500 response
	console.error('Unhandled API Error:', err);
	return c.json({ message: 'Internal Server Error' }, 500);
});

// Allow requests from any origin
api.use('*', cors({ origin: '*' }));

const verifyTelegramAuth = async (initData: string, botToken: string): Promise<{ valid: boolean; user?: any; authDate?: string }> => {
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

	const secret = await crypto.subtle.sign('HMAC', secretKey, new TextEncoder().encode(botToken));
	const key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, true, ['sign']);
	const calculatedHash = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dataCheckString));
	const hexHash = [...new Uint8Array(calculatedHash)].map((b) => b.toString(16).padStart(2, '0')).join('');

	if (hexHash !== hash) {
		return { valid: false };
	}

	const userString = params.get('user');
	const authDate = params.get('auth_date') ?? undefined;

	try {
		const user = JSON.parse(userString || 'null');
		if (!user || !user.id) {
			return { valid: false };
		}
		return { valid: true, user, authDate };
	} catch {
		return { valid: false };
	}
};

api.use('/*', async (c, next) => {
	const authHeader = c.req.header('Authorization');
	if (!authHeader || !authHeader.startsWith('tma ')) {
		throw new HTTPException(401, { message: 'Unauthorized: Missing Telegram Mini App authorization' });
	}

	const initData = authHeader.substring(4);
	const { valid, user, authDate } = await verifyTelegramAuth(initData, c.env.BOT_TOKEN);

	if (!valid || !user) {
		throw new HTTPException(401, { message: 'Unauthorized: Invalid Telegram Mini App data' });
	}

	// Validate the request timestamp to prevent replay attacks
	if (authDate) {
		const now = Math.floor(Date.now() / 1000);
		const diff = now - parseInt(authDate, 10);
		if (diff > 3600) {
			// 1 hour
			throw new HTTPException(401, { message: 'Unauthorized: Outdated request' });
		}
	}

	c.set('userId', user.id);
	await next();
});

api.get('/journeys', async (c) => {
	const userId = c.get('userId');
	const db = c.env.DB;
	const { results } = await db
		.prepare('SELECT id, start_time, end_time, distance, avg_speed FROM journey WHERE user_id = ?')
		.bind(userId)
		.all();
	return c.json(results);
});

api.get('/journeys/:id/coordinates', async (c) => {
	const userId = c.get('userId');
	const db = c.env.DB;
	const id = c.req.param('id');

	const journeyId = parseInt(id, 10);
	if (isNaN(journeyId)) {
		throw new HTTPException(400, { message: 'Invalid journey ID format. Must be an integer.' });
	}

	const { results } = await db
		.prepare(
			`
				SELECT c.latitude, c.longitude, c.timestamp, c.heading, c.horizontal_accuracy
				FROM coordinate AS c
				JOIN journey AS j ON c.journey_id = j.id
				WHERE j.id = ? AND j.user_id = ?
			`
		)
		.bind(journeyId, userId)
		.all();

	if (results.length === 0) {
		throw new HTTPException(404, { message: "Journey not found or you don't have permission to view it." });
	}

	return c.json(results);
});

export default api;
