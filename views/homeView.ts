import { wrapInLayout } from "./layout";
import { GroupedChargers } from "../types/types";

export const generateHomeView = (
  stations: GroupedChargers,
  selectedCity: string = ""
): string => {
  const homeStyles = `
    .section {
      background-color: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    h3 {
      color: #2c3e50;
      margin-top: 0;
      font-size: 1.2em;
      margin-bottom: 20px;
    }
    .station-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    .station-card {
      background-color: #fff;
      border: 1px solid #e1e8ed;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .station-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
      border-color: #3498db;
    }
    .station-name {
      font-weight: 600;
      font-size: 1.1em;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #2c3e50;
    }
    .cpo-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }
    .station-info-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
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
    .station-location {
      color: #7f8c8d;
      font-size: 0.95em;
      margin: 8px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .station-location::before {
      content: "📍";
      font-size: 1em;
    }
    .station-status {
      margin-top: auto;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.9em;
      font-weight: 500;
      text-align: center;
    }
    .status-available {
      background-color: #e8f5e9;
      color: #2ecc71;
    }
    .status-busy {
      background-color: #fdeaea;
      color: #e74c3c;
    }
    .status-unknown {
      background-color: #f5f6fa;
      color: #95a5a6;
    }
    .status-loading {
      background-color: #fff8e1;
      color: #f39c12;
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
        <option value="" ${
          selectedCity === "" ? "selected" : ""
        }>Choose City</option>
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
      <h3>Free Chargers</h3>
      <div class="station-list">
        ${filterStationsByCity(stations.free)
          .map(
            (station) => `
          <a href="/station/${
            station.station_id
          }" class="station-card" data-station-id="${station.station_id}">
            <div class="station-name">
              <img 
                src="/images/${station.cpo_id.toLowerCase()}-icon.png" 
                alt="${station.cpo_id} logo" 
                class="cpo-icon"
                title="${station.cpo_id}"
              />
              ${station.name}
            </div>
            <div class="station-info-container">
              <div class="station-power">⚡ ${
                station.max_electric_power
              }kW</div>
              <div class="station-price free-tag">✓ Free</div>
            </div>
            <div class="station-location">
              ${station.address}
            </div>
            <div id="status-${
              station.station_id
            }" class="station-status status-loading">
              Loading...
            </div>
          </a>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="section">
      <h3>Discounted Chargers</h3>
      <div class="station-list">
        ${filterStationsByCity(stations.paid)
          .map(
            (station) => `
          <a href="/station/${
            station.station_id
          }" class="station-card" data-station-id="${station.station_id}">
            <div class="station-name">
              <img 
                src="/images/${station.cpo_id.toLowerCase()}-icon.png" 
                alt="${station.cpo_id} logo" 
                class="cpo-icon"
                title="${station.cpo_id}"
              />
              ${station.name}
            </div>
            <div class="station-info-container">
              <div class="station-power">⚡ ${
                station.max_electric_power
              }kW</div>
              <div class="station-price paid-tag">💰 $${station.price}/${
              station.price_unit
            }</div>
            </div>
            <div class="station-location">
              ${station.address}
            </div>
            <div id="status-${
              station.station_id
            }" class="station-status status-loading">
              Loading...
            </div>
          </a>
        `
          )
          .join("")}
      </div>
    </div>

    <script>
      async function fetchStationStatus() {
        const city = document.getElementById('citySelector').value;
        if (!city) {
          // Reset all status indicators to "Select City" if no city is selected
          document.querySelectorAll('[id^="status-"]').forEach(element => {
            element.textContent = "Select City";
            element.className = "station-status status-unknown";
          });
          return;
        }

        try {
          const response = await fetch('/api/status?city=' + encodeURIComponent(city));
          const { data } = await response.json();

          data.forEach((station) => {
            const statusElement = document.getElementById('status-' + station.station_id);
            if (!statusElement) return;
            const status = station.plug_status?.toLowerCase() || '';
            const statusClass = !status ? 'status-loading' :
                              status === 'available' ? 'status-available' : 
                              status === 'busy' ? 'status-busy' : 
                              'status-unknown';
            const statusText = !status ? 'LOADING...' :
                             status === 'busy' ? 'IN USE' : 
                             status.toUpperCase();
            
            statusElement.textContent = statusText;
            statusElement.className = 'station-status ' + statusClass;
          });
        } catch (error) {
          console.error('Error fetching station status:', error);
        }
      }

      // Only fetch initially if a city is already selected
      if (document.getElementById('citySelector').value) {
        fetchStationStatus();
      }
      document.getElementById('citySelector').addEventListener('change', fetchStationStatus);
    </script>
  `;
  return wrapInLayout(content, "Home", "home", homeStyles);
};
