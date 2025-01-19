import { wrapInLayout } from './layout';
import { Station } from '../types';

export const generateMapView = (stations: Station[]): string => {
  const mapStyles = `
    #map {
      height: 800px;
      width: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .leaflet-popup-content {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .station-popup {
      padding: 10px;
    }
    .station-popup h3 {
      margin: 0 0 10px 0;
      color: #333;
    }
    .station-popup p {
      margin: 5px 0;
      color: #666;
    }
    .station-price {
      font-weight: bold;
      color: #28a745;
    }
  `;

  const stationsJson = JSON.stringify(stations);

  const content = `
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <div id="map"></div>

    <script>
      // Initialize the map
      const map = L.map('map').setView([34.0522, -118.2437], 10);
      
      // Add the OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap contributors'
      }).addTo(map);

      // Add markers for each station
      const stations = ${stationsJson};
      
      stations.forEach(station => {
        const marker = L.marker([station.latitude, station.longitude])
          .addTo(map)
          .bindPopup(\`
            <div class="station-popup">
              <h3>\${station.name}</h3>
              <p>Station ID: \${station.station_id}</p>
              <p class="station-price">Price: $\${station.price_per_kwh}/kWh</p>
              <p>
                <a href="https://www.google.com/maps/dir/?api=1&destination=\${station.latitude},\${station.longitude}" 
                   target="_blank" rel="noopener noreferrer">
                  Get Directions
                </a>
              </p>
            </div>
          \`);
      });

      // Fit the map bounds to show all markers
      if (stations.length > 0) {
        const bounds = L.latLngBounds(stations.map(s => [s.latitude, s.longitude]));
        map.fitBounds(bounds);
      }
    </script>
  `;

  return wrapInLayout(content, 'Map', 'map', mapStyles);
};
