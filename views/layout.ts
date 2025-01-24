const commonStyles = `
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
  }
  .nav-container {
    background-color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
  }
  .header {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    padding: 10px 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .logo-title {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .logo {
    max-width: 100px;
    height: auto;
  }
  h1 {
    color: #333;
    text-align: left;
    font-size: 2.5em;
    margin: 0;
    font-weight: bold;
  }
  .nav-menu {
    display: flex;
    gap: 30px;
    align-items: center;
  }
  .nav-link {
    color: #333;
    text-decoration: none;
    font-size: 1.1em;
    padding: 5px 10px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  .nav-link:hover {
    background-color: #f5f5f5;
    color: #2ecc71;
  }
  .nav-link.active {
    color: #2ecc71;
    font-weight: bold;
  }
  .content {
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 20px;
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
