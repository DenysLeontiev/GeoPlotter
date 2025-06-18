// Geo/statistics utilities
import { Coordinate } from '../types/database';

export function calculateTripStatistics(coords: Pick<Coordinate, 'latitude' | 'longitude' | 'timestamp'>[]): {
	totalDistance: number;
	avgSpeed: number;
	durationSeconds: number;
} {
	let totalDistanceMeters = 0;
	for (let i = 1; i < coords.length; i++) {
		const dist = calculateHaversineDistance(coords[i - 1], coords[i]);
		totalDistanceMeters += dist;
	}

	const sortedCoords = coords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

	const startTime = new Date(sortedCoords[0].timestamp).getTime();
	const endTime = new Date(sortedCoords[sortedCoords.length - 1].timestamp).getTime();

	const durationSeconds = (endTime - startTime) / 1000;
	const durationHours = durationSeconds / 3600;

	// Convert distance to kilometers
	const totalDistance = totalDistanceMeters / 1000;

	// Calculate speed in km/hour
	const avgSpeed = durationHours > 0 ? totalDistance / durationHours : 0;

	return { totalDistance, avgSpeed, durationSeconds };
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
