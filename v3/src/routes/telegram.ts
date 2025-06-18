import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from '../types/database';
import { isValidTelegramUpdate } from '../types/telegram';
import { handleMessage, handleEditedMessage } from '../handlers/telegramHandlers';

const router = new Hono<{ Bindings: Env }>();

router.use('*', cors());

router.get('/', (c) => {
	return c.text('Hello World!');
});

router.post('/update', async (c) => {
	const db = c.env.DB;
	const token = c.env.BOT_TOKEN;

	try {
		const update: unknown = await c.req.json();

		if (!isValidTelegramUpdate(update)) {
			console.error('Invalid Telegram update received:', JSON.stringify(update, null, 2));
			return c.text('Bad Request: Invalid update format', 400);
		}

		if (update.message) {
			await handleMessage(db, update.message, token);
		} else if (update.edited_message) {
			await handleEditedMessage(db, update.edited_message, token);
		}

		return c.text('OK', 200);
	} catch (error) {
		if (error instanceof SyntaxError) {
			console.error('Error parsing JSON:', error);
			return c.text('Bad Request: Malformed JSON', 400);
		}
		console.error('Error processing update:', error);
		return c.text('Internal Server Error', 500);
	}
});

export default router;
