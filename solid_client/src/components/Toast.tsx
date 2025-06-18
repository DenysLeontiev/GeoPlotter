import { createSignal, onMount, type Component, Show } from "solid-js";
import type { ToastMessage, ToastType } from "../contexts/ToastContext";

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: number) => void;
}

const Toast: Component<ToastProps> = (props) => {
    const [isVisible, setIsVisible] = createSignal(false);

    const toastStyles: Record<
        ToastType,
        { container: string; text: string; icon: string }
    > = {
        success: {
            container: "bg-green-100 border-green-300",
            text: "text-green-700",
            icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
        },
        error: {
            container: "bg-red-100 border-red-300", // Pastel red
            text: "text-red-700",
            icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
        },
        info: {
            container: "bg-blue-100 border-blue-300",
            text: "text-blue-700",
            icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-6h-2v6zm0-8h2V7h-2v2z",
        },
    };

    onMount(() => {
        const appearTimeout = setTimeout(() => setIsVisible(true), 100);
        const closeTimeout = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => props.onClose(props.toast.id), 300);
        }, 4900);

        return () => {
            clearTimeout(appearTimeout);
            clearTimeout(closeTimeout);
        };
    });

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => props.onClose(props.toast.id), 300);
    };

    const styles = toastStyles[props.toast.type];

    return (
        <Show when={isVisible()}>
            <div
                class={`w-full max-w-sm rounded-lg shadow-md border flex items-center p-3 transition-all duration-300 ease-in-out ${styles.container} ${styles.text}`}
                classList={{
                    "opacity-100 translate-y-0": isVisible(),
                    "opacity-0 -translate-y-5": !isVisible(),
                }}
                role="alert"
            >
                <svg
                    class="w-5 h-5 mr-3 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                >
                    <path d={styles.icon}></path>
                </svg>
                <span class="flex-grow text-sm font-medium">
                    {props.toast.message}
                </span>
                <button
                    onClick={handleClose}
                    class={`ml-4 p-1 rounded-full text-current cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1`}
                    aria-label="Close"
                >
                    <svg
                        class="w-4 h-4 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                    </svg>
                </button>
            </div>
        </Show>
    );
};

export default Toast;
