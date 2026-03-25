document.addEventListener("DOMContentLoaded", function () {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // Initialize map
  const map = L.map('map').setView([coordinates[1], coordinates[0]], 13);

  // Tile layer
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  // Custom red marker icon
  const redIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34] // ensures popup appears nicely above marker
  });

  // Add marker
  const marker = L.marker([coordinates[1], coordinates[0]], { icon: redIcon })
    .addTo(map)
    .bindPopup(`<b>${locationName}</b>
                <p>Exact Location will be share after booking<p>`);

  // Open popup after map fully loads (more reliable)
  map.whenReady(() => {
    marker.openPopup();
  });
});