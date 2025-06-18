import { D1Database } from '@cloudflare/workers-types';
import { Coordinate } from '../types/database';
import { TelegramMessage } from '../types/telegram';
import { sendMessage } from '../utils/telegram';
import { calculateTripStatistics } from '../utils/geo';

// Handles incoming messages from Telegram.
export async function handleMessage(db: D1Database, msg: TelegramMessage, token: string) {
	if (msg.location) {
		if (msg.location.live_period) {
			await handleLiveLocationStart(db, msg, token);
		} else {
			await handleStaticLocation(msg, token);
		}
	}
}

//Handles edited messages, which are typically live location updates.
export async function handleEditedMessage(db: D1Database, msg: TelegramMessage, token: string) {
	if (msg.location) {
		await handleLiveLocationUpdate(db, msg, token);
		if (!msg.location.live_period) {
			await handleLiveLocationEnd(db, msg, token);
		}
	}
}

export async function handleLiveLocationStart(db: D1Database, msg: TelegramMessage, token: string) {
	const chatId = msg.chat.id;
	const username = msg.from?.username || msg.from?.first_name || 'User';

	if (!msg.from) {
		console.error('User not found in message');
		await sendMessage(token, chatId, 'Sorry, I could not identify you.');
		return;
	}

	if (!msg.location) {
		console.error('Live location start message received without location data.');
		await sendMessage(token, chatId, 'Sorry, I could not start tracking your journey as location data is missing.');
		return;
	}

	try {
		await db
			.prepare('INSERT INTO journey (user_id, start_time) VALUES (?, ?)')
			.bind(msg.from.id, new Date(msg.date * 1000).toISOString())
			.run();

		const { results } = await db
			.prepare('SELECT id FROM journey WHERE user_id = ? ORDER BY start_time DESC LIMIT 1')
			.bind(msg.from.id)
			.all<{ id: number }>();

		const lastJourney = results?.[0];
		if (!lastJourney) {
			console.error('Could not retrieve journey after creation.');
			await sendMessage(token, chatId, 'Sorry, I could not start tracking your journey.');
			return;
		}
		const journeyId = lastJourney.id;

		// Insert the first coordinate
		await db
			.prepare(
				'INSERT INTO coordinate (journey_id, latitude, longitude, timestamp, heading, horizontal_accuracy) VALUES (?, ?, ?, ?, ?, ?)'
			)
			.bind(
				journeyId,
				msg.location.latitude,
				msg.location.longitude,
				new Date(msg.date * 1000).toISOString(),
				msg.location.heading ?? null,
				msg.location.horizontal_accuracy ?? null
			)
			.run();
	} catch (error) {
		console.error('Error inserting journey:', error instanceof Error ? { message: error.message, cause: error.cause } : error);
		await sendMessage(token, chatId, 'Sorry, I could not start tracking your journey.');
		return;
	}

	await sendMessage(token, chatId, `📍 Tracking live location for ${username}.`);
}

export async function handleStaticLocation(msg: TelegramMessage, token: string) {
	const chatId = msg.chat.id;
	const username = msg.from?.username || msg.from?.first_name || 'User';
	if (!msg.location) {
		console.error('Static location message received without location data.');
		await sendMessage(token, chatId, 'Sorry, I received a location message but could not read the coordinates.');
		return;
	}
	const { latitude, longitude } = msg.location;

	console.log(`Static location from ${username}: (${latitude}, ${longitude})`);
	await sendMessage(token, chatId, `📍 Received static location from ${username}.\nLatitude: ${latitude}\nLongitude: ${longitude}`);
}

export async function handleLiveLocationUpdate(db: D1Database, msg: TelegramMessage, token: string) {
	const chatId = msg.chat.id;
	const username = msg.from?.username || msg.from?.first_name || 'User';
	if (!msg.location) {
		console.error('Live location update received without location data.');
		return;
	}
	const { latitude, longitude } = msg.location;

	console.log(`Updated live location from ${username}: (${latitude}, ${longitude})`);

	if (!msg.from) {
		console.error('User not found in message');
		return;
	}

	try {
		const { results } = await db
			.prepare('SELECT id FROM journey WHERE user_id = ? ORDER BY start_time DESC LIMIT 1')
			.bind(msg.from.id)
			.all<{ id: number }>();

		const lastJourney = results?.[0];

		if (!lastJourney) {
			console.error('No journey found for user.');
			return;
		}

		const journeyId = lastJourney.id;
		if (!journeyId) {
			console.error('Journey ID is missing.');
			return;
		}
		await sendMessage(token, chatId, `📍 Updated live location for ${username}.\nLatitude: ${latitude}\nLongitude: ${longitude}`);
		await db
			.prepare(
				'INSERT INTO coordinate (journey_id, latitude, longitude, timestamp, heading, horizontal_accuracy) VALUES (?, ?, ?, ?, ?, ?)'
			)
			.bind(
				journeyId,
				msg.location.latitude,
				msg.location.longitude,
				new Date(msg.date * 1000).toISOString(),
				msg.location.heading ?? null,
				msg.location.horizontal_accuracy ?? null
			)
			.run();
	} catch (error) {
		console.error('Error handling live location update:', error instanceof Error ? { message: error.message, cause: error.cause } : error);
	}
}

export async function handleLiveLocationEnd(db: D1Database, msg: TelegramMessage, token: string) {
	const chatId = msg.chat.id;
	const username = msg.from?.username || msg.from?.first_name || 'User';

	if (!msg.from) {
		console.error('User not found in message');
		return;
	}

	try {
		const { results } = await db
			.prepare('SELECT id, start_time FROM journey WHERE user_id = ? ORDER BY start_time DESC LIMIT 1')
			.bind(msg.from.id)
			.all<{ id: number; start_time: string }>();

		const lastJourney = results?.[0];

		if (!lastJourney) {
			console.error('No journey found for user.');
			return;
		}

		const { results: coords } = await db
			.prepare('SELECT latitude, longitude, timestamp FROM coordinate WHERE journey_id = ? ORDER BY timestamp ASC')
			.bind(lastJourney.id)
			.all<Pick<Coordinate, 'latitude' | 'longitude' | 'timestamp'>>();

		if (!coords || coords.length < 2) {
			await sendMessage(token, chatId, `Live location tracking for ${username} ended. Not enough data to calculate a trip.`);
			return;
		}

		const { totalDistance, avgSpeed } = calculateTripStatistics(coords, lastJourney.start_time);

		await db
			.prepare('UPDATE journey SET end_time = ?, distance = ?, avg_speed = ? WHERE id = ?')
			.bind(new Date().toISOString(), totalDistance, avgSpeed, lastJourney.id)
			.run();

		await sendMessage(
			token,
			chatId,
			`Live location tracking for ${username} ended.\nDistance: ${(totalDistance / 1000).toFixed(2)} km\nAvg. Speed: ${avgSpeed.toFixed(
				2
			)} m/s`
		);
	} catch (error) {
		console.error('Error handling live location end:', error instanceof Error ? { message: error.message, cause: error.cause } : error);
	}
}
