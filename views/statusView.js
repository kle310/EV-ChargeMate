const generateStatusPage = (status, station_id) => {
  const backgroundColor = status > 0 ? "green" : "red";
  const condition = Math.abs(status);

  return `

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${station_id} Status</title>
  <!-- Google Tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-NQVYSLJQ1W"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag('js', new Date());
            gtag('config', 'G-NQVYSLJQ1W');
        </script>
  <style>
    body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: ${backgroundColor};
      color: white;
      font-family: Arial, sans-serif;
    }
    .status {
      font-size: 10rem;
      font-weight: bold;
      text-decoration: none;
      color: inherit;
    }
    a {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      text-decoration: none;
      color: inherit;
    }
  </style>
</head>
<body>
  <a href="/${station_id}/detailed">
    <div class="status" id="statusNumber">${condition}</div>
  </a>
  <script>
    async function updateStatus() {
      try {
        const response = await fetch('/api/${station_id}/status');
        const data = await response.json();
        let condition = data.status;
        const backgroundColor = condition > 0 ? 'green' : 'red';
        condition = Math.abs(condition);
        document.body.style.backgroundColor = backgroundColor;
        document.getElementById('statusNumber').textContent = condition;
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    }
    setInterval(updateStatus, 30000);
    updateStatus();
  </script>
</body>
</html>

  `;
};

module.exports = { generateStatusPage };
