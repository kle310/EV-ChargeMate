const express = require("express");
const {
  getStatus,
  getAvailability,
  getStats,
} = require("../controllers/stationController");

const router = express.Router();

router.get("/:station_id/status", getStatus);
router.get("/:station_id/availability", getAvailability);
router.get("/:station_id/stats", getStats);

module.exports = router;
