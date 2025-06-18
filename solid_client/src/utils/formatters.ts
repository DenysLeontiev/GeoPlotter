import type { DistanceUnit, SpeedUnit } from "../types/settings";

// Utility functions for formatting journey data
export const formatDistance = (
    km: number | null | undefined,
    unit: DistanceUnit
) => {
    if (km === null || km === undefined) return "N/A";

    if (unit === "miles") {
        return (km * 0.621371).toFixed(2) + " miles";
    } else if (unit === "meters") {
        return (km * 1000).toFixed(0) + " meters";
    }
    return km.toFixed(2) + " km";
};

export const formatSpeed = (
    kph: number | null | undefined,
    unit: SpeedUnit
) => {
    if (kph === null || kph === undefined) return "N/A";

    if (unit === "mph") {
        return (kph * 0.621371).toFixed(1) + " mph";
    } else if (unit === "m/s") {
        return (kph / 3.6).toFixed(2) + " m/s";
    }
    return kph.toFixed(1) + " km/h";
};

export const formatDuration = (
    startTime: string | null | undefined,
    endTime: string | null | undefined
) => {
    if (!startTime) return "00:00:00";
    if (!endTime) return "In Progress";

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return "00:00:00";
    }

    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor(((diffMs % 3600000) % 60000) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) {
        console.error("formatDateTime received null or undefined dateString");
        return "Invalid Date";
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.error("Invalid date provided to formatDateTime:", dateString);
        return "Invalid Date";
    }
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};
