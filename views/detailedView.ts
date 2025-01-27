import { wrapInLayout } from "./layout";
import { Station, StationStatus } from "../types/types";

const getStatusText = (statusType: string): string => {
  switch (statusType?.toUpperCase()) {
    case "BUSY":
      return "IN USE";
    default:
      return statusType.toUpperCase();
  }
};

export const generateDetailedView = (
  station: Station,
  availability: StationStatus[]
): string => {
  const detailedStyles = `
    .station-details {
      background-color: white;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .station-header {
      margin-bottom: 24px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: relative;
    }
    .station-name {
      font-size: 1.6em;
      margin: 0 0 16px 0;
      color: #333;
    }
    .station-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .station-address {
      flex-grow: 1;
      color: #666;
    }
    .station-address a {
      color: #0066cc;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .station-address a:hover {
      color: #004999;
      text-decoration: underline;
    }
    .station-address a::before {
      content: "📍";
      font-size: 1.1em;
    }
    .tag-container {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .price-tag, .power-tag, .cpo-tag, .realtime-tag {
      font-size: 0.85em;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
    }
    .price-tag {
      background-color: #fbe9e7;
      color: #e74c3c;
    }
    .power-tag {
      background-color: #f0f0f0;
      color: #666;
    }
    .cpo-tag {
      background-color: #e8f4ff;
      color: #0066cc;
    }
    .realtime-tag {
      font-weight: 500;
    }
    .realtime-enabled {
      background-color: #e6ffe6;
      color: #008000;
    }
    .realtime-disabled {
      background-color: #ffe6e6;
      color: #cc0000;
    }
    .status-link {
      position: absolute;
      top: 20px;
      right: 20px;
      padding: 5px 12px;
      border-radius: 20px;
      text-decoration: none;
      color: white;
      font-size: 0.9em;
    }
    .status-link.available {
      background-color: #2ecc71;
      color: white;
    }
    .status-link.available:hover {
      background-color: #27ae60;
    }
    .status-link.busy {
      background-color: #e74c3c;
      color: white;
    }
    .status-link.busy:hover {
      background-color: #c0392b;
    }
    .status-link.unknown {
      background-color: #95a5a6;
      color: white;
    }
    .status-link.unknown:hover {
      background-color: #7f8c8d;
    }
    .status-link.loading {
      background-color: #f1c40f;
      color: white;
    }
    .status-link.loading:hover {
      background-color: #f39c12;
    }
    .info-section {
      margin-bottom: 24px;
    }
    .info-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      flex: 0 0 130px;
      color: #666;
      font-weight: 500;
    }
    .info-value {
      flex: 1;
      color: #333;
    }
    .usage-history {
      margin-top: 20px;
    }
    .usage-history h2 {
      font-size: 1.4em;
      margin: 0 0 15px 0;
    }
    .usage-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      padding: 12px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 1.6em;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 0.9em;
      color: #666;
    }
    .usage-chart {
      margin-top: 20px;
    }
    .day-bar {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .day-label {
      width: 100px;
      font-size: 0.9em;
      color: #666;
    }
    .bar-container {
      flex-grow: 1;
      background-color: #e9ecef;
      height: 20px;
      border-radius: 10px;
      overflow: hidden;
    }
    .bar {
      height: 100%;
      background-color: #2ecc71;
      border-radius: 10px;
    }
    .bar.low {
      background-color: #2ecc71;
    }
    .bar.moderate {
      background-color: #f1c40f;
    }
    .bar.busy {
      background-color: #e74c3c;
    }
    .availability-history {
      margin-top: 20px;
    }
    .availability-history h2 {
      font-size: 1.4em;
      margin: 0 0 15px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9em;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      font-weight: 500;
      color: #666;
    }
    .free-tag {
      background-color: #e8f5e9;
      color: #2ecc71;
    }
    .paid-tag {
      background-color: #fbe9e7;
      color: #e74c3c;
    }
    .activity-badge {
      font-size: 0.9em;
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: 500;
    }
    .activity-badge.low {
      background-color: #e8f5e9;
      color: #2ecc71;
    }
    .activity-badge.moderate {
      background-color: #fff3cd;
      color: #f1c40f;
    }
    .activity-badge.busy {
      background-color: #fee8e7;
      color: #e74c3c;
    }
    .stat-value.low {
      color: #2ecc71;
    }
    .stat-value.moderate {
      color: #f1c40f;
    }
    .stat-value.busy {
      color: #e74c3c;
    }
  `;

  const content = `
    <div class="station-details">
      <div class="station-header">
        <h1 class="station-name">${station.name}</h1>
        <div class="station-info">
          <div class="station-address">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${
              station.latitude
            },${station.longitude}" 
               target="_blank" rel="noopener noreferrer" 
               title="Get directions to this charging station">
              ${station.address.trim()}, ${station.city}
            </a>
          </div>
          <div class="tag-container">
            ${
              Number(station.price) === 0
                ? '<span class="price-tag free-tag">Free</span>'
                : `<span class="price-tag paid-tag">$${station.price}/${station.price_unit}</span>`
            }
            <span class="power-tag">${station.max_electric_power}kW</span>
            <span class="cpo-tag">${station.cpo_id}</span>
            <span class="realtime-tag ${
              station.realtime_enabled
                ? "realtime-enabled"
                : "realtime-disabled"
            }">
              ${station.realtime_enabled ? "Real-time" : "Non Real-time"}
            </span>
          </div>
        </div>
        <a href="/station/${station.station_id}/live" class="status-link ${
    !availability || availability.length === 0
      ? "loading"
      : availability[0]?.plug_status === "AVAILABLE"
      ? "available"
      : availability[0]?.plug_status === "BUSY"
      ? "busy"
      : "unknown"
  }">
          ${
            !availability || availability.length === 0
              ? "Loading..."
              : getStatusText(availability[0]?.plug_status)
          }
        </a>
      </div>

      <div class="usage-history">
        <h2>
          Usage Insights
       
        </h2>
        <div class="usage-stats">
          ${(() => {
            // Calculate usage statistics
            const last7Days = availability.filter((status) => {
              const statusDate = new Date(status.timestamp);
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return statusDate >= sevenDaysAgo;
            });

            // Calculate total charging time
            const totalChargingMinutes = last7Days
              .filter((status) => status.plug_status === "Charging")
              .reduce((sum, status) => sum + (status.duration || 0), 0);

            // Calculate total sessions and activity level
            const chargingSessions = last7Days.filter(
              (status) => status.plug_status === "Charging"
            ).length;

            let activityLevel: "low" | "moderate" | "busy";
            if (chargingSessions < 70) {
              activityLevel = "low";
            } else if (chargingSessions <= 150) {
              activityLevel = "moderate";
            } else {
              activityLevel = "busy";
            }

            const avgDailySessions = (chargingSessions / 7).toFixed(1);

            // Calculate peak usage time
            const hourCounts = new Array(24).fill(0);
            last7Days
              .filter((status) => status.plug_status === "Charging")
              .forEach((status) => {
                const hour = new Date(status.timestamp).getHours();
                hourCounts[hour] += status.duration || 0;
              });
            const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
            const offPeakHour = hourCounts.indexOf(
              Math.min(...hourCounts.filter((count) => count > 0))
            );

            const peakHourFormatted = new Date(
              2020,
              0,
              1,
              peakHour
            ).toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            });
            const offPeakHourFormatted = new Date(
              2020,
              0,
              1,
              offPeakHour
            ).toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            });

            // Calculate average session duration
            const chargingSessionsForAvg = last7Days.filter(
              (status) => status.plug_status === "Charging"
            );
            const avgSessionDuration =
              chargingSessionsForAvg.length > 0
                ? Math.round(
                    chargingSessionsForAvg.reduce(
                      (sum, status) => sum + (status.duration || 0),
                      0
                    ) / chargingSessionsForAvg.length
                  )
                : 0;

            return `
              <div class="stat-card">
                <div class="stat-value ${activityLevel}">${avgDailySessions}</div>
                <div class="stat-label">Avg. Daily Sessions</div>
              </div>
              <div class="stat-card">
                <div class="stat-value ${activityLevel}">${Math.round(
              avgSessionDuration
            )}</div>
                <div class="stat-label">Avg. Session Duration (min)</div>
              </div>
              <div class="stat-card">
                <div class="stat-value ${activityLevel}">${peakHourFormatted}</div>
                <div class="stat-label">Peak Usage Time</div>
              </div>
              <div class="stat-card">
                <div class="stat-value ${activityLevel}">${offPeakHourFormatted}</div>
                <div class="stat-label">Best Time to Charge</div>
              </div>
            `;
          })()}
        </div>

        <div class="usage-chart">
          ${(() => {
            // Calculate usage by day of week
            const dayUsage = {
              Sunday: 0,
              Monday: 0,
              Tuesday: 0,
              Wednesday: 0,
              Thursday: 0,
              Friday: 0,
              Saturday: 0,
            };

            const chargingSessions = availability.filter((status) => {
              const statusDate = new Date(status.timestamp);
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return (
                statusDate >= sevenDaysAgo && status.plug_status === "Charging"
              );
            });

            chargingSessions.forEach((status) => {
              const day = new Date(status.timestamp).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                }
              );
              const isValidDay = (d: string): d is keyof typeof dayUsage => {
                return d in dayUsage;
              };
              if (isValidDay(day)) {
                dayUsage[day] += status.duration || 0;
              }
            });

            // Determine activity level based on total sessions
            let activityLevel: "low" | "moderate" | "busy";
            if (chargingSessions.length < 70) {
              activityLevel = "low";
            } else if (chargingSessions.length <= 150) {
              activityLevel = "moderate";
            } else {
              activityLevel = "busy";
            }

            const maxUsage = 1440;

            return Object.entries(dayUsage)
              .map(([day, minutes]) => {
                const percentage =
                  maxUsage > 0 ? (minutes / maxUsage) * 100 : 0;
                const hours = (minutes / 60).toFixed(1);
                return `
                  <div class="day-bar">
                    <div class="day-label">${day}</div>
                    <div class="bar-container">
                      <div class="bar ${activityLevel}" style="width: ${percentage}%"></div>
                    </div>
                    <div style="margin-left: 10px; color: #666;">${hours}h</div>
                  </div>
                `;
              })
              .join("");
          })()}
        </div>
      </div>

      <div class="availability-history">
        <h2>Recent Status History</h2>
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
              const MAX_ROWS = 12; // Limit for rows to return
              let table = "";
              let isFirstRow = true;
              let rowCount = 0;

              // Filter and limit the rows to process
              const filteredRows = availability.filter((row, index) => {
                if (rowCount >= MAX_ROWS) return false; // Stop processing after MAX_ROWS
                if ((row.duration || 0) < 5 && !isFirstRow) return false; // Skip rows with duration < 5 except the first
                rowCount++; // Increment row count for included rows
                isFirstRow = false; // Set isFirstRow to false after the first iteration
                return true; // Include the row
              });

              // Generate table rows
              filteredRows.forEach((row) => {
                const rowColor =
                  row.plug_status?.trim().toUpperCase() === "AVAILABLE"
                    ? 'style="background-color: #2ecc71; color: white;"'
                    : "";

                const startTimeStr = row.timestamp.toLocaleTimeString("en-US", {
                  weekday: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });

                table += `
                  <tr ${rowColor}>
                    <td>${getStatusText(row.plug_status || "")}</td>
                    <td>${startTimeStr || ""}</td>
                    <td>${row.duration || ""}</td>
                  </tr>
                `;
              });
              return table; // Return the generated table HTML
            })()}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return wrapInLayout(content, station.name, "station", detailedStyles);
};
