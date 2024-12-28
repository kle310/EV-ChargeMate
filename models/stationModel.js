const pool = require("../config/dbConfig");

const initializeDataStructure = () => ({
  Monday: Array(1440).fill(0),
  Tuesday: Array(1440).fill(0),
  Wednesday: Array(1440).fill(0),
  Thursday: Array(1440).fill(0),
  Friday: Array(1440).fill(0),
  Saturday: Array(1440).fill(0),
  Sunday: Array(1440).fill(0),
});

const fetchStationAvailability = async (station_id, interval = "7 days") => {
  const query = `
    SELECT timestamp 
    FROM station_status 
    WHERE station_id = $1 AND
    ocpp_status_1 = 'Available' AND 
    ocpp_status_2 = 'Available' AND timestamp >= NOW() - INTERVAL '${interval}';
  `;

  const result = await pool.query(query, [station_id]); // Only pass station_id as a parameter
  const data = initializeDataStructure();

  result.rows.forEach(({ timestamp }) => {
    const date = new Date(timestamp);
    const day = date.toLocaleString("en-US", { weekday: "long" });
    const minutes = date.getHours() * 60 + date.getMinutes();
    if (data[day]) {
      data[day][minutes] = 1;
    }
  });

  return data;
};

const fetchStationStatus = async (station_id) => {
  const query = `
    SELECT *
    FROM station_status
    WHERE station_id = $1 AND 
    timestamp >= NOW() - INTERVAL '1 days'
    ORDER BY timestamp DESC;
  `;

  const { rows: filteredResults } = await pool.query(query, [station_id]); // Pass station_id as an array element

  if (!filteredResults.length) {
    return { status: 0 };
  }

  const { ocpp_status_1, ocpp_status_2 } = filteredResults[0];

  // Return status 0 if either Availability1 or Availability2 is in "Preparing" or "Unknown"
  if (
    ocpp_status_1.trim() === "Preparing" ||
    ocpp_status_2.trim() === "Preparing"
  ) {
    return { status: 0 };
  }

  let row = filteredResults[0];
  let progress = 0;

  if (
    row.ocpp_status_1.trim() === "Charging" ||
    row.ocpp_status_2.trim() === "Charging"
  ) {
    for (let i = 0; i < filteredResults.length; i++) {
      let row = filteredResults[i];

      if (
        row.ocpp_status_1.trim() === "Charging" ||
        row.ocpp_status_2.trim() === "Charging"
      ) {
        progress -= 1;
      } else {
        // return progress
        return { status: progress };
      }
    }
  }

  if (
    row.ocpp_status_1.trim() === "Available" ||
    row.ocpp_status_2.trim() === "Available"
  ) {
    for (let i = 0; i < filteredResults.length; i++) {
      let row = filteredResults[i];

      if (
        row.ocpp_status_1.trim() === "Available" ||
        row.ocpp_status_2.trim() === "Available"
      ) {
        progress += 1;
      } else {
        return { status: progress };
      }
    }
  }

  return { status: 0 };
};

const fetchStationData = async (station_id, interval = "7 days") => {
  const query = `
    SELECT *
    FROM station_status
    WHERE station_id = $1 AND 
    timestamp >= NOW() - INTERVAL $2
    ORDER BY timestamp DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  fetchStationAvailability,
  fetchStationStatus,
  fetchStationData,
};
