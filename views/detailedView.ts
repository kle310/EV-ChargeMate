import { wrapInLayout } from "./layout";
import { Station, StationStatus } from "../types";

export const generateDetailedView = (
  station: Station,
  availability: StationStatus[]
): string => {
  const detailedStyles = `
    .station-details {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .station-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .station-name {
      font-size: 2em;
      color: #333;
      margin: 0;
    }
    .price-tag {
      font-size: 1.2em;
      padding: 8px 16px;
      border-radius: 4px;
    }
    .station-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .info-item {
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .info-label {
      font-size: 0.9em;
      color: #666;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 1.1em;
      color: #333;
      font-weight: 500;
    }
    .availability-history {
      margin-top: 30px;
    }
    .availability-history table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .availability-history th {
      background-color: #f8f9fa;
      padding: 12px;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }
    .availability-history td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }
    .availability-history tr.available {
      background-color: #d4edda;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .free-tag {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .paid-tag {
      background-color: #fbe9e7;
      color: #c62828;
    }
    .availability-history {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `;

  const content = `
    <div class="station-details">
      <div class="station-header">
        <h1 class="station-name">${station.name}</h1>
        <div class="price-tag ${
          station.price_per_kwh == 0 ? "free-tag" : "paid-tag"
        }">
          ${
            station.price_per_kwh == 0
              ? "Free"
              : `$${station.price_per_kwh}/kWh`
          }
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Address</div>
          <div class="info-value">${station.address}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Max Power Output</div>
          <div class="info-value">${station.max_electric_power} kW</div>
        </div>
        <div class="info-item">
          <div class="info-label">Multi-Port Charging</div>
          <div class="info-value">${
            station.multi_port_charging_allowed ? "Allowed" : "Not Allowed"
          }</div>
        </div>
      </div>
    </div>

    <div class="availability-history">
      <h2>Availability History</h2>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Start Time</th>
            <th>Duration (min)</th>
          </tr>
        </thead>
        <tbody>
          ${(() => {
            // Sort availability records by timestamp in descending order
            const sortedRecords = [...availability].sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );

            // Group consecutive records with the same status
            const groupedRecords = [];
            let currentGroup = null;

            for (let i = 0; i < sortedRecords.length; i++) {
              const record = sortedRecords[i];
              const nextRecord = sortedRecords[i + 1];

              if (!currentGroup || record.plug_status !== currentGroup.status) {
                if (currentGroup) {
                  const duration = Math.round(
                    (currentGroup.startTime.getTime() -
                      new Date(record.timestamp).getTime()) /
                      (1000 * 60)
                  );
                  groupedRecords.push({
                    ...currentGroup,
                    duration,
                  });
                }

                currentGroup = {
                  status: record.plug_status,
                  startTime: new Date(record.timestamp),
                };
              }

              // If this is the last record, add the final group
              if (i === sortedRecords.length - 1) {
                const duration = Math.round(
                  (new Date("2025-01-14T09:53:05-08:00").getTime() -
                    currentGroup.startTime.getTime()) /
                    (1000 * 60)
                );
                groupedRecords.push({
                  ...currentGroup,
                  duration,
                });
              }
            }

            return groupedRecords
              .map((record) => {
                const startTimeStr = record.startTime.toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }
                );

                return `
                <tr class="${
                  record.status.toLowerCase() === "available" ? "available" : ""
                }">
                  <td>${record.status}</td>
                  <td>Today ${startTimeStr}</td>
                  <td>${record.duration}</td>
                </tr>
              `;
              })
              .join("");
          })()}
        </tbody>
      </table>
    </div>
  `;

  return wrapInLayout(content, station.name, "station", detailedStyles);
};
