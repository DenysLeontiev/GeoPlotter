import { createSignal, Show, type Component } from "solid-js";
import ThemeToggle from "./ThemeToggle";
import type { DistanceUnit, SpeedUnit } from "../types/settings";

const SettingsMenu: Component<{
    isDark: boolean;
    toggleTheme: () => void;
    distanceUnit: () => DistanceUnit;
    setDistanceUnit: (unit: DistanceUnit) => void;
    speedUnit: () => SpeedUnit;
    setSpeedUnit: (unit: SpeedUnit) => void;
    journeyCount: number;
}> = (props) => {
    const [isOpen, setIsOpen] = createSignal(false);

    return (
        <div class="relative">
            <button
                onClick={() => setIsOpen(!isOpen())}
                class="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            >
                <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    ></path>
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                </svg>
            </button>
            <Show when={isOpen()}>
                <div class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Settings
                    </h3>

                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-700 dark:text-gray-300">
                            Theme
                        </span>
                        <ThemeToggle
                            isDark={props.isDark}
                            toggleTheme={props.toggleTheme}
                        />
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Distance Unit
                        </label>
                        <select
                            value={props.distanceUnit()}
                            onChange={(e) =>
                                props.setDistanceUnit(
                                    e.currentTarget.value as any
                                )
                            }
                            class="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="km">Kilometers</option>
                            <option value="miles">Miles</option>
                            <option value="meters">Meters</option>
                        </select>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Speed Unit
                        </label>
                        <select
                            value={props.speedUnit()}
                            onChange={(e) =>
                                props.setSpeedUnit(e.currentTarget.value as any)
                            }
                            class="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="km/h">km/h</option>
                            <option value="mph">mph</option>
                            <option value="m/s">m/s</option>
                        </select>
                    </div>

                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Total Journeys:{" "}
                            <span class="font-bold">{props.journeyCount}</span>
                        </p>
                    </div>
                </div>
            </Show>
        </div>
    );
};

export default SettingsMenu;
