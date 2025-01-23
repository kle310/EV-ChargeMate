import { wrapInLayout } from "./layout";
import { GroupedChargers } from "../types";

export const generateHomeView = (
  stations: GroupedChargers,
  selectedCity: string = ""
): string => {
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
    .city-selector {
      margin-bottom: 20px;
      padding: 10px;
      width: 100%;
      max-width: 600px;
    }
    .city-selector select {
      width: 100%;
      padding: 12px 16px;
      font-size: 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: white;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      background-size: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .city-selector select:hover {
      border-color: #999;
    }
    .city-selector select:focus {
      outline: none;
      border-color: #2ecc71;
      box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
    }
    @media (max-width: 768px) {
      .city-selector {
        padding: 15px;
      }
      .city-selector select {
        padding: 16px 20px;
        font-size: 18px;
        background-size: 14px;
        background-position: right 20px center;
      }
    }
  `;

  const filterStationsByCity = (stationList: any[]) => {
    if (selectedCity === "") return stationList;

    return stationList.filter((station) => {
      const stationCity = station.city?.toLowerCase().replace(/\s+/g, "_");
      return stationCity === selectedCity;
    });
  };

  const content = `
    <div class="city-selector">
      <select id="citySelector" onchange="window.location.href = '/?city=' + encodeURIComponent(this.value)">
        <option value="" ${selectedCity === "" ? "selected" : ""}>Choose City</option>
        ${[
          ...new Set([
            ...stations.free.map((station) => station.city.toLowerCase()),
            ...stations.paid.map((station) => station.city.toLowerCase()),
          ]),
        ]
          .filter((city) => city) // Remove any undefined or empty cities
          .sort()
          .map((city) => {
            const cityValue = city.replace(/\s+/g, "_");
            const cityDisplay = city
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "); // Capitalize each word in the city name
            return `
              <option value="${cityValue}" 
                ${selectedCity === cityValue ? "selected" : ""}>
                ${cityDisplay}
              </option>
            `;
          })
          .join("")}
      </select>
    </div>
    <div class="section">
      <h2>Free Chargers</h2>
      <div class="station-list">
        ${filterStationsByCity(stations.free)
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
      <h2>Discounted Chargers</h2>
      <div class="station-list">
        ${filterStationsByCity(stations.paid)
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
