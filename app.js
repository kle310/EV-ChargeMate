const express = require("express");
const path = require("path");
const apiRoutes = require("./routes/apiRoutes");
const stationRoutes = require("./routes/stationRoutes");
const generateHomePage = require("./views/homeView");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use("/api", apiRoutes);
app.use("/", stationRoutes);

app.get("/", (req, res) => {
  res.send(generateHomePage());
});

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
