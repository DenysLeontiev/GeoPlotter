import type { Journey } from "../types/journey";

const BASE_URL = "https://v3.golafoned.workers.dev/api";

// Custom error class for API errors
export class ApiError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

const getAuthHeaders = (): HeadersInit => {
    const headers = new Headers();
    if (window.Telegram && window.Telegram.WebApp) {
        headers.append(
            "Authorization",
            `tma ${window.Telegram.WebApp.initData}`
        );
    } else {
        // For development/debugging without Telegram
        console.warn(
            "Telegram WebApp context is not available. Sending unauthenticated request."
        );
    }
    return headers;
};

export const getJourneys = async (
    page: number,
    limit: number
): Promise<Journey[]> => {
    let response: Response;
    try {
        response = await fetch(
            `${BASE_URL}/journeys?page=${page}&limit=${limit}`,
            {
                headers: getAuthHeaders(),
            }
        );
    } catch (error) {
        // Network errors or other issues with the fetch call itself
        console.error("Network error while fetching journeys:", error);
        throw new ApiError("Network error. Please check your connection.");
    }

    if (!response.ok) {
        if (response.status === 401) {
            throw new ApiError(
                "Authentication failed. Please restart the app.",
                401
            );
        }

        // Try to parse a meaningful error message from the response body
        try {
            const errorData = await response.json();
            const message =
                errorData.message || `HTTP error! Status: ${response.status}`;
            throw new ApiError(message, response.status);
        } catch (e) {
            // If the body isn't JSON or doesn't have a message
            throw new ApiError(
                `HTTP error! Status: ${response.status}`,
                response.status
            );
        }
    }

    try {
        const data = await response.json();
        console.log(`Fetched page ${page} of journeys:`, data);
        return data as Journey[];
    } catch (error) {
        console.error("Failed to parse journeys JSON:", error);
        throw new ApiError("Failed to parse server response.");
    }
};
