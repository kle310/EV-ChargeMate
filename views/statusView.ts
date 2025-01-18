import { wrapInLayout } from './layout';

interface StatusResponse {
  status: number;
}

export const generateStatusPage = (status: number, stationId: string): string => {
  const backgroundColor = status > 0 ? '#4CAF50' : status === 0 ? '#9E9E9E' : '#F44336';
  const condition = Math.abs(status);

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
      font-size: 10rem;
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
        <div class="status" id="statusNumber">${condition}</div>
      </a>
    </div>
    <script>
      async function updateStatus() {
        try {
          const response = await fetch('/station/${stationId}/status');
          const data = await response.json() as StatusResponse;
          const status = data.status;
          const backgroundColor = status > 0 ? '#4CAF50' : status === 0 ? '#9E9E9E' : '#F44336';
          const condition = Math.abs(status);
          document.querySelector('.status-container').style.backgroundColor = backgroundColor;
          document.getElementById('statusNumber').textContent = condition.toString();
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