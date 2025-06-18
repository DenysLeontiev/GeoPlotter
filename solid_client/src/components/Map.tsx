import { onMount, createEffect, type Component, on } from "solid-js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coordinate } from "../types/journey";

const Map: Component<{
    journeyId: string;
    coordinates: Coordinate[];
    isDark: boolean;
}> = (props) => {
    let mapContainer: HTMLDivElement | undefined;
    let map: L.Map | undefined;
    let polyline: L.Polyline | undefined;
    let startMarker: L.CircleMarker | undefined;
    let endMarker: L.CircleMarker | undefined;

    // Initialize map on mount
    onMount(() => {
        if (!mapContainer) return;
        map = L.map(mapContainer, {
            zoomControl: false,
            attributionControl: false,
        });

        // Add a tile layer shell that will be updated by the effect
        L.tileLayer("").addTo(map);
    });

    // Effect to update tile layer based on theme
    createEffect(() => {
        if (!map) return;
        // This is a bit of a hack to get the tile layer instance
        const tileLayer = (map as any)._layers[
            Object.keys((map as any)._layers)[0]
        ];
        if (!tileLayer) return;

        const isDark = props.isDark;
        const tileUrl = isDark
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
        tileLayer.setUrl(tileUrl);
    });

    // Effect to draw/update journey data on the map
    createEffect(
        on(
            () => props.coordinates,
            (coords) => {
                if (!map) return;

                // Clear previous layers if they exist
                if (polyline) map.removeLayer(polyline);
                if (startMarker) map.removeLayer(startMarker);
                if (endMarker) map.removeLayer(endMarker);

                if (!coords || coords.length === 0) {
                    console.log(
                        `Map for journey ${props.journeyId}: No coordinates to draw.`
                    );
                    return;
                }

                console.log(
                    `Map for journey ${props.journeyId}: Drawing ${coords.length} coordinates.`
                );

                const latLngs: L.LatLngTuple[] = coords.map((c) => [
                    c.latitude,
                    c.longitude,
                ]);

                const isDark = props.isDark;

                polyline = L.polyline(latLngs, {
                    color: isDark ? "#3b82f6" : "#2563eb",
                    weight: 4,
                    opacity: 0.8,
                }).addTo(map);

                startMarker = L.circleMarker(latLngs[0], {
                    radius: 6,
                    fillOpacity: 1,
                    color: isDark ? "#22c55e" : "#16a34a",
                    fillColor: isDark ? "#4ade80" : "#22c55e",
                }).addTo(map);

                if (latLngs.length > 1) {
                    endMarker = L.circleMarker(latLngs[latLngs.length - 1], {
                        radius: 6,
                        fillOpacity: 1,
                        color: isDark ? "#ef4444" : "#dc2626",
                        fillColor: isDark ? "#f87171" : "#ef4444",
                    }).addTo(map);
                }

                map.fitBounds(polyline.getBounds().pad(0.1));
            }
        )
    );

    return (
        <div
            ref={mapContainer}
            style={{ height: "300px", width: "100%" }}
        ></div>
    );
};

export default Map;
