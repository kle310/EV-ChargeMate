const {
  fetchStationAvailability,
  fetchStationData,
  fetchStationStatus,
  fetchRawData,
} = require("../models/stationModel");
const { generateStatusPage } = require("../views/statusView");
const { generateAvailabilityPage } = require("../views/availabilityView");
const { generatePage, generateTable } = require("../views/stationView");

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

const getAvailability = (req, res) => {
  handleRequest(req, res, fetchStationAvailability, (res, data) =>
    res.json(data)
  );
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

const getAvailabilityPage = (req, res) => {
  handleRequest(req, res, fetchStationAvailability, (res, data) =>
    res.send(generateAvailabilityPage(data))
  );
};

const getStationData = (req, res) => {
  handleRequest(req, res, fetchRawData, (res, data) => res.json(data));
};

const getStationPage = (req, res) => {
  handleRequest(req, res, fetchStationData, (res, stationData) => {
    const { station_id } = req.params; // Extract station_id from the URL
    const table = generateTable(stationData);
    const page = generatePage(station_id, table);
    res.send(page);
  });
};

module.exports = {
  getStatus,
  getStationData,
  getAvailability,
  getStatusPage,
  getAvailabilityPage,
  getStationPage,
};
