// Geo/statistics utilities
import { Coordinate } from '../types/database';

export function calculateTripStatistics(
	coords: Pick<Coordinate, 'latitude' | 'longitude' | 'timestamp'>[],
	startTime: string
): {
	totalDistance: number;
	avgSpeed: number;
} {
	let totalDistance = 0;
	for (let i = 1; i < coords.length; i++) {
		totalDistance += calculateHaversineDistance(coords[i - 1], coords[i]);
	}

	const startTimeMs = new Date(startTime).getTime();
	const endTime = new Date(coords[coords.length - 1].timestamp).getTime();
	const durationSeconds = (endTime - startTimeMs) / 1000;
	const avgSpeed = durationSeconds > 0 ? totalDistance / durationSeconds : 0;

	return { totalDistance, avgSpeed };
}

export function calculateHaversineDistance(
	p1: Pick<Coordinate, 'latitude' | 'longitude'>,
	p2: Pick<Coordinate, 'latitude' | 'longitude'>
): number {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const R = 6371e3; // Earth radius in meters

	const φ1 = toRad(p1.latitude);
	const φ2 = toRad(p2.latitude);
	const Δφ = toRad(p2.latitude - p1.latitude);
	const Δλ = toRad(p2.longitude - p1.longitude);

	const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}
