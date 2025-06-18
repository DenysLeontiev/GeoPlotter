import {
    createSignal,
    onMount,
    For,
    Show,
    type Component,
    onCleanup,
} from "solid-js";
import SettingsMenu from "./components/SettingsMenu";
import JourneyCard from "./components/JourneyCard";
import ToastContainer from "./components/ToastContainer";
import type { Journey } from "./types/journey";
import { getJourneys, ApiError } from "./utils/api";
import type { DistanceUnit, SpeedUnit } from "./types/settings";
import { useToast } from "./contexts/ToastContext";

const App: Component = () => {
    const [isDark, setIsDark] = createSignal(false);
    const [distanceUnit, setDistanceUnit] = createSignal<DistanceUnit>("km");
    const [speedUnit, setSpeedUnit] = createSignal<SpeedUnit>("km/h");
    const [journeys, setJourneys] = createSignal<Journey[]>([]);
    const [loading, setLoading] = createSignal(false);
    const [page, setPage] = createSignal(1);
    const [hasMore, setHasMore] = createSignal(true);
    const { addToast } = useToast();
    let sentinel: HTMLDivElement | undefined;

    const loadJourneys = async () => {
        if (loading() || !hasMore()) return;
        setLoading(true);
        try {
            const fetchedJourneys = await getJourneys(page(), 20);
            if (fetchedJourneys.length > 0) {
                setJourneys((prev) => [...prev, ...fetchedJourneys]);
                setPage((prev) => prev + 1);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : "An unknown error occurred. Please try again.";
            addToast(message, "error");
        } finally {
            setLoading(false);
        }
    };

    onMount(() => {
        const dark =
            localStorage.theme === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches);

        setIsDark(dark);
        document.documentElement.classList.toggle("dark", dark);

        // Initial data load
        loadJourneys();

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadJourneys();
            }
        });

        if (sentinel) {
            observer.observe(sentinel);
        }

        // Cleanup observer on component unmount
        onCleanup(() => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
        });
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
            <ToastContainer />
            <div class="container mx-auto p-4 max-w-2xl">
                <header class="flex justify-between items-center mb-6">
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                        Your Journeys
                    </h1>
                    <SettingsMenu
                        isDark={isDark()}
                        toggleTheme={toggleTheme}
                        distanceUnit={distanceUnit}
                        setDistanceUnit={setDistanceUnit}
                        speedUnit={speedUnit}
                        setSpeedUnit={setSpeedUnit}
                        journeyCount={journeys().length}
                    />
                </header>

                <Show when={journeys().length === 0 && loading()}>
                    <p class="text-center text-gray-500 dark:text-gray-400">
                        Loading journeys...
                    </p>
                </Show>

                <div class="space-y-4">
                    <For each={journeys()}>
                        {(journey) => (
                            <JourneyCard
                                journeyData={journey}
                                isDark={isDark()}
                                distanceUnit={distanceUnit()}
                                speedUnit={speedUnit()}
                            />
                        )}
                    </For>
                </div>

                <div ref={sentinel} class="h-10"></div>

                <Show when={journeys().length > 0 && loading()}>
                    <p class="text-center text-gray-500 dark:text-gray-400">
                        Loading more journeys...
                    </p>
                </Show>

                <Show when={!hasMore() && journeys().length > 0}>
                    <p class="text-center text-gray-500 dark:text-gray-400">
                        You've reached the end.
                    </p>
                </Show>

                <Show
                    when={!loading() && journeys().length === 0 && !hasMore()}
                >
                    <p class="text-center text-gray-500 dark:text-gray-400">
                        No journeys found. Start recording a new one!
                    </p>
                </Show>
            </div>
        </div>
    );
};

export default App;
