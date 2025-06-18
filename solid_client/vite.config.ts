import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [solid(), tailwindcss()],
    server: {
        allowedHosts: true,
    },
    build: {
        // Enable minification and other optimizations
        minify: true,
        // Enable tree-shaking
        cssCodeSplit: true,
        // Configure manual chunks to split large libraries
        rollupOptions: {
            output: {
                manualChunks: {
                    leaflet: ["leaflet"],
                },
            },
        },
    },
});
