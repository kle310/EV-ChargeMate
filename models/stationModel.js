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

const processDataStructure = (data) => {
  const streak = 5;
  const processDay = (dayArray) => {
    let count = 0;

    for (let i = 0; i < dayArray.length; i++) {
      if (dayArray[i] === 1) {
        count++;
        if (count >= streak) continue; // Keep 1s if at least 5 consecutive
      } else {
        if (count < streak) {
          // Flip the last `count` 1s back to 0
          for (let j = i - 1; j >= i - count; j--) {
            dayArray[j] = 0;
          }
        }
        count = 0; // Reset the counter
      }
    }

    // Handle case where the array ends with a streak of 1s less than 5
    if (count < streak) {
      for (let j = dayArray.length - 1; j >= dayArray.length - count; j--) {
        dayArray[j] = 0;
      }
    }
  };

  for (const day in data) {
    processDay(data[day]);
  }

  return data;
};

const fetchStationAvailability = async (station_id, interval = "7 days") => {
  const query = `
    SELECT timestamp 
    FROM station_status 
    WHERE station_id = $1 AND
    plug_status = 'Available' AND timestamp >= NOW() - INTERVAL '${interval}';
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

  processDataStructure(data); //massage the data to be in the format that the front end expects
  return data;
};

const fetchStationStatus = async (station_id) => {
  const query = `
    SELECT plug_status
    FROM station_status
    WHERE station_id = $1 AND 
    timestamp >= NOW() - INTERVAL '1 days'
    ORDER BY timestamp DESC;
  `;

  const { rows: filteredResults } = await pool.query(query, [station_id]);

  if (!filteredResults.length) {
    return { status: 0 };
  }

  const invalidStatuses = ["Preparing", "Finishing", "Unavailable"];
  const { plug_status } = filteredResults[0];

  // Early exit if status is invalid
  if (invalidStatuses.includes(plug_status.trim())) {
    return { status: 0 };
  }

  let progress = 0;

  // Helper to calculate progress based on status
  const calculateProgress = (status, adjustment) => {
    for (const { plug_status } of filteredResults) {
      if (plug_status.trim() === status) {
        progress += adjustment;
      } else {
        return { status: progress };
      }
    }
    return { status: progress }; // Fallback if no early return
  };

  // Determine progress adjustment based on initial status
  const initialStatus = plug_status.trim();
  if (initialStatus === "Charging") {
    return calculateProgress("Charging", -1);
  }

  if (initialStatus === "Available") {
    return calculateProgress("Available", 1);
  }

  return { status: 0 };
};

const fetchStationData = async (station_id, interval = "7 days") => {
  const query = `
    SELECT plug_type, plug_status, timestamp
    FROM station_status
    WHERE station_id = $1 AND 
    timestamp >= NOW() - INTERVAL '${interval}'
    ORDER BY timestamp ASC; -- Ascending to calculate duration correctly
  `;

  const result = await pool.query(query, [station_id]);

  const rows = result.rows;
  const mergedData = [];

  const durationFilter = 5;

  if (rows.length > 0) {
    let plug_type = rows[0].plug_type;
    let startTime = rows[0].timestamp;
    let endTime = rows[0].timestamp;
    let currentStatus = rows[0].plug_status;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.plug_status === currentStatus) {
        endTime = row.timestamp; // Extend the duration
      } else {
        // Calculate duration and push merged group with start time
        const duration = Math.round((endTime - startTime) / 60000); // Round duration
        if (duration >= durationFilter) {
          mergedData.push({
            plug_type: plug_type,
            plug_status: currentStatus,
            startTime: startTime, // Include the start time
            duration: duration,
          });
        }

        // Reset for the new group
        currentStatus = row.plug_status;
        startTime = row.timestamp;
        endTime = row.timestamp;
      }
    }

    // Calculate and push the final group with start time
    const finalDuration = Math.round((endTime - startTime) / 60000); // Round duration
    if (finalDuration >= durationFilter) {
      mergedData.push({
        plug_type: plug_type,
        plug_status: currentStatus,
        startTime: startTime, // Include the start time
        duration: finalDuration,
      });
    }
  }

  const filteredData = mergedData.filter(
    (row) => row.duration && row.duration >= durationFilter
  );

  // Reverse the merged data (so most recent groups come first)
  return filteredData.reverse();
};

module.exports = {
  fetchStationAvailability,
  fetchStationStatus,
  fetchStationData,
};
