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

  console.log("Input stations:", stations);
  console.log("Location groups:", locationGroups);
  const locationGroupsJson = JSON.stringify(Object.values(locationGroups));

  const content = `
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <div id="map"></div>
    <div class="map-controls">
      <div class="filter-switch">
        <label class="switch">
          <input type="checkbox" id="availableOnly">
          <span class="slider"></span>
        </label>
        <span>Show Available Only</span>
      </div>
      <div id="stationCount"></div>
    </div>

    <script>
      let markers = [];
      let markerGroup;
      let stationStatuses = {};
      let userMarker = null;
      const locationGroups = ${locationGroupsJson};

      // Initialize the map with a default view
      const map = L.map('map').setView([34.0522, -118.2437], 10);
      
      // Add the OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap contributors'
      }).addTo(map);

      // Create custom icon based on station count
      function createCustomIcon(count) {
        return L.divIcon({
          html: '<div class="station-count">' + count + '</div>',
          className: 'custom-marker',
          iconSize: [24, 24]
        });
      }

      // Fetch station statuses
      async function fetchStationStatuses() {
        try {
          const response = await fetch('/api/status?city=all');
          const result = await response.json();
          const data = result.data || [];
          console.log('Fetched statuses:', data);
          stationStatuses = {};
          data.forEach(status => {
            stationStatuses[status.station_id] = status;
          });
          updateMarkers();
        } catch (error) {
          console.error('Error fetching station statuses:', error);
        }
      }

      // Create markers for location groups
      function createMarkers(stations = locationGroups) {
        console.log('Creating markers for stations:', stations);
        markers = [];

        stations.forEach(group => {
          const marker = L.marker(
            [group.latitude, group.longitude],
            { icon: createCustomIcon(group.stations.length) }
          )
            .bindPopup(() => {
              const popupContent = document.createElement('div');
              popupContent.className = 'station-popup';
              
              const stationList = document.createElement('ul');
              stationList.className = 'station-list';
              
              group.stations.forEach(station => {
                const status = stationStatuses[station.station_id] || { plug_status: 'Unknown' };
                const statusClass = status.plug_status === 'Available' 
                  ? 'status-available'
                  : status.plug_status === 'Unknown' 
                    ? 'status-unknown' 
                    : 'status-unavailable';

                const stationItem = document.createElement('li');
                stationItem.className = 'station-item';
                stationItem.innerHTML = \`
                  <h3>\${station.name}</h3>
                  <p>\${station.address}, \${station.city}</p>
                  <p class="station-power">\${station.max_electric_power}kW</p>
                  <p class="station-price">$\${station.price}/\${station.price_unit}</p>
                  <div class="status-indicator \${statusClass}">
                    \${status.plug_status}
                  </div>
                \`;
                stationList.appendChild(stationItem);
              });
              
              popupContent.appendChild(stationList);
              return popupContent;
            });
            
          markers.push(marker);
        });

        // Update station count
        const countElement = document.getElementById('stationCount');
        const totalStations = markers.reduce((sum, marker) => {
          return sum + parseInt(marker.getIcon().options.html.match(/\\d+/)[0]);
        }, 0);
        countElement.textContent = \`Showing \${totalStations} stations\`;

        return markers;
      }

      // Update markers based on filter
      async function updateMarkers() {
        const showAvailableOnly = document.getElementById('availableOnly').checked;
        
        // Remove existing marker group if it exists
        if (markerGroup) {
          map.removeLayer(markerGroup);
        }

        if (showAvailableOnly) {
          try {
            const response = await fetch('/api/status?city=all');
            const result = await response.json();
            const availableStations = result.data || [];
            
            // Group available stations
            const availableGroups = locationGroups.map(group => ({
              ...group,
              stations: group.stations.filter(station => {
                const status = availableStations.find(s => s.station_id === station.station_id);
                return status && status.plug_status.toLowerCase() === 'available';
              })
            })).filter(group => group.stations.length > 0);

            // Create markers for available stations
            const newMarkers = createMarkers(availableGroups);
            if (newMarkers.length > 0) {
              markerGroup = L.featureGroup(newMarkers).addTo(map);
              map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
            }
          } catch (error) {
            console.error('Error fetching available stations:', error);
          }
        } else {
          // Show all stations
          const newMarkers = createMarkers();
          markerGroup = L.featureGroup(newMarkers).addTo(map);
          map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
        }
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
                  (error) => console.error('Error getting location:', error),
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
          (error) => console.error('Error watching location:', error),
          { enableHighAccuracy: true }
        );
      }

      // Initialize map with all stations
      const initialMarkers = createMarkers();
      markerGroup = L.featureGroup(initialMarkers).addTo(map);
      map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });

      // Add event listener for filter toggle
      document.getElementById('availableOnly').addEventListener('change', updateMarkers);

      // Refresh station statuses periodically
      setInterval(fetchStationStatuses, 60000); // Refresh every minute
    </script>
  `;

  return wrapInLayout(content, "Charging Stations Map", "map", mapStyles);
};
