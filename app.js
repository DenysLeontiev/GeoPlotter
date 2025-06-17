const startButton = document.getElementById('start-button');
const endButton = document.getElementById('end-button');
const buildMapButton = document.getElementById('build-map-button');

let coordinates = [];

const options = {
    enableHighAccuracy: true,
    maximumAge: 30000,
};

startButton.addEventListener('click', () => {
    startTracking();

    console.log(JSON.parse(window.localStorage.getItem('geo')));
});

endButton.addEventListener('click', () => {
    coordinates = [];
    window.localStorage.removeItem('geo');
});

buildMapButton.addEventListener('click', () => {
    let coords = JSON.parse(window.localStorage.getItem('geo'));

    if (!coords)
        return;

    const latLngs = coords.map(coord => [coord.latitude, coord.longitude]);

    const map = L.map('map').setView(latLngs[0], 15); // Center on first coordinate

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.polyline(latLngs, { color: 'blue', weight: 5 }).addTo(map);

    L.marker(latLngs[0]).addTo(map).bindPopup('Start').openPopup();
    L.marker(latLngs[latLngs.length - 1]).addTo(map).bindPopup('End');
});


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

    coordinates.push(geoEntity);

    window.localStorage.setItem('geo', JSON.stringify(coordinates));

    console.log(geoEntity);
}

function error(e) {
    alert("Sorry, no position available: " + e);
    console.log(e);
}

function startTracking() {
    navigator.geolocation.watchPosition(success, error, options);
}
