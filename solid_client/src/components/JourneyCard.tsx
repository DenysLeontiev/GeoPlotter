import { createSignal, Show, type Component, lazy } from "solid-js";
import {
    formatDistance,
    formatSpeed,
    formatDuration,
    formatDateTime,
} from "../utils/formatters";
import type { Journey, Coordinate } from "../types/journey";
import type { DistanceUnit, SpeedUnit } from "../types/settings";
import { getCoordinates } from "../utils/api";

const Map = lazy(() => import("./Map"));

const JourneyCard: Component<{
    journeyData: Journey;
    isCurrent?: boolean;
    isDark: boolean;
    distanceUnit: DistanceUnit;
    speedUnit: SpeedUnit;
}> = (props) => {
    const [isExpanded, setIsExpanded] = createSignal(false);
    const [coordinates, setCoordinates] = createSignal<Coordinate[]>([]);
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const journey = props.journeyData;

    const toggleExpand = async () => {
        const expanding = !isExpanded();
        setIsExpanded(expanding);

        if (expanding && coordinates().length === 0) {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedCoordinates = await getCoordinates(journey.id);
                setCoordinates(fetchedCoordinates);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(
                        "An unknown error occurred while fetching coordinates."
                    );
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-all duration-300">
            <div class="p-5 cursor-pointer" onClick={toggleExpand}>
                <div class="flex justify-between items-center">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatDateTime(journey.start_time)}
                    </h2>
                    <svg
                        class="w-5 h-5 text-gray-600 dark:text-gray-300 transform transition-transform duration-300"
                        classList={{ "rotate-180": isExpanded() }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"
                        ></path>
                    </svg>
                </div>
                <div class="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Distance
                        </p>
                        <p class="text-xl font-bold text-gray-900 dark:text-white">
                            {formatDistance(
                                journey.distance,
                                props.distanceUnit
                            )}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Avg. Speed
                        </p>
                        <p class="text-xl font-bold text-gray-900 dark:text-white">
                            {formatSpeed(journey.avg_speed, props.speedUnit)}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Time
                        </p>
                        <p class="text-xl font-bold text-gray-900 dark:text-white">
                            {formatDuration(
                                journey.start_time,
                                journey.end_time
                            )}
                        </p>
                    </div>
                </div>
            </div>
            <Show when={isExpanded()}>
                <div class="bg-gray-200 dark:bg-gray-700">
                    <Show when={isLoading()}>
                        <p class="text-center text-gray-500 dark:text-gray-400">
                            Loading map...
                        </p>
                    </Show>
                    <Show when={error()}>
                        <p class="text-center text-red-500">Error: {error()}</p>
                    </Show>
                    <Show
                        when={
                            !isLoading() && !error() && coordinates().length > 0
                        }
                    >
                        <Map
                            journeyId={journey.id}
                            coordinates={coordinates()}
                            isDark={props.isDark}
                        />
                    </Show>
                    <Show
                        when={
                            !isLoading() &&
                            !error() &&
                            coordinates().length === 0
                        }
                    >
                        <p class="text-center text-gray-500 dark:text-gray-400">
                            No coordinates to draw.
                        </p>
                    </Show>
                </div>
            </Show>
        </div>
    );
};

export default JourneyCard;
