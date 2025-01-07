const express = require("express");
const {
  getStatus,
  getStations,
  getCities,
} = require("../controllers/stationController");

const router = express.Router();

router.get("/:station_id/status", getStatus);
router.get("/stations", getStations);
router.get("/cities", getCities);

module.exports = router;
