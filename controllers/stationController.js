const {
  fetchStationAvailability,
  fetchStationData,
  fetchStationStatus,
} = require("../models/stationModel");
const { generateStatusPage } = require("../views/statusView");
const { generateAvailabilityPage } = require("../views/availabilityView");

const getStatusPage = async (req, res) => {
  try {
    const { station_id } = req.params; // Extract station_id from the URL
    if (!station_id) {
      return res.status(400).send("Missing station_id in URL");
    }

    const rows = await fetchStationStatus(station_id); // Pass station_id to fetchStationStatus
    let status = 0;

    if (rows.length) {
      const latest = rows[0];
      if (["Charging", "Available"].includes(latest.ocpp_status_1)) {
        status = 1;
      }
    }

    res.send(generateStatusPage(status, station_id));
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getAvailabilityPage = async (req, res) => {
  const { station_id } = req.params; // Extract station_id from the URL
  const availabilityData = await fetchStationAvailability(station_id);
  const page = generateAvailabilityPage(availabilityData);
  res.send(page);
};

const getStatus = async (req, res) => {
  try {
    const { station_id } = req.params; // Extract station_id from the URL
    const data = await fetchStationStatus(station_id);
    res.json(data);
  } catch (error) {
    console.error("Error fetching available stations:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getRawStationData = async (req, res) => {
  try {
    const data = await fetchStationData();
    res.json(data);
  } catch (error) {
    console.error("Error fetching raw data:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getStatusPage,
  getStatus,
  getRawStationData,
  getAvailabilityPage,
};
