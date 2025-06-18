import type { Journey } from "../types/journey";

// Mock data for journeys
export const mockJourneys: Journey[] = [
    {
        id: "journey_3",
        start_time: "2024-07-19T14:00:00Z",
        end_time: "2024-07-19T14:45:12Z",
        distance: 5.23,
        avg_speed: 3.8,
        coordinates: [
            {
                latitude: 52.52,
                longitude: 13.405,
                timestamp: "2024-07-19T14:00:00Z",
            },
            {
                latitude: 52.521,
                longitude: 13.4065,
                timestamp: "2024-07-19T14:05:00Z",
            },
            {
                latitude: 52.5225,
                longitude: 13.408,
                timestamp: "2024-07-19T14:15:00Z",
            },
            {
                latitude: 52.523,
                longitude: 13.4105,
                timestamp: "2024-07-19T14:25:00Z",
            },
            {
                latitude: 52.5245,
                longitude: 13.412,
                timestamp: "2024-07-19T14:35:00Z",
            },
            {
                latitude: 52.525,
                longitude: 13.4145,
                timestamp: "2024-07-19T14:45:00Z",
            },
        ],
    },
    {
        id: "journey_2",
        start_time: "2024-07-18T08:30:00Z",
        end_time: "2024-07-18T09:15:20Z",
        distance: 7.12,
        avg_speed: 4.1,
        coordinates: [
            {
                latitude: 48.8566,
                longitude: 2.3522,
                timestamp: "2024-07-18T08:30:00Z",
            },
            {
                latitude: 48.858,
                longitude: 2.351,
                timestamp: "2024-07-18T08:45:00Z",
            },
            {
                latitude: 48.8595,
                longitude: 2.3495,
                timestamp: "2024-07-18T09:00:00Z",
            },
            {
                latitude: 48.861,
                longitude: 2.348,
                timestamp: "2024-07-18T09:15:00Z",
            },
        ],
    },
    {
        id: "journey_1",
        start_time: "2024-07-17T18:05:00Z",
        end_time: null,
        distance: 2.5,
        avg_speed: 3.5,
        coordinates: [
            {
                latitude: 40.7128,
                longitude: -74.006,
                timestamp: "2024-07-17T18:05:00Z",
            },
            {
                latitude: 40.7143,
                longitude: -74.0055,
                timestamp: "2024-07-17T18:10:00Z",
            },
            {
                latitude: 40.7159,
                longitude: -74.0048,
                timestamp: "2024-07-17T18:15:00Z",
            },
        ],
    },
];
