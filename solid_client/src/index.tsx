/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App.tsx";
import { ToastProvider } from "./contexts/ToastContext";

const root = document.getElementById("root");

render(
    () => (
        <ToastProvider>
            <App />
        </ToastProvider>
    ),
    root!
);
