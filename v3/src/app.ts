import { Hono } from 'hono';
import telegramRoutes from './routes/telegram';
import api from './routes/api';
import { Env } from './types/database';

const app = new Hono<{ Bindings: Env }>();

app.route('/api', api);

app.get('/', (c) => {
	return c.text('Hello World!');
});

app.route('/', telegramRoutes);

export default app;
