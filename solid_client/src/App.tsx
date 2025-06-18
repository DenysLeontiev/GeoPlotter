import { createSignal, onMount, For, Show, type Component } from "solid-js";
import ThemeToggle from "./components/ThemeToggle";
import JourneyCard from "./components/JourneyCard";
import type { Journey } from "./types/journey";
import { getJourneys } from "./utils/api";

const App: Component = () => {
    const [isDark, setIsDark] = createSignal(false);
    const [journeys, setJourneys] = createSignal<Journey[]>([]);
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);

    // Initialize theme on page load (from Tailwind docs)
    onMount(async () => {
        const dark =
            localStorage.theme === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches);

        setIsDark(dark);
        document.documentElement.classList.toggle("dark", dark);

        try {
            const fetchedJourneys = await getJourneys();
            // Sort journeys by start time, newest first
            const sortedJourneys = fetchedJourneys.sort(
                (a, b) =>
                    new Date(b.start_time).getTime() -
                    new Date(a.start_time).getTime()
            );
            setJourneys(sortedJourneys);
            console.log("Journeys set in state:", sortedJourneys);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    });

    // Handle theme changes
    const toggleTheme = () => {
        const newDark = !isDark();
        setIsDark(newDark);

        if (newDark) {
            localStorage.theme = "dark";
            document.documentElement.classList.add("dark");
        } else {
            localStorage.theme = "light";
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <div class="bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300 min-h-screen">
            <div class="container mx-auto p-4 max-w-2xl">
                <header class="flex justify-between items-center mb-6">
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                        Your Journeys
                    </h1>
                    <ThemeToggle isDark={isDark()} toggleTheme={toggleTheme} />
                </header>

                <Show when={loading()}>
                    <p class="text-center text-gray-500 dark:text-gray-400">
                        Loading journeys...
                    </p>
                </Show>

                <Show when={error()}>
                    <p class="text-center text-red-500">
                        Error loading journeys: {error()}
                    </p>
                </Show>

                <Show when={!loading() && !error() && journeys().length > 0}>
                    <div class="space-y-4">
                        <For each={journeys()}>
                            {(journey) => (
                                <JourneyCard
                                    journeyData={journey}
                                    isDark={isDark()}
                                />
                            )}
                        </For>
                    </div>
                </Show>
                <Show when={!loading() && !error() && journeys().length === 0}>
                    <p class="text-center text-gray-500 dark:text-gray-400">
                        No journeys found.
                    </p>
                </Show>
            </div>
        </div>
    );
};

export default App;
