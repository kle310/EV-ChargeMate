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
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
    .station-header {
      background: white;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .station-header-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .station-name {
      font-size: 2em;
      margin: 0;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .cpo-icon {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }
    .station-info-container {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .station-power {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.9em;
      background-color: #f8f9fa;
      color: #2c3e50;
      gap: 6px;
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
    .station-location a {
      color: inherit;
      text-decoration: none;
    }
    .station-location a:hover {
      color: #3498db;
    }
    .status-link {
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.9em;
      font-weight: 500;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      white-space: nowrap;
      margin-top: auto;
      width: fit-content;
    }
    .status-link.available {
      background-color: #e8f5e9;
      color: #2ecc71;
    }
    .status-link.busy {
      background-color: #fdeaea;
      color: #e74c3c;
    }
    .status-link.unknown {
      background-color: #f5f6fa;
      color: #95a5a6;
    }
    .status-link.loading {
      background-color: #fff8e1;
      color: #f39c12;
    }
    .price-tag, .power-tag {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.95em;
      gap: 6px;
    }
    .free-tag {
      background-color: #e8f5e9;
      color: #2ecc71;
    }
    .free-tag::before {
      content: "";
    }
    .paid-tag {
      background-color: #fff8e1;
      color: #f39c12;
    }
    .paid-tag::before {
      content: "";
    }
    .power-tag {
      background-color: #f8f9fa;
      color: #2c3e50;
    }
    .power-tag::before {
      content: "⚡";
    }
    .charts-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-top: 32px;
    }
    .chart-section {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .chart-title {
      font-size: 1.4em;
      color: #2c3e50;
      margin: 0 0 20px 0;
    }
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 24px;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      text-align: center;
    }
    .stat-title {
      color: #7f8c8d;
      font-size: 0.9em;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 1.8em;
      font-weight: 600;
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
    @media (max-width: 768px) {
      .station-header {
        padding: 24px;
      }
      .station-name {
        font-size: 1.6em;
      }
      .station-location {
        font-size: 1em;
      }
    }
    @media (max-width: 480px) {
      .station-header {
        padding: 20px;
      }
      .station-name {
        font-size: 1.4em;
      }
      .station-info-container {
        gap: 8px;
      }
      .status-link {
        width: 100%;
      }
    }
  `;

  const content = `
    <div class="station-details">
      <div class="station-header">
        <div class="station-header-content">
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
            <div class="station-power">⚡ ${station.max_electric_power}kW</div>
            <span class="price-tag ${
              Number(station.price) === 0 ? "free-tag" : "paid-tag"
            }">
              ${
                Number(station.price) === 0
                  ? "✓ Free"
                  : `💰 $${station.price}/${station.price_unit}`
              }
            </span>
          </div>
          <div class="station-location">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${
              station.latitude
            },${station.longitude}" 
               target="_blank" rel="noopener noreferrer" 
               title="Get directions to this charging station">
              ${station.address.trim()}, ${station.city}
            </a>
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
      </div>

      <div class="charts-container">
        <div class="chart-section">
          <h2 class="chart-title">Usage Insights</h2>
          <div class="stats-container">
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
                .filter((status) => status.plug_status.toLowerCase() === "busy")
                .reduce((sum, status) => sum + (status.duration || 0), 0);

              // Calculate total sessions and activity level
              const chargingSessions = last7Days.filter(
                (status) => status.plug_status.toLowerCase() === "busy"
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
                .filter((status) => status.plug_status.toLowerCase() === "busy")
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
                (status) => status.plug_status.toLowerCase() === "busy"
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
                  <div class="stat-title">Avg. Daily Sessions</div>
                  <div class="stat-value ${activityLevel}">${avgDailySessions}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-title">Avg. Session Duration (min)</div>
                  <div class="stat-value ${activityLevel}">${Math.round(
                avgSessionDuration
              )}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-title">Peak Usage Time</div>
                  <div class="stat-value ${activityLevel}">${peakHourFormatted}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-title">Best Time to Charge</div>
                  <div class="stat-value ${activityLevel}">${offPeakHourFormatted}</div>
                </div>
              `;
            })()}
          </div>
        </div>

        <div class="chart-section">
          <h2 class="chart-title">Usage by Day of Week</h2>
          <div class="stats-container">
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
                  statusDate >= sevenDaysAgo &&
                  status.plug_status.toLowerCase() === "busy"
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
                    <div class="stat-card">
                      <div class="stat-title">${day}</div>
                      <div class="stat-value ${activityLevel}">${hours}h</div>
                    </div>
                  `;
                })
                .join("");
            })()}
          </div>
        </div>
      </div>

      <div class="chart-section">
        <h2 class="chart-title">Recent Status History</h2>
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
