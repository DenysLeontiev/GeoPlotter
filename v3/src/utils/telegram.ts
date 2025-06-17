// Telegram API helpers

export const telegramApi = (token: string, method: string) => `https://api.telegram.org/bot${token}/${method}`;

export async function sendMessage(token: string, chatId: number, text: string) {
	const url = telegramApi(token, 'sendMessage');
	console.log(`Sending message to chat ${chatId}`);
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ chat_id: chatId, text }),
		});

		if (!res.ok) {
			const errorText = await res.text();
			console.error('Failed to send message:', res.status, errorText);
		}
	} catch (error) {
		console.error('Error sending message:', error);
	}
}
