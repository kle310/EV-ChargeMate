const express = require("express");
const https = require("https");
const fs = require("fs");
const apiRoutes = require("./routes/apiRoutes");
const stationRoutes = require("./routes/stationRoutes");
const generateHomePage = require("./views/homeView");
const beta = require("./views/homeViewBeta");

const app = express();

app.get("/", (req, res) => {
  res.send(generateHomePage());
});

app.get("/beta", (req, res) => {
  res.send(beta());
});

// Static files and routes
app.use(express.static("public"));
app.use("/api", apiRoutes);
app.use("/", stationRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
