import { wrapInLayout } from "./layout";
import { Station } from "../types";

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
    }
    .leaflet-popup-content {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      max-height: 400px;
      overflow-y: auto;
    }
    .station-popup {
      padding: 10px;
    }
    .station-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .station-item {
      border-bottom: 1px solid #eee;
      padding: 10px 0;
    }
    .station-item:last-child {
      border-bottom: none;
    }
    .station-item h3 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 1.1em;
    }
    .station-item p {
      margin: 5px 0;
      color: #666;
    }
    .station-price {
      font-weight: bold;
      color: #28a745;
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
    .locate-button {
      width: 34px;
      height: 34px;
      background: white;
      border: 2px solid rgba(0,0,0,0.2);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 5px rgba(0,0,0,0.65);
    }
    .locate-button:hover {
      background: #f4f4f4;
    }
    .locate-button svg {
      width: 18px;
      height: 18px;
      fill: #666;
    }
    .locate-button.active svg {
      fill: #2074e4;
    }
  `;

  // Group stations by location
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
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <div id="map"></div>

    <script>
      // Initialize the map with a default view
      const map = L.map('map').setView([34.0522, -118.2437], 10);
      let userMarker = null; // Move userMarker to global scope
      
      // Add the OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap contributors'
      }).addTo(map);

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
              const pos = userMarker.getLatLng();
              map.setView(pos, 15, {
                animate: true,
                duration: 1
              });
              container.classList.add('active');
              setTimeout(() => container.classList.remove('active'), 2000);
            } else {
              console.log('User location not yet available');
              // Request location if not available
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    map.setView([latitude, longitude], 15, {
                      animate: true,
                      duration: 1
                    });
                  },
                  (error) => console.error('Error getting location:', error)
                );
              }
            }
          };
          
          return container;
        }
      });
      
      // Add the location control to the map
      new L.Control.Locate({ position: 'topleft' }).addTo(map);

      // Get user's location and update map
      if ("geolocation" in navigator) {
        let firstLocation = true;

        const updateUserLocation = (position) => {
          const { latitude, longitude } = position.coords;
          
          // Center map on first location
          if (firstLocation) {
            map.setView([latitude, longitude], 13);
            firstLocation = false;
          }
          
          // Update or create user marker
          if (userMarker) {
            userMarker.setLatLng([latitude, longitude]);
          } else {
            userMarker = L.marker([latitude, longitude], {
              icon: L.divIcon({
                html: '<div style="background-color: #007bff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                className: 'user-location-marker'
              })
            }).addTo(map).bindPopup('Your Location');
          }
        };

        // Watch for location updates
        const watchId = navigator.geolocation.watchPosition(
          updateUserLocation,
          (error) => console.error('Error getting location:', error),
          {
            enableHighAccuracy: true,
            maximumAge: 30000,  // Accept cached positions up to 30 seconds old
            timeout: 27000      // Wait up to 27 seconds for a position
          }
        );

        // Clean up when page unloads
        window.addEventListener('unload', () => {
          if (watchId) navigator.geolocation.clearWatch(watchId);
        });
      }

      // Custom icon function based on station count
      function createCustomIcon(count) {
        return L.divIcon({
          html: '<div class="station-count">' + count + '</div>',
          className: 'custom-marker',
          iconSize: [24, 24]
        });
      }

      // Add markers for each location group
      const locationGroups = ${locationGroupsJson};
      
      locationGroups.forEach(group => {
        const marker = L.marker(
          [group.latitude, group.longitude], 
          { icon: createCustomIcon(group.stations.length) }
        )
          .addTo(map)
          .bindPopup(
            '<div class="station-popup">' +
              '<div class="station-list">' +
                group.stations.map(station => 
                  '<div class="station-item">' +
                    '<h3>' + station.name + '</h3>' +
                    '<p>Station ID: <a href="/station/' + station.station_id + '">' + station.station_id + '</a></p>' +
                    '<p class="station-price">Price: $' + station.price_per_kwh + '/kWh</p>' +
                    '<p>' +
                      '<a href="https://www.google.com/maps/dir/?api=1&destination=' + station.latitude + ',' + station.longitude + '" ' +
                         'target="_blank" rel="noopener noreferrer">' +
                        'Get Directions' +
                      '</a>' +
                    '</p>' +
                  '</div>'
                ).join('') +
              '</div>' +
            '</div>'
          );
      });

      // Fit the map bounds to show all markers
      if (locationGroups.length > 0) {
        const bounds = L.latLngBounds(locationGroups.map(g => [g.latitude, g.longitude]));
        map.fitBounds(bounds);
      }
    </script>
  `;

  return wrapInLayout(content, "Map", "map", mapStyles);
};
