const express = require("express");
const {
  getStatus,
  getAvailability,
  getStationData,
} = require("../controllers/stationController");

const router = express.Router();

router.get("/:station_id/status", getStatus);
router.get("/:station_id/availability", getAvailability);
router.get("/:station_id/raw", getStationData);

module.exports = router;
