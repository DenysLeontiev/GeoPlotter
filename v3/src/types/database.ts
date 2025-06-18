// Database and environment types

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Journey {
	id: number;
	user_id: number;
	start_time: string;
	end_time: string | null;
	distance: number | null;
	avg_speed: number | null;
}

export interface Coordinate {
	id: number;
	journey_id: number;
	latitude: number;
	longitude: number;
	timestamp: string;
	heading: number | null;
	horizontal_accuracy: number | null;
}

export interface Env {
	BOT_TOKEN: string;
	DB: D1Database;
}
