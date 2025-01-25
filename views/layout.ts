const commonStyles = `
  :root {
    --primary-color: #2ecc71;
    --text-color: #333;
    --bg-color: #f5f5f5;
    --nav-height: 60px;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    margin: 0;
    padding: 0;
    background-color: var(--bg-color);
    color: var(--text-color);
  }

  .nav-container {
    background-color: rgba(255, 255, 255, 0.98);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    position: sticky;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    height: var(--nav-height);
    display: flex;
    align-items: center;
  }

  .header {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    padding: 0 24px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .logo-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo {
    max-width: 40px;
    height: auto;
    transition: transform 0.2s ease;
  }

  .logo:hover {
    transform: scale(1.05);
  }

  h1 {
    color: var(--text-color);
    text-align: left;
    font-size: 1.5em;
    margin: 0;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .nav-menu {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .nav-link {
    color: var(--text-color);
    text-decoration: none;
    font-size: 0.95em;
    padding: 6px 12px;
    border-radius: 6px;
    transition: all 0.2s ease;
    font-weight: 500;
  }

  .nav-link:hover {
    background-color: rgba(46, 204, 113, 0.1);
    color: var(--primary-color);
  }

  .nav-link.active {
    color: var(--primary-color);
    background-color: rgba(46, 204, 113, 0.1);
    font-weight: 600;
  }

  .content {
    max-width: 1200px;
    margin: 24px auto;
    padding: 0 24px;
  }

  @media (max-width: 768px) {
    .header {
      padding: 0 16px;
    }

    h1 {
      font-size: 1.3em;
    }

    .nav-link {
      padding: 6px 10px;
    }
  }
`;

export const generateHeader = (activePage: string): string => {
  return `
    <div class="nav-container">
      <div class="header">
        <div class="logo-title">
          <a href="/" class="logo-link">
            <img src="/images/chargemate-logo.png" alt="ChargeMate Logo" class="logo">
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
          <a href="/about" class="nav-link${
            activePage === "about" ? " active" : ""
          }">About</a>
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
    <html>
      <head>
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
        <link rel="icon" href="/public/favicon.ico" type="image/x-icon">
        <style>
          ${commonStyles}
          ${additionalStyles}
        </style>
      </head>
      <body>
        ${generateHeader(activePage)}
        <div class="content">
          ${content}
        </div>
      </body>
    </html>
  `;
};
