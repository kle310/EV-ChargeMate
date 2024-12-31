const {
  fetchStationAvailability,
  fetchStationData,
  fetchStationStatus,
  fetchRawData,
} = require("../models/stationModel");
const { generateStatusPage } = require("../views/statusView");
const {
  generateDetailedPage,
  generateTable,
} = require("../views/detailedView");

const handleRequest = async (req, res, fetchFunction, responseHandler) => {
  try {
    const { station_id } = req.params; // Extract station_id from the URL

    // Handle favicon.ico requests
    if (station_id === "favicon.ico") {
      return res.status(204).send(); // Respond with "No Content" for favicon.ico
    }

    if (!station_id) {
      return res.status(400).send("Missing station_id in URL");
    }

    const data = await fetchFunction(station_id);
    responseHandler(res, data, station_id);
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getStatus = (req, res) => {
  handleRequest(req, res, fetchStationStatus, (res, data) => res.json(data));
};

const getStatusPage = (req, res) => {
  handleRequest(req, res, fetchStationStatus, (res, rows, station_id) => {
    let status = 0;
    if (rows.length) {
      const latest = rows[0];
      if (["Charging", "Available"].includes(latest.ocpp_status_1)) {
        status = 1;
      }
    }
    res.send(generateStatusPage(status, station_id));
  });
};

const getDetailedView = async (req, res) => {
  try {
    const { station_id } = req.params; // Extract station_id from the URL
    const data = await fetchStationData(station_id); // Await the result of fetchStationAvailability
    const table = generateTable(data);
    const availability = await fetchStationAvailability(station_id);
    const page = generateDetailedPage(availability, table);
    res.send(page);
  } catch (error) {
    res.status(500).send("Error fetching station data");
  }
};

module.exports = {
  getStatus,
  getStatusPage,
  getDetailedView,
};
