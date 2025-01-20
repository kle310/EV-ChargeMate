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
    .header-actions {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    .price-tag {
      font-size: 1.2em;
      padding: 8px 16px;
      border-radius: 4px;
    }
    .status-link {
      padding: 6px 12px;
      border-radius: 20px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .status-link.available {
      background-color: #e8f5e9;
      color: #2ecc71;
    }
    .status-link.available:hover {
      background-color: #c8e6c9;
    }
    .status-link.charging {
      background-color: #fee8e7;
      color: #e74c3c;
    }
    .status-link.charging:hover {
      background-color: #fdd9d7;
    }
    .status-link.unknown {
      background-color: #f5f5f5;
      color: #95a5a6;
    }
    .status-link.unknown:hover {
      background-color: #eeeeee;
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
      color: #2ecc71;
    }
    .paid-tag {
      background-color: #fbe9e7;
      color: #e74c3c;
    }
    .availability-history {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .usage-history {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .usage-history h2 {
      margin-bottom: 20px;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: space-between;
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
    .bar.low {
      background-color: #2ecc71;
    }
    .bar.moderate {
      background-color: #f1c40f;
    }
    .bar.busy {
      background-color: #e74c3c;
    }
    .usage-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    .stat-card {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      text-align: center;
    }
    .stat-value {
      font-size: 1.8em;
      font-weight: 600;
      color: #2ecc71;
      margin-bottom: 5px;
    }
    .stat-label {
      color: #666;
      font-size: 0.9em;
    }
    .usage-chart {
      margin-top: 20px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .day-bar {
      display: flex;
      align-items: center;
      margin: 10px 0;
    }
    .day-label {
      width: 100px;
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
  `;

  const content = `
    <div class="station-details">
      <div class="station-header">
        <h1 class="station-name">${station.name}</h1>
        <div class="header-actions">
          <a href="/station/${station.station_id}/live" class="status-link ${
    availability[0]?.plug_status === "Available"
      ? "available"
      : availability[0]?.plug_status === "Charging"
      ? "charging"
      : "unknown"
  }">View Live Status</a>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Address</div>
          <div class="info-value">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${
              station.latitude
            },${station.longitude}" 
              target="_blank" 
              rel="noopener noreferrer">
              ${station.address}
            </a>
          </div>
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
            .reduce((sum, status) => sum + status.duration, 0);

          // Calculate total sessions and activity level
          const chargingSessions = last7Days.filter(
            (status) => status.plug_status === "Charging"
          ).length;

          let activityLevel;
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
              hourCounts[hour] += status.duration;
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
                    (sum, status) => sum + status.duration,
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
            const day = new Date(status.timestamp).toLocaleDateString("en-US", {
              weekday: "long",
            });
            const isValidDay = (d: string): d is keyof typeof dayUsage => {
              return d in dayUsage;
            };
            if (isValidDay(day)) {
              dayUsage[day] += status.duration;
            }
          });

          // Determine activity level based on total sessions
          let activityLevel;
          if (chargingSessions.length < 70) {
            activityLevel = "low";
          } else if (chargingSessions.length <= 150) {
            activityLevel = "moderate";
          } else {
            activityLevel = "busy";
          }

          // Find maximum usage for scaling
          const maxUsage = Math.max(...Object.values(dayUsage));

          return Object.entries(dayUsage)
            .map(([day, minutes]) => {
              const percentage = maxUsage > 0 ? (minutes / maxUsage) * 100 : 0;
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
              if (row.duration < 5 && !isFirstRow) return false; // Skip rows with duration < 5 except the first
              rowCount++; // Increment row count for included rows
              isFirstRow = false; // Set isFirstRow to false after the first iteration
              return true; // Include the row
            });

            // Generate table rows
            filteredRows.forEach((row) => {
              const rowColor =
                row.plug_status?.trim() === "Available"
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
                  <td>${row.plug_status || ""}</td>
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
  `;

  return wrapInLayout(content, station.name, "station", detailedStyles);
};
