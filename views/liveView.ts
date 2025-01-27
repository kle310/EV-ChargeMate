import { wrapInLayout } from "./layout";
import { StationStatus } from "../types/types";

export const generateStatusPage = (
  status: StationStatus,
  stationId: string
): string => {
  const getStatusStyle = (
    statusType: string
  ): { bg: string; color: string } => {
    switch (statusType?.toLowerCase()) {
      case "available":
        return {
          bg: "#e8f5e9",
          color: "#2ecc71",
        };
      case "busy":
        return {
          bg: "#fee8e7",
          color: "#e74c3c",
        };
      case "loading":
        return {
          bg: "#fef9e7",
          color: "#f1c40f",
        };
      default:
        return {
          bg: "#f5f5f5",
          color: "#95a5a6",
        };
    }
  };

  const { bg: backgroundColor, color: textColor } = getStatusStyle(
    status.plug_status
  );

  const styles = `
    .status-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #2c3e50;
      text-decoration: none;
      font-size: 1.1em;
      padding: 12px;
      margin-bottom: 16px;
      border-radius: 8px;
      transition: all 0.2s;
      width: fit-content;
      align-self: flex-start;
    }
    .back-link:hover {
      background-color: #f8f9fa;
      transform: translateX(-4px);
    }
    .status-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      text-align: center;
      margin-top: 0;
      width: 100%;
      max-width: 600px;
    }
    .status-box {
      background-color: ${backgroundColor};
      border-radius: 12px;
      padding: 40px;
      transition: all 0.3s ease;
    }
    .status-type {
      font-size: 2.4em;
      color: ${textColor};
      margin-bottom: 24px;
      font-weight: 600;
    }
    .status-value {
      font-size: 6em;
      line-height: 1;
      font-weight: bold;
      color: ${textColor};
      margin: 24px 0;
    }
    .status-label {
      font-size: 1.2em;
      color: #7f8c8d;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    @media (max-width: 768px) {
      .status-page {
        padding: 16px;
      }
      .status-container {
        padding: 0;
      }
      .status-box {
        padding: 32px 20px;
      }
      .status-type {
        font-size: 2em;
      }
      .status-value {
        font-size: 4.5em;
      }
      .status-label {
        font-size: 1em;
      }
    }
  `;

  const getStatusText = (statusType: string): string => {
    switch (statusType?.toUpperCase()) {
      case "BUSY":
        return "IN USE";
      default:
        return statusType.toUpperCase();
    }
  };

  const content = `
    <div class="status-page">
      <a href="/station/${stationId}" class="back-link">← Back to Station Details</a>
      <div class="status-container">
        <div class="status-box">
          <div class="status-type">${getStatusText(status.plug_status)}</div>
          <div class="status-value" id="statusNumber">${status.duration}</div>
          <div class="status-label">minutes</div>
        </div>
      </div>
    </div>
    <script>
      async function updateStatus() {
        try {
          const response = await fetch('/api/status/?station_id=${stationId}');
          const d = await response.json();
          const data = Array.isArray(d.data) ? d.data[0] : d.data;
          
          if (!data || !data.plug_status) {
            console.error('No valid status data received');
            return;
          }

          const getNewStyle = (statusType) => {
            if (!statusType) return { bg: '#f5f5f5', color: '#999999' };
            
            switch (statusType.toLowerCase()) {
              case 'available':
                return {
                  bg: '#e8f5e9',
                  color: '#2ecc71'
                };
              case 'busy':
                return {
                  bg: '#fee8e7',
                  color: '#e74c3c'
                };
              case 'faulted':
                return {
                  bg: '#fee8e7',
                  color: '#e74c3c'
                };
              default:
                return {
                  bg: '#f5f5f5',
                  color: '#95a5a6'
                };
            }
          };
          
          const { bg, color } = getNewStyle(data.plug_status);
          const statusBox = document.querySelector('.status-box');
          const statusType = document.querySelector('.status-type');
          const statusValue = document.querySelector('.status-value');
          
          statusBox.style.backgroundColor = bg;
          statusType.style.color = color;
          statusValue.style.color = color;
          
          statusType.textContent = (() => {
            switch (data.plug_status.toLowerCase()) {
              case 'available':
                return 'Available';
              case 'busy':
                return 'In Use';
              case 'faulted':
                return 'Faulted';
              default:
                return 'Unknown Status';
            }
          })();
          
          document.getElementById('statusNumber').textContent = data.duration.toString();
        } catch (error) {
          console.error('Error fetching status:', error);
        }
      }
      setInterval(updateStatus, 30000);
      updateStatus();
    </script>
  `;

  return wrapInLayout(content, `Station ${stationId} Status`, "status", styles);
};

export default { generateStatusPage };
