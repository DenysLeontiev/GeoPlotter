const startButton = document.getElementById('start-button');
const endButton = document.getElementById('end-button');
const buildMapButton = document.getElementById('build-map-button');

const maxSpeedElement = document.getElementById('max-speed');
const averageSpeedElement = document.getElementById('average-speed');
const distanceElement = document.getElementById('distance');

const options = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000
};

const LOCALSTORAGE_COORDINATES_KEY = "geo-coordinates"

let watchId = null;

startButton.addEventListener('click', () => {
    startTracking();
});

endButton.addEventListener('click', () => {
    let coordinates = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_COORDINATES_KEY));

    displayMetrics(coordinates);

    buildMap(coordinates);

    window.localStorage.removeItem(LOCALSTORAGE_COORDINATES_KEY);

    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
});

buildMapButton.addEventListener('click', () => {
    let coords = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_COORDINATES_KEY));

    if (!coords)
        return;

    buildMap(coords);
});


function displayMetrics(coordinates) {
    let validSpeeds = coordinates
        .map(c => c.speed)
        .filter(s => typeof s === 'number' && !isNaN(s));

    let maxSpeed = Math.max(...validSpeeds);
    let averageSpeed = validSpeeds.reduce((a, b) => a + b, 0) / validSpeeds.length;

    let totalDistance = 0;

    for (let i = 1; i < coordinates.length; i++) {
        totalDistance += haversineDistance(coordinates[i - 1], coordinates[i]);
    }

    maxSpeedElement.innerText = `Speed: ${maxSpeed.toFixed(2)}`;
    averageSpeedElement.innerText = `Average Speed: ${averageSpeed.toFixed(2)}`;
    distanceElement.innerText = `Distance: ${(totalDistance / 1000).toFixed(2)} km`;
}

function buildMap(coords) {
    const latLngs = coords.map(coord => [coord.latitude, coord.longitude]);

    const map = L.map('map').setView(latLngs[0], 15); // Center on first coordinate

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

    L.polyline(latLngs, { color: 'blue', weight: 5 }).addTo(map);

    L.marker(latLngs[0]).addTo(map).bindPopup('Start').openPopup();
    L.marker(latLngs[latLngs.length - 1]).addTo(map).bindPopup('End');
}

function success(position) {
    let altitude = position.coords.altitude;
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    let speed = position.coords.speed;

    let geoEntity = {
        altitude,
        latitude,
        longitude,
        speed
    }

    let coordinates = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_COORDINATES_KEY)) || [];
    coordinates.push(geoEntity);

    displayMetrics(coordinates)

    window.localStorage.setItem(LOCALSTORAGE_COORDINATES_KEY, JSON.stringify(coordinates));
}

function error(e) {
    alert("Sorry, no position available: " + e);
    console.log(e);
}

function startTracking() {
    watchId = navigator.geolocation.watchPosition(success, error, options);
}

function haversineDistance(coord1, coord2) {
    const R = 6371000; // Earth's radius in meters
    const toRad = angle => angle * Math.PI / 180;

    const lat1 = toRad(coord1.latitude);
    const lon1 = toRad(coord1.longitude);
    const lat2 = toRad(coord2.latitude);
    const lon2 = toRad(coord2.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
}
