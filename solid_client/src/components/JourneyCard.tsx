import { createSignal, Show, type Component } from "solid-js";
import {
    formatDistance,
    formatSpeed,
    formatDuration,
    formatDateTime,
} from "../utils/formatters";
import type { Journey, Coordinate } from "../types/journey";
import Map from "./Map";
import { getCoordinates } from "../utils/api";

const JourneyCard: Component<{
    journeyData: Journey;
    isDark: boolean;
}> = (props) => {
    const [isExpanded, setIsExpanded] = createSignal(false);
    const [coordinates, setCoordinates] = createSignal<Coordinate[]>([]);
    const journey = props.journeyData;

    const toggleExpand = async () => {
        const newIsExpanded = !isExpanded();
        setIsExpanded(newIsExpanded);
        if (newIsExpanded && coordinates().length === 0) {
            // Fetch coordinates only when expanding for the first time
            const fetchedCoordinates = await getCoordinates(journey.id);
            setCoordinates(fetchedCoordinates);
            console.log(
                `Coordinates set for journey ${journey.id}:`,
                fetchedCoordinates
            );
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
                            {formatDistance(journey.distance)}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Avg. Speed
                        </p>
                        <p class="text-xl font-bold text-gray-900 dark:text-white">
                            {formatSpeed(journey.avg_speed)}
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
                    <Map
                        journeyId={journey.id}
                        coordinates={coordinates()}
                        isDark={props.isDark}
                    />
                </div>
            </Show>
        </div>
    );
};

export default JourneyCard;
