import { Hono } from 'hono';
import telegramRoutes from './routes/telegram';
import { Env } from './types/database';

const app = new Hono<{ Bindings: Env }>();

app.route('/', telegramRoutes);

export default app;
