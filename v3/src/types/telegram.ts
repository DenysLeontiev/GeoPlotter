// Telegram API types and type guards

export interface TelegramUser {
	id: number;
	is_bot: boolean;
	first_name: string;
	last_name?: string;
	username?: string;
}

export interface TelegramChat {
	id: number;
	type: 'private' | 'group' | 'supergroup' | 'channel';
	title?: string;
	username?: string;
	first_name?: string;
	last_name?: string;
}

export interface TelegramLocation {
	longitude: number;
	latitude: number;
	horizontal_accuracy?: number;
	live_period?: number;
	heading?: number;
}

export interface TelegramMessage {
	message_id: number;
	from?: TelegramUser;
	chat: TelegramChat;
	date: number;
	text?: string;
	location?: TelegramLocation;
}

export interface TelegramUpdate {
	update_id: number;
	message?: TelegramMessage;
	edited_message?: TelegramMessage;
}

export function isValidTelegramLocation(location: any): location is TelegramLocation {
	return (
		location &&
		typeof location === 'object' &&
		typeof location.latitude === 'number' &&
		typeof location.longitude === 'number' &&
		(location.horizontal_accuracy === undefined || typeof location.horizontal_accuracy === 'number') &&
		(location.live_period === undefined || typeof location.live_period === 'number') &&
		(location.heading === undefined || typeof location.heading === 'number')
	);
}

export function isValidTelegramUser(user: any): user is TelegramUser {
	return (
		user &&
		typeof user === 'object' &&
		typeof user.id === 'number' &&
		typeof user.is_bot === 'boolean' &&
		typeof user.first_name === 'string' &&
		(user.last_name === undefined || typeof user.last_name === 'string') &&
		(user.username === undefined || typeof user.username === 'string')
	);
}

export function isValidTelegramChat(chat: any): chat is TelegramChat {
	return (
		chat &&
		typeof chat === 'object' &&
		typeof chat.id === 'number' &&
		(chat.type === 'private' || chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel')
	);
}

export function isValidTelegramMessage(message: any): message is TelegramMessage {
	return (
		message &&
		typeof message === 'object' &&
		typeof message.message_id === 'number' &&
		typeof message.date === 'number' &&
		isValidTelegramChat(message.chat) &&
		(message.from === undefined || isValidTelegramUser(message.from)) &&
		(message.text === undefined || typeof message.text === 'string') &&
		(message.location === undefined || isValidTelegramLocation(message.location))
	);
}

export function isValidTelegramUpdate(update: any): update is TelegramUpdate {
	return (
		update &&
		typeof update === 'object' &&
		typeof update.update_id === 'number' &&
		(isValidTelegramMessage(update.message) || isValidTelegramMessage(update.edited_message))
	);
}
