import { wrapInLayout } from './layout';
import { ProgressResponse } from '../types';

export const generateStatusPage = (status: ProgressResponse, stationId: string): string => {
  const getBackgroundColor = (statusType: string): string => {
    switch (statusType.toLowerCase()) {
      case 'available':
        return '#4CAF50';
      case 'charging':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const backgroundColor = getBackgroundColor(status.status_type);

  const styles = `
    .status-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: calc(100vh - 200px);
      margin: 20px;
      background-color: ${backgroundColor};
      border-radius: 8px;
      transition: background-color 0.3s ease;
    }
    .status {
      font-size: 25rem;
      font-weight: bold;
      color: white;
      text-decoration: none;
    }
    .status-link {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      text-decoration: none;
    }
  `;

  const content = `
    <div class="status-container">
      <a href="/station/${stationId}" class="status-link">
        <div class="status" id="statusNumber">${status.status_duration}</div>
      </a>
    </div>
    <script>
      async function updateStatus() {
        try {
          const response = await fetch('/station/${stationId}/status');
          const data = await response.json();
          const backgroundColor = (() => {
            switch (data.status_type.toLowerCase()) {
              case 'available':
                return '#4CAF50';
              case 'charging':
                return '#F44336';
              default:
                return '#9E9E9E';
            }
          })();
          document.querySelector('.status-container').style.backgroundColor = backgroundColor;
          document.getElementById('statusNumber').textContent = data.status_duration.toString();
        } catch (error) {
          console.error('Error fetching status:', error);
        }
      }
      setInterval(updateStatus, 30000);
      updateStatus();
    </script>
  `;

  return wrapInLayout(content, `Station ${stationId} Status`, 'status', styles);
};

export default { generateStatusPage };