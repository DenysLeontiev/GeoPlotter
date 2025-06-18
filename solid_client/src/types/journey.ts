// Type definitions for journeys and coordinates
export interface Coordinate {
    latitude: number;
    longitude: number;
    timestamp: string;
}

export interface Journey {
    id: string;
    start_time: string;
    end_time: string | null;
    distance: number | null;
    avg_speed: number | null;
    coordinates: Coordinate[];
}
