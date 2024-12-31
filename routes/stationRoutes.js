const express = require("express");
const {
  getStatusPage,
  getDetailedView,
} = require("../controllers/stationController");

const router = express.Router();

router.get("/:station_id", getStatusPage);
router.get("/:station_id/detailed", getDetailedView);

module.exports = router;
