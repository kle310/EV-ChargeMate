import { wrapInLayout } from './layout';
import { Station } from '../types';

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
  `;

  // Group stations by location
  const locationGroups = stations.reduce((groups: { [key: string]: LocationGroup }, station) => {
    const key = `${station.latitude},${station.longitude}`;
    if (!groups[key]) {
      groups[key] = {
        latitude: station.latitude,
        longitude: station.longitude,
        stations: []
      };
    }
    groups[key].stations.push(station);
    return groups;
  }, {});

  const locationGroupsJson = JSON.stringify(Object.values(locationGroups));

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

  return wrapInLayout(content, 'Map', 'map', mapStyles);
};
