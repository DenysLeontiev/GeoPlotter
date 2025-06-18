// Utility functions for formatting journey data
export const formatDistance = (meters: number | null | undefined) => {
    if (meters === null || meters === undefined) return "N/A";
    return (meters / 1000).toFixed(2) + " km";
};

export const formatSpeed = (mps: number | null | undefined) => {
    if (mps === null || mps === undefined) return "N/A";
    return (mps * 3.6).toFixed(1) + " km/h";
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
