import type { Journey, Coordinate } from "../types/journey";

const BASE_URL = "https://v3.golafoned.workers.dev/api";

const getAuthHeaders = (): HeadersInit => {
    const headers = new Headers();
    if (window.Telegram && window.Telegram.WebApp) {
        headers.append(
            "Authorization",
            `tma ${window.Telegram.WebApp.initData}`
        );
    } else {
        console.warn(
            "Telegram WebApp context is not available. Sending unauthenticated request."
        );
    }
    return headers;
};

export const getJourneys = async (): Promise<Journey[]> => {
    const response = await fetch(`${BASE_URL}/journeys`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to fetch journeys: ${response.status} ${errorText}`
        );
    }
    const data = await response.json();
    console.log("Fetched journeys:", data);
    return data;
};

export const getCoordinates = async (
    journeyId: string
): Promise<Coordinate[]> => {
    const response = await fetch(
        `${BASE_URL}/journeys/${journeyId}/coordinates`,
        {
            headers: getAuthHeaders(),
        }
    );
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to fetch coordinates: ${response.status} ${errorText}`
        );
    }
    const data = await response.json();
    console.log(`Fetched coordinates for journey ${journeyId}:`, data);
    return data;
};
