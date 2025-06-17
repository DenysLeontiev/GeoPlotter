import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Coordinate } from '../types/database';
import { TelegramMessage } from '../types/telegram';
import { sendMessage } from '../utils/telegram';
import { calculateTripStatistics } from '../utils/geo';

/**
 * Handles incoming messages from Telegram.
 */
export async function handleMessage(supabase: SupabaseClient<Database>, msg: TelegramMessage, token: string) {
	if (msg.location) {
		if (msg.location.live_period) {
			await handleLiveLocationStart(supabase, msg, token);
		} else {
			await handleStaticLocation(msg, token);
		}
	}
}

/**
 * Handles edited messages, which are typically live location updates.
 */
export async function handleEditedMessage(supabase: SupabaseClient<Database>, msg: TelegramMessage, token: string) {
	if (msg.location) {
		await handleLiveLocationUpdate(supabase, msg, token);
		if (!msg.location.live_period) {
			await handleLiveLocationEnd(supabase, msg, token);
		}
	}
}

export async function handleLiveLocationStart(supabase: SupabaseClient<Database>, msg: TelegramMessage, token: string) {
	const chatId = msg.chat.id;
	const username = msg.from?.username || msg.from?.first_name || 'User';

	if (!msg.from) {
		console.error('User not found in message');
		await sendMessage(token, chatId, 'Sorry, I could not identify you.');
		return;
	}

	const { error } = await supabase.from('journey').insert({
		user_id: msg.from.id,
		start_time: new Date().toISOString(),
	});

	if (error) {
		console.error('Error inserting journey:', error);
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

export async function handleLiveLocationUpdate(supabase: SupabaseClient<Database>, msg: TelegramMessage, token: string) {
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

	const { data: lastJourney, error: journeyError } = await supabase
		.from('journey')
		.select('id')
		.eq('user_id', msg.from.id)
		.order('start_time', { ascending: false })
		.limit(1)
		.single();

	if (journeyError || !lastJourney) {
		console.error('Error fetching last journey:', journeyError || 'No journey found for user.');
		return;
	}

	const { error: coordinateError } = await supabase.from('coordinate').insert({
		journey_id: lastJourney.id,
		latitude,
		longitude,
		heading: msg.location?.heading,
		horizontal_accuracy: msg.location?.horizontal_accuracy,
		timestamp: new Date(msg.date * 1000).toISOString(),
	});

	if (coordinateError) {
		console.error('Error inserting coordinate:', coordinateError);
	} else {
		await sendMessage(token, chatId, `📍 Updated live location for ${username}.\nLatitude: ${latitude}\nLongitude: ${longitude}`);
	}
}

export async function handleLiveLocationEnd(supabase: SupabaseClient<Database>, msg: TelegramMessage, token: string) {
	const chatId = msg.chat.id;
	console.log('Live location tracking stopped.');

	if (!msg.from) {
		console.error('User not found in message');
		await sendMessage(token, chatId, 'Sorry, I could not identify you to end the journey.');
		return;
	}

	const { data: lastJourney, error: journeyError } = await supabase
		.from('journey')
		.select('id, start_time')
		.eq('user_id', msg.from.id)
		.order('start_time', { ascending: false })
		.limit(1)
		.single();

	if (journeyError || !lastJourney) {
		console.error('Error fetching last journey for summary:', journeyError || 'No journey found.');
		return;
	}

	const { data: coords, error: coordsError } = await supabase
		.from('coordinate')
		.select('latitude, longitude, timestamp')
		.eq('journey_id', lastJourney.id)
		.order('timestamp', { ascending: true });

	if (coordsError || !coords || coords.length < 2) {
		console.error('Error fetching coordinates or not enough data:', coordsError);
		await sendMessage(token, chatId, 'Could not retrieve enough trip data to generate a summary.');
		return;
	}

	const { totalDistance, avgSpeed } = calculateTripStatistics(coords);

	const { error: updateError } = await supabase
		.from('journey')
		.update({
			end_time: new Date().toISOString(),
			distance: Math.round(totalDistance),
			avg_speed: Math.round(avgSpeed),
		})
		.eq('id', lastJourney.id);

	if (updateError) {
		console.error('Error updating journey with summary:', updateError);
	}

	const coordList = coords.map((c) => `(${c.latitude}, ${c.longitude})`).join('\n');
	const summary = `Live location tracking stopped.\n\nTrip summary:\nDistance: ${(totalDistance / 1000).toFixed(2)} km\nAvg speed: ${(
		avgSpeed * 3.6
	).toFixed(2)} km/h\n\nCoordinates:\n${coordList}`;
	await sendMessage(token, chatId, summary);
}
