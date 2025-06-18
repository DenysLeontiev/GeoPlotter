import { For, type Component } from "solid-js";
import { useToast } from "../contexts/ToastContext";
import Toast from "./Toast";

const ToastContainer: Component = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div class="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm flex flex-col items-center space-y-2">
            <For each={toasts()}>
                {(toast) => <Toast toast={toast} onClose={removeToast} />}
            </For>
        </div>
    );
};

export default ToastContainer;
