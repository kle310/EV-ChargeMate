const express = require("express");
const { getStatus } = require("../controllers/stationController");

const router = express.Router();

router.get("/:station_id/status", getStatus);

module.exports = router;
