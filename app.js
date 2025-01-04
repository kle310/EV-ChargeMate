const express = require("express");
const https = require("https");
const fs = require("fs");
const apiRoutes = require("./routes/apiRoutes");
const stationRoutes = require("./routes/stationRoutes");
const generateHomePage = require("./views/homeView");

const app = express();

// Static files and routes
app.use(express.static("public"));
app.use("/api", apiRoutes);
app.use("/", stationRoutes);

app.get("/", (req, res) => {
  res.send(generateHomePage());
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
