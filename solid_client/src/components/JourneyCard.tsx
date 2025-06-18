import { createSignal, Show, type Component, lazy } from "solid-js";
import {
    formatDistance,
    formatSpeed,
    formatDuration,
    formatDateTime,
} from "../utils/formatters";
import type { Journey } from "../types/journey";
import type { DistanceUnit, SpeedUnit } from "../types/settings";

const Map = lazy(() => import("./Map"));

const JourneyCard: Component<{
    journeyData: Journey;
    isCurrent?: boolean;
    isDark: boolean;
    distanceUnit: DistanceUnit;
    speedUnit: SpeedUnit;
}> = (props) => {
    const [isExpanded, setIsExpanded] = createSignal(false);
    const journey = props.journeyData;

    const toggleExpand = () => {
        setIsExpanded(!isExpanded());
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
                            {journey.distance !== null
                                ? formatDistance(
                                      journey.distance,
                                      props.distanceUnit
                                  )
                                : "N/A"}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Avg. Speed
                        </p>
                        <p class="text-xl font-bold text-gray-900 dark:text-white">
                            {journey.avg_speed !== null
                                ? formatSpeed(
                                      journey.avg_speed,
                                      props.speedUnit
                                  )
                                : "N/A"}
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
                <div class="h-64 bg-gray-200 dark:bg-gray-700 w-full">
                    <Map
                        journeyId={journey.id}
                        coordinates={journey.coordinates}
                        isDark={props.isDark}
                    />
                </div>
            </Show>
        </div>
    );
};

export default JourneyCard;
