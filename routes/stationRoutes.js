const express = require("express");
const {
  getStatusPage,
  getAvailabilityPage,
} = require("../controllers/stationController");

const router = express.Router();

router.get("/:station_id", getStatusPage);
router.get("/:station_id/stats", getAvailabilityPage);
router.get("/:station_id/availability", getAvailabilityPage);

module.exports = router;
