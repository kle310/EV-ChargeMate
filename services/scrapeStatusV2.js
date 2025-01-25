require("dotenv").config();
const { Client } = require("pg");
const { CronJob } = require("cron");

const PG_CONFIG = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const API_CONFIG = {
  search_url: process.env.SHELL_STATION_DETAILS,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:134.0) Gecko/20100101 Firefox/134.0",
    "Content-Type": "application/json",
    Cookie: process.env.API_HEADERS_COOKIE,
  },
};

const CRON_CONFIG = {
  expression: process.env.CRON_EXPRESSION,
  timezone: process.env.CRON_TIMEZONE,
};

// Search request body
const searchBody = JSON.stringify({
  latitude: 34.040428,
  longitude: -118.465899,
  radius: 100,
  limit: 1000,
  offset: 0,
  searchKey: "",
  recentSearchText: "",
  clearAllFilter: false,
  connectors: [],
  mappedCpos: ["GRL"],
  comingSoon: false,
  status: [],
  excludePricing: true,
});

// Fetch station data using search endpoint
async function fetchStationData() {
  try {
    const response = await fetch(API_CONFIG.search_url, {
      method: "POST",
      headers: API_CONFIG.headers,
      body: searchBody,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch station data: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching station data:", error);
    throw error;
  }
}

// Collect station data from search response
async function collectStationData(data) {
  const stationData = [];

  if (data && data.data) {
    for (const station of Object.values(data.data)) {
      if (station.evses && Array.isArray(station.evses)) {
        // Process all EVSEs
        for (const evse of station.evses) {
          if (evse && evse.ports && Array.isArray(evse.ports)) {
            // Single port - save as is
            if (evse.ports.length === 1) {
              const port = evse.ports[0];
              if (port) {
                stationData.push({
                  station_id: evse.evseId,
                  plug_type: port.plugType || "UNKNOWN",
                  plug_status: port.portOcppStatus || "UNKNOWN",
                  timestamp: new Date().toISOString(),
                });
              }
            }
            // Dual ports
            else if (evse.ports.length === 2) {
              if (evse.multiPortChargingAllowed === false) {
                // If multi-port charging not allowed, combine status
                const portOcppStatus =
                  ["Charging"].includes(evse.ports[0].portOcppStatus) ||
                  ["Charging"].includes(evse.ports[1].portOcppStatus)
                    ? "Charging"
                    : evse.ports[0].portOcppStatus === "Available" ||
                      evse.ports[1].portOcppStatus === "Available"
                    ? "Available"
                    : evse.ports[0].portOcppStatus;

                stationData.push({
                  station_id: evse.evseId,
                  plug_type: "DUAL",
                  plug_status: portOcppStatus,
                  timestamp: new Date().toISOString(),
                });
              } else {
                // If multi-port charging allowed, save each port separately
                const portOcppStatus =
                  ["Available"].includes(evse.ports[0].portOcppStatus) ||
                  ["Available"].includes(evse.ports[1].portOcppStatus)
                    ? "Available"
                    : evse.ports[0].portOcppStatus === "Charging" &&
                      evse.ports[1].portOcppStatus === "Charging"
                    ? "Charging"
                    : evse.ports[0].portOcppStatus;
                for (const port of evse.ports) {
                  if (port) {
                    stationData.push({
                      station_id: evse.evseId,
                      plug_type: "DUAL",
                      plug_status: port.portOcppStatus || "UNKNOWN",
                      timestamp: new Date().toISOString(),
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  console.log(`Retrieved ${stationData.length} station status from api search`);
  return stationData;
}

// Function to get existing station IDs from database
async function getExistingStationIds(client) {
  try {
    const query = "SELECT station_id FROM stations";
    const result = await client.query(query);
    return new Set(result.rows.map((row) => row.station_id));
  } catch (error) {
    console.error("Error fetching existing stations:", error);
    throw error;
  }
}

// Function to batch save station statuses to the database
async function batchSaveStationStatus(client, stationData, existingStationIds) {
  try {
    const query = `
      INSERT INTO station_status (station_id, plug_type, plug_status, timestamp)
      VALUES ($1, $2, $3, $4)
    `;

    // Filter stations that exist in the stations table
    const filteredStationData = stationData.filter((station) =>
      existingStationIds.has(station.station_id)
    );

    if (filteredStationData.length === 0) {
      console.log("No matching stations found in database");
      return;
    }

    await Promise.all(
      filteredStationData.map((station) =>
        client.query(query, [
          station.station_id,
          station.plug_type,
          station.plug_status,
          station.timestamp,
        ])
      )
    );

    console.log(`Added ${filteredStationData.length} station status records`);
  } catch (error) {
    console.error("Error saving station statuses:", error);
    throw error;
  }
}

// Main function to process stations
async function processStations() {
  const client = new Client(PG_CONFIG);
  try {
    await client.connect();
    console.log("Starting station status update...");

    // Get list of existing station IDs
    const existingStationIds = await getExistingStationIds(client);
    console.log(
      `Found ${existingStationIds.size} stations in database that needs status udpate`
    );

    // Fetch all station data at once using search endpoint
    const searchData = await fetchStationData();
    const stationData = await collectStationData(searchData);

    if (stationData.length > 0) {
      await batchSaveStationStatus(client, stationData, existingStationIds);
    } else {
      console.log("No station data to update");
    }
  } catch (error) {
    console.error("Error in processStations:", error);
  } finally {
    await client.end();
  }
}

// Cron job setup - run every minute
const job = new CronJob(
  "* * * * *", // Run every minute
  async () => {
    console.log(`Running status update job at ${new Date().toISOString()}`);
    await processStations();
  },
  null,
  true,
  "America/Los_Angeles"
);

// Start the cron job
job.start();
console.log("Status update cron job started - running every minute");
