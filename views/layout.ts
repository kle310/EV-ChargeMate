const commonStyles = `
  :root {
    --primary-color: #3498db;
    --primary-light: #e3f2fd;
    --success-color: #2ecc71;
    --warning-color: #f1c40f;
    --danger-color: #e74c3c;
    --text-color: #2c3e50;
    --text-light: #7f8c8d;
    --bg-color: #f8f9fa;
    --nav-height: 64px;
    --content-width: 1200px;
    --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
    --shadow-lg: 0 8px 16px rgba(0,0,0,0.1);
    --radius-sm: 6px;
    --radius-md: 12px;
    --radius-lg: 16px;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    margin: 0;
    padding: 0;
    background-color: var(--bg-color);
    color: var(--text-color);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .nav-container {
    background-color: rgba(255, 255, 255, 0.98);
    box-shadow: var(--shadow-sm);
    position: sticky;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    height: var(--nav-height);
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    max-width: var(--content-width);
    margin: 0 auto;
    width: 100%;
    height: 100%;
  }

  .logo-title {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
  }

  .logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  .logo:hover {
    transform: scale(1.05);
  }

  h1 {
    color: var(--text-color);
    font-size: 1.5em;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .nav-menu {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .nav-link {
    color: var(--text-color);
    text-decoration: none;
    font-size: 0.95em;
    padding: 8px 16px;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
    font-weight: 500;
    position: relative;
  }

  .nav-link:hover {
    background-color: var(--primary-light);
    color: var(--primary-color);
  }

  .nav-link.active {
    color: var(--primary-color);
    background-color: var(--primary-light);
    font-weight: 600;
  }

  .nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--primary-color);
    border-radius: 2px;
  }

  .content {
    max-width: var(--content-width);
    margin: 32px auto;
    padding: 0 32px;
  }

  @media (max-width: 768px) {
    .header {
      padding: 0 20px;
    }

    h1 {
      font-size: 1.3em;
    }

    .nav-link {
      padding: 6px 12px;
      font-size: 0.9em;
    }

    .content {
      padding: 0 20px;
      margin: 24px auto;
    }
  }

  @media (max-width: 480px) {
    .header {
      padding: 0 16px;
    }

    .logo {
      width: 32px;
      height: 32px;
    }

    h1 {
      font-size: 1.2em;
    }

    .nav-link {
      padding: 6px 10px;
      font-size: 0.85em;
    }

    .content {
      padding: 0 16px;
      margin: 20px auto;
    }
  }
`;

export const generateHeader = (activePage: string): string => {
  return `
    <div class="nav-container">
      <div class="header">
        <div class="logo-title">
          <a href="/" class="logo-link">
            <img src="/images/chargemate-logo.jpeg" alt="ChargeMate Logo" class="logo">
          </a>
          <h1>EV ChargeMate</h1>
        </div>
        <nav class="nav-menu">
          <a href="/" class="nav-link${
            activePage === "home" ? " active" : ""
          }">Home</a>
          <a href="/map" class="nav-link${
            activePage === "map" ? " active" : ""
          }">Map</a>
          <a href="/chat" class="nav-link${
            activePage === "chat" ? " active" : ""
          }">Chat</a>
        </nav>
      </div>
    </div>
  `;
};

export const wrapInLayout = (
  content: string,
  title: string,
  activePage: string,
  additionalStyles: string = ""
): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="EV ChargeMate - Find and monitor electric vehicle charging stations">
        <meta name="theme-color" content="#3498db">
        
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
        
        <title>${title} - EV ChargeMate</title>
        <link rel="icon" href="/images/favicon.ico" type="image/x-icon">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        
        <style>
          ${commonStyles}
          ${additionalStyles}
        </style>
      </head>
      <body>
        ${generateHeader(activePage)}
        <main class="content">
          ${content}
        </main>
      </body>
    </html>
  `;
};
