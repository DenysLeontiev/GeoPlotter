import {
    createContext,
    useContext,
    createSignal,
    type Component,
    type JSX,
} from "solid-js";

export type DistanceUnit = "km" | "miles" | "meters";
export type SpeedUnit = "km/h" | "mph" | "m/s";

interface SettingsContextType {
    isDark: () => boolean;
    toggleTheme: () => void;
    distanceUnit: () => DistanceUnit;
    setDistanceUnit: (unit: DistanceUnit) => void;
    speedUnit: () => SpeedUnit;
    setSpeedUnit: (unit: SpeedUnit) => void;
}

const SettingsContext = createContext<SettingsContextType>();

export const SettingsProvider: Component<{ children: JSX.Element }> = (
    props
) => {
    const [isDark, setIsDark] = createSignal(false);
    const [distanceUnit, setDistanceUnit] = createSignal<DistanceUnit>("km");
    const [speedUnit, setSpeedUnit] = createSignal<SpeedUnit>("km/h");

    const toggleTheme = () => {
        const newDark = !isDark();
        setIsDark(newDark);
        if (newDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const value = {
        isDark,
        toggleTheme,
        distanceUnit,
        setDistanceUnit,
        speedUnit,
        setSpeedUnit,
    };

    return (
        <SettingsContext.Provider value={value}>
            {props.children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};
