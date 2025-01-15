import { wrapInLayout } from "./layout";
import { GroupedChargers } from "../types";

export const generateHomeView = (stations: GroupedChargers): string => {
  const homeStyles = `
    .section {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h2 {
      color: #444;
      margin-top: 0;
    }
    .station-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .station-card {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      transition: transform 0.2s;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    .station-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .station-name {
      font-weight: bold;
      margin-bottom: 8px;
    }
    .station-price {
      color: #666;
    }
    .station-location {
      color: #888;
      font-size: 0.9em;
      margin-top: 8px;
    }
    .station-status {
      margin-top: 10px;
      padding: 5px 10px;
      border-radius: 4px;
      display: inline-block;
    }
    .status-available {
      background-color: #2ecc71;
      color: white;
    }
    .status-charging {
      background-color: #e74c3c;
      color: white;
    }
    .status-unknown {
      background-color: #d3d3d3;
      color: white;
    }
    .status-loading {
      background-color: #f1c40f;
      color: white;
    }
    .free-tag {
      color: #2ecc71;
      font-weight: bold;
    }
    .paid-tag {
      color: #e74c3c;
    }
  `;

  const content = `
    <div class="section">
      <h2>Free Chargers</h2>
      <div class="station-list">
        ${stations.free
          .map(
            (station) => `
          <a href="/station/${station.station_id}" class="station-card" data-station-id="${station.station_id}">
            <div class="station-name">${station.name}</div>
            <div class="station-price free-tag">Free</div>
            <div class="station-location">
              ${station.address}
            </div>
            <div id="status-${station.station_id}" class="station-status status-loading">
              Loading...
            </div>
          </a>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="section">
      <h2>Paid Chargers</h2>
      <div class="station-list">
        ${stations.paid
          .map(
            (station) => `
          <a href="/station/${station.station_id}" class="station-card" data-station-id="${station.station_id}">
            <div class="station-name">${station.name}</div>
            <div class="station-price paid-tag">$${station.price_per_kwh}/kWh</div>
            <div class="station-location">
              ${station.address}
            </div>
            <div id="status-${station.station_id}" class="station-status status-loading">
              Loading...
            </div>
          </a>
        `
          )
          .join("")}
      </div>
    </div>

    <script>
      async function fetchStationStatus(stationId, elementId) {
        const statusElement = document.getElementById(elementId);
        try {
          const response = await fetch(\`/station/\${stationId}/status\`);
          const data = await response.json();

          const status = data.status_type?.toLowerCase() || '';
          const statusClass = ['available', 'charging'].includes(status) ? \`status-\${status}\` : 'status-unknown';
          const statusText = status.toUpperCase();

          statusElement.textContent = statusText;
          statusElement.className = \`station-status \${statusClass}\`;
          
        } catch (error) {
          statusElement.textContent = 'Error';
          statusElement.className = 'station-status status-unavailable';
        }
      }

      window.onload = function() {
        const statusElements = document.querySelectorAll('[data-station-id]');
        statusElements.forEach(element => {
          const stationId = element.getAttribute('data-station-id');
          fetchStationStatus(stationId, \`status-\${stationId}\`);
        });
      };
    </script>
  `;

  return wrapInLayout(content, "Home", "home", homeStyles);
};
