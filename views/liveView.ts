import { wrapInLayout } from "./layout";
import { StationStatus } from "../types/types";

export const generateStatusPage = (
  status: StationStatus,
  stationId: string
): string => {
  const getStatusStyle = (
    statusType: string
  ): { bg: string; color: string } => {
    switch (statusType.toLowerCase()) {
      case "available":
        return {
          bg: "#e8f5e9",
          color: "#2ecc71",
        };
      case "charging":
        return {
          bg: "#fee8e7",
          color: "#e74c3c",
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
    .status-container {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      min-height: calc(100vh - 100px);
      margin: 0;
      background-color: white;
      padding: 200px 10px;
    }
    .status-box {
      background-color: ${backgroundColor};
      width: 100%;
      max-width: 800px;
      border-radius: 8px;
      padding: 30px 20px;
      text-align: center;
      transition: all 0.3s ease;
    }
    .status-type {
      font-size: 2em;
      color: ${textColor};
      margin-bottom: 10px;
      font-weight: 600;
    }
    .status-value {
      font-size: 30em;
      line-height: 1;
      font-weight: bold;
      color: ${textColor};
      margin: 20px 0;
    }
    .status-label {
      font-size: 1.4em;
      color: #666;
      margin-bottom: 10px;
    }
    .back-link {
      display: inline-block;
      margin-top: 30px;
      color: #666;
      text-decoration: none;
      font-size: 1.2em;
      padding: 10px;
    }
    .back-link:hover {
      color: #333;
    }
    @media (max-width: 768px) {
      .status-container {
        min-height: calc(100vh - 80px);
      }
      .status-box {
        padding: 40px 20px;
      }
      .status-type {
        font-size: 2.5em;
      }
      .status-value {
        font-size: 10em;
      }
      .status-label {
        font-size: 1.6em;
      }
      .back-link {
        font-size: 1.4em;
        padding: 15px;
      }
    }
  `;

  const getStatusText = (statusType: string): string => {
    switch (statusType.toLowerCase()) {
      case "available":
        return "Available";
      case "charging":
        return "In Use";
      default:
        return "Unknown Status";
    }
  };

  const content = `
  <a href="/station/${stationId}" class="back-link">← Back to Station Details</a>
    <div class="status-container">
      
      <div class="status-box">
        <div class="status-type">${getStatusText(status.plug_status)}</div>
        <div class="status-value" id="statusNumber">${status.duration}</div>
        <div class="status-label">minutes</div>
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
              case 'charging':
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
              case 'charging':
                return 'In Use';
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
