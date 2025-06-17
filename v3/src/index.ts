// Telegram API URL helper
const telegramApi = (token: string, method: string) => `https://api.telegram.org/bot${token}/${method}`;

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		console.log('Received request:', request.method, request.url);
		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405 });
		}

		const token = env.BOT_TOKEN;
		const update: any = await request.json();

		// Handle incoming messages
		if (update.message) {
			await handleMessage(update.message, token);
		}

		// Handle edited messages (for live location updates)
		if (update.edited_message) {
			await handleEditedMessage(update.edited_message, token);
		}
		sendMessage(token, update.message?.chat.id || update.edited_message?.chat.id, JSON.stringify(update));
		if (update.stopMessageLiveLocation) {
			sendMessage(token, update.stopMessageLiveLocation.chat.id, 'Live location tracking stopped.');
		}

		return new Response('OK', { status: 200 });
	},
} satisfies ExportedHandler<Env>;

// Handle normal messages (including live and static location)
async function handleMessage(msg: any, token: string) {
	const chatId = msg.chat.id;

	if (msg.location) {
		const username = msg.from.username || msg.from.first_name;
		const latitude = msg.location.latitude;
		const longitude = msg.location.longitude;

		if (msg.location.live_period && msg.location.live_period > 0) {
			// Live location
			console.log(`Live location from ${username}: (${latitude}, ${longitude}), live period: ${msg.location.live_period}`);

			await sendMessage(token, chatId, `📍 Tracking live location for ${username}.\nLatitude: ${latitude}\nLongitude: ${longitude}`);
		} else {
			// Static location
			console.log(`Static location from ${username}: (${latitude}, ${longitude})`);

			await sendMessage(token, chatId, `📍 Received static location from ${username}.\nLatitude: ${latitude}\nLongitude: ${longitude}`);
		}
	}
}

// Handle edited messages (live location updates)
async function handleEditedMessage(msg: any, token: string) {
	const chatId = msg.chat.id;
	const username = msg.from.username || msg.from.first_name;
	const latitude = msg.location.latitude;
	const longitude = msg.location.longitude;

	console.log(`Updated live location from ${username}: (${latitude}, ${longitude})`);

	await sendMessage(token, chatId, `📍 Updated live location for ${username}.\nLatitude: ${latitude}\nLongitude: ${longitude}`);
}

// Send message via Telegram API
async function sendMessage(token: string, chatId: number, text: string) {
	const url = telegramApi(token, 'sendMessage');
	console.log(`Sending message to chat ${url}`);
	const res = await fetch(telegramApi(token, 'sendMessage'), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			chat_id: chatId,
			text,
		}),
	});

	if (!res.ok) {
		const errorText = await res.text();
		console.error('Failed to send message:', errorText);
	}
}
