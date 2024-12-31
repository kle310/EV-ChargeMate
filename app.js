const express = require("express");
const https = require("https");
const fs = require("fs");
const apiRoutes = require("./routes/apiRoutes");
const stationRoutes = require("./routes/stationRoutes");
const generateHomePage = require("./views/homeView");

const app = express();

// SSL certificates
const privateKey = fs.readFileSync("/etc/ssl/website/private.key.pem", "utf8");
const certificate = fs.readFileSync("/etc/ssl/website/domain.cert.pem", "utf8");
// const ca = fs.readFileSync("/etc/ssl/website/ca_bundle.crt", "utf8"); // Optional, for intermediate certificates

const credentials = {
  key: privateKey,
  cert: certificate,
  // ca: ca, // Uncomment if you have an intermediate certificate
};

// Static files and routes
app.use(express.static("public"));
app.use("/api", apiRoutes);
app.use("/", stationRoutes);

app.get("/", (req, res) => {
  res.send(generateHomePage());
});

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Listen on port 443 (HTTPS)
httpsServer.listen(443, () => {
  console.log("HTTPS Server running on port 443");
});

const http = require("http");

// Create an HTTP server to redirect all traffic to HTTPS
const httpServer = http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
});

// Listen on port 80 (HTTP)
httpServer.listen(80, () => {
  console.log("HTTP Server running on port 80 and redirecting to HTTPS");
});
