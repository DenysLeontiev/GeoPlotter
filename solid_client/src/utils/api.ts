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
    try {
        const response = await fetch(`${BASE_URL}/journeys`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched journeys:", data);
        return data as Journey[];
    } catch (error) {
        console.error("Failed to fetch journeys:", error);
        throw error;
    }
};

export const getCoordinates = async (
    journeyId: string
): Promise<Coordinate[]> => {
    try {
        const response = await fetch(
            `${BASE_URL}/journeys/${journeyId}/coordinates`,
            {
                headers: getAuthHeaders(),
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data as Coordinate[];
    } catch (error) {
        console.error(
            `Failed to fetch coordinates for journey ${journeyId}:`,
            error
        );
        throw error;
    }
};
