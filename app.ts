import express from "express";
import { Pool } from "pg";
import { config } from "dotenv";
import { StationModel } from "./models/stationModel";
import { StationController } from "./controllers/stationController";
import { createStationRouter } from "./routes/stationRoutes";
import { generateHomeView } from "./views/homeView";
import { generateAboutView } from "./views/aboutView";
import { generateFavoritesView } from "./views/favoritesView";
import { generateMapView } from "./views/mapView";
import { generateDetailedView } from "./views/detailedView";
import path from "path";
import { generateStatusPage } from "./views/statusView";

config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
});

const stationModel = new StationModel(pool);
const stationController = new StationController(stationModel, pool);
const stationRouter = createStationRouter(stationController);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", stationRouter);

app.get("/", async (req, res) => {
  const stations = await stationModel.getAllStations();
  const selectedCity = req.query.city as string || 'all';

  const groupedStations = {
    free: stations.filter((station) => Number(station.price_per_kwh) === 0),
    paid: stations.filter((station) => Number(station.price_per_kwh) > 0),
  };

  res.send(generateHomeView(groupedStations, selectedCity));
});

app.get("/about", (req, res) => {
  res.send(generateAboutView());
});

app.get("/map", async (req, res) => {
  try {
    const stations = await stationController.fetchStationsForMap();
    res.send(generateMapView(stations));
  } catch (error) {
    console.error("Error fetching stations for map:", error);
    res.status(500).send("Error loading map data");
  }
});

app.get("/favorites", (req, res) => {
  res.send(generateFavoritesView());
});

app.get("/station/:id", async (req, res) => {
  try {
    const stationId = req.params.id;
    const station = await stationController.getStationById(stationId);
    const availability = await stationController.getStationAvailabilityHistory(
      stationId
    );

    if (!station) {
      res.status(404).send("Station not found");
      return;
    }
    res.send(generateDetailedView(station, availability));
  } catch (error) {
    console.error("Error fetching station details:", error);
    res.status(500).send("Error fetching station details");
  }
});

app.get("/station/:id/live", async (req, res) => {
  try {
    const stationId = req.params.id;
    const status = await stationModel.fetchStationStatus(stationId);
    res.send(generateStatusPage(status, stationId));
  } catch (error) {
    console.error("Error fetching station status:", error);
    res.status(500).send("Error fetching station status");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
