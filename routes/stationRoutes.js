const express = require("express");
const {
  getStatusPage,
  getAvailabilityPage,
  getStationPage,
} = require("../controllers/stationController");

const router = express.Router();

router.get("/:station_id", getStatusPage);
router.get("/:station_id/stats", getStationPage);
router.get("/:station_id/availability", getAvailabilityPage);

module.exports = router;
