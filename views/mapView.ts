import { wrapInLayout } from "./layout";
import { Station } from "../types/types";

interface LocationGroup {
  latitude: number;
  longitude: number;
  stations: Station[];
}

export const generateMapView = (stations: Station[]): string => {
  const mapStyles = `
    #map {
      height: 800px;
      width: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-top: 20px;
    }
    .map-controls {
      position: absolute;
      top: 80px;
      right: 10px;
      z-index: 1000;
      background: white;
      padding: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .locate-button {
      width: 40px;
      height: 40px;
      background: white;
      border: 2px solid rgba(0,0,0,0.2);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      margin-bottom: 10px;
    }
    .locate-button:hover {
      background: #f4f4f4;
    }
    .locate-button svg {
      width: 20px;
      height: 20px;
      fill: #666;
    }
    .locate-button.active svg {
      fill: #2196F3;
    }
    .user-location {
      background-color: #2196F3;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(33,150,243,0.4);
    }
    .filter-switch {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 24px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: #2196F3;
    }
    input:checked + .slider:before {
      transform: translateX(26px);
    }
    .status-indicator {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9em;
      margin-top: 4px;
    }
    .status-available {
      background-color: #d4edda;
      color: #155724;
    }
    .status-unavailable {
      background-color: #f8d7da;
      color: #721c24;
    }
    .status-unknown {
      background-color: #e2e3e5;
      color: #383d41;
    }
    .station-count {
      background: #28a745;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
    .loading-indicator {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 1000;
      background: white;
      padding: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .loading-indicator.hidden {
      display: none;
    }
    .error-message {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 1000;
      background: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .station-power {
      background-color: #f8f9fa;
      padding: 4px 10px;
      border-radius: 6px;
      color: #2c3e50;
      font-size: 0.9em;
      font-weight: 500;
    }
    .station-price {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.9em;
      font-weight: 500;
    }
    .free-tag {
      background-color: #e8f5e9;
      color: #2ecc71;
    }
    .paid-tag {
      background-color: #fff8e1;
      color: #f39c12;
    }
  `;

  const locationGroups = stations.reduce(
    (groups: { [key: string]: LocationGroup }, station) => {
      const key = `${station.latitude},${station.longitude}`;
      if (!groups[key]) {
        groups[key] = {
          latitude: station.latitude,
          longitude: station.longitude,
          stations: [],
        };
      }
      groups[key].stations.push(station);
      return groups;
    },
    {}
  );

  const locationGroupsJson = JSON.stringify(Object.values(locationGroups));

  const content = `
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
    
    <div id="map"></div>
    <div class="map-controls">
      <div id="stationCount"></div>
    </div>

    <script>
      let markers = [];
      let clusterGroup;
      let userMarker = null;
      const locationGroups = ${locationGroupsJson};

      // Initialize the map with a default view
      const map = L.map('map').setView([34.0522, -118.2437], 10);
      
      // Add the OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap contributors'
      }).addTo(map);

      // Initialize cluster group
      clusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
      }).addTo(map);

      // Calculate distance between two points
      function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return (R * c).toFixed(1);
      }

      // Create custom icon for available stations
      function createCustomIcon(count) {
        return L.divIcon({
          html: \`<div class="station-count" style="background-color: #28a745">\${count}</div>\`,
          className: 'custom-marker',
          iconSize: [24, 24]
        });
      }

      // Show error message
      function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
      }

      // Create markers for location groups
      function createMarkers(stations = locationGroups) {
        markers = [];
        clusterGroup.clearLayers();

        let totalStations = 0;

        stations.forEach(group => {
          if (group.stations.length === 0) return;
          
          totalStations += group.stations.length;

          const marker = L.marker(
            [group.latitude, group.longitude],
            { icon: createCustomIcon(group.stations.length) }
          )
            .bindPopup(() => {
              const popupContent = document.createElement('div');
              popupContent.className = 'station-popup';
              
              const stationList = document.createElement('ul');
              stationList.className = 'station-list';
              
              // Sort stations by distance if user location exists
              const sortedStations = [...group.stations].sort((a, b) => {
                if (userMarker) {
                  const userPos = userMarker.getLatLng();
                  const distA = calculateDistance(userPos.lat, userPos.lng, a.latitude, a.longitude);
                  const distB = calculateDistance(userPos.lat, userPos.lng, b.latitude, b.longitude);
                  return distA - distB;
                }
                return 0;
              });

              sortedStations.forEach(station => {
                let distance = '';
                if (userMarker) {
                  const userPos = userMarker.getLatLng();
                  distance = calculateDistance(userPos.lat, userPos.lng, station.latitude, station.longitude);
                }

                const stationItem = document.createElement('li');
                stationItem.className = 'station-item';
                stationItem.innerHTML = \`
                  <h3><a href="/station/\${station.station_id}">\${station.name}</a></h3>
                  
                  <p class="station-summary"><span class=\\"station-power\\">\${station.max_electric_power}kW </span>
                  
                   \${station.price === 0 ? "<span class=\\"free-tag\\">✓ Free</span>" : "<span class=\\"paid-tag\\">$" + station.price + "/" + station.price_unit}</span>
                  </p>
                  <p><a href="https://maps.google.com/?q=\${encodeURIComponent(station.address + ', ' + station.city)}" target="_blank">\${station.address}, \${station.city}</a></p>
                  
                \`;
                stationList.appendChild(stationItem);
              });
              
              popupContent.appendChild(stationList);
              return popupContent;
            });
            
          markers.push(marker);
          clusterGroup.addLayer(marker);
        });

        // Update station count
        const countElement = document.getElementById('stationCount');
        countElement.textContent = \`\${totalStations} Available\`;

        return markers;
      }

      // Create custom location control
      L.Control.Locate = L.Control.extend({
        onAdd: function(map) {
          const container = L.DomUtil.create('div', 'locate-button leaflet-bar leaflet-control');
          container.innerHTML = \`
            <button type="button" title="Show my location" aria-label="Show my location">
              <svg viewBox="0 0 24 24">
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
              </svg>
            </button>
          \`;
          
          container.onclick = () => {
            if (userMarker) {
              map.setView(userMarker.getLatLng(), 15);
              container.classList.add('active');
              setTimeout(() => container.classList.remove('active'), 2000);
            } else {
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    if (!userMarker) {
                      userMarker = L.marker([latitude, longitude], {
                        icon: L.divIcon({
                          className: 'user-location',
                          iconSize: [12, 12]
                        })
                      }).addTo(map);
                    } else {
                      userMarker.setLatLng([latitude, longitude]);
                    }
                    map.setView([latitude, longitude], 15);
                    container.classList.add('active');
                    setTimeout(() => container.classList.remove('active'), 2000);
                  },
                  (error) => showError('Error getting location. Please try again.'),
                  { enableHighAccuracy: true }
                );
              }
            }
          };
          
          return container;
        }
      });

      // Add the location control to the map
      new L.Control.Locate({ position: 'topleft' }).addTo(map);

      // Watch user's location
      if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            if (!userMarker) {
              userMarker = L.marker([latitude, longitude], {
                icon: L.divIcon({
                  className: 'user-location',
                  iconSize: [12, 12]
                })
              }).addTo(map);
            } else {
              userMarker.setLatLng([latitude, longitude]);
            }
          },
          (error) => showError('Error watching location. Please try again.'),
          { enableHighAccuracy: true }
        );
      }

      // Initialize map with available stations
      createMarkers();
      if (markers.length > 0) {
        map.fitBounds(clusterGroup.getBounds(), { padding: [50, 50] });
      }
    </script>
  `;

  return wrapInLayout(content, "Charging Stations Map", "map", mapStyles);
};
