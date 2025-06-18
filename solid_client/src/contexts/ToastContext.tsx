import {
    createContext,
    useContext,
    createSignal,
    type Component,
    type JSX,
} from "solid-js";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toasts: () => ToastMessage[];
    addToast: (message: string, type: ToastType) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType>();

export const ToastProvider: Component<{ children: JSX.Element }> = (props) => {
    const [toasts, setToasts] = createSignal<ToastMessage[]>([]);
    let toastId = 0;

    const removeToast = (id: number) => {
        setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== id)
        );
    };

    const addToast = (message: string, type: ToastType) => {
        const id = toastId++;
        const newToast: ToastMessage = { id, message, type };

        setToasts((currentToasts) => {
            let updatedToasts = [...currentToasts, newToast];
            // If more than 3 toasts, the oldest one (4th from the end) is removed immediately
            if (updatedToasts.length > 3) {
                updatedToasts = updatedToasts.slice(updatedToasts.length - 3);
            }
            return updatedToasts;
        });

        // Auto-dismiss after 5 seconds
        setTimeout(() => removeToast(id), 5000);
    };

    const value: ToastContextType = {
        toasts,
        addToast,
        removeToast,
    };

    return (
        <ToastContext.Provider value={value}>
            {props.children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
