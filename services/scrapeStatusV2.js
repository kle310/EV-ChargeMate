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
  search_url: process.env.SHELL_STATION_SEARCH,
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

const regions = [
  {
    region: "SF",
    latitude: 37.735954,
    longitude: -122.441972,
  },
  {
    region: "LA",
    latitude: 34.052234,
    longitude: -118.243685,
  },
];

// Search request body template
const searchBodyTemplate = {
  latitude: 0,
  longitude: 0,
  radius: 100,
  limit: 10000,
  offset: 0,
  searchKey: "",
  recentSearchText: "",
  clearAllFilter: false,
  connectors: [],
  mappedCpos: ["GRL", "EVC", "FL2", "CPI"],
  comingSoon: false,
  status: [],
  excludePricing: true,
};

// Fetch station data using search endpoint
async function fetchStationData(latitude, longitude) {
  const searchBody = {
    ...searchBodyTemplate,
    latitude,
    longitude,
  };

  try {
    console.log(`Fetching stations for coordinates: ${latitude}, ${longitude}`);
    const response = await fetch(API_CONFIG.search_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...API_CONFIG.headers,
      },
      body: JSON.stringify(searchBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Failed to fetch station data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Found ${data.data?.length || 0} stations from API`);
    return data;
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
                  plug_status: port.portStatus || "UNKNOWN",
                  timestamp: new Date().toISOString(),
                });
              }
            }
            // Dual ports
            else if (evse.ports.length === 2) {
              if (evse.multiPortChargingAllowed === false) {
                // If multi-port charging not allowed, combine status
                const portStatus =
                  ["Charging"].includes(evse.ports[0].portStatus) ||
                  ["Charging"].includes(evse.ports[1].portStatus)
                    ? "Charging"
                    : evse.ports[0].portStatus === "Available" ||
                      evse.ports[1].portStatus === "Available"
                    ? "Available"
                    : evse.ports[0].portStatus;

                stationData.push({
                  station_id: evse.evseId,
                  plug_type: "DUAL",
                  plug_status: portStatus,
                  timestamp: new Date().toISOString(),
                });
              } else {
                // If multi-port charging allowed, save each port separately
                const portStatus =
                  ["Available"].includes(evse.ports[0].portStatus) ||
                  ["Available"].includes(evse.ports[1].portStatus)
                    ? "Available"
                    : evse.ports[0].portStatus === "Charging" &&
                      evse.ports[1].portStatus === "Charging"
                    ? "Charging"
                    : evse.ports[0].portStatus;
                for (const port of evse.ports) {
                  if (port) {
                    stationData.push({
                      station_id: evse.evseId,
                      plug_type: "DUAL",
                      plug_status: port.portStatus || "UNKNOWN",
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
      `Found ${existingStationIds.size} stations in database that needs status update`
    );

    let totalProcessedStations = 0;
    let totalSavedStations = 0;

    // Process each region sequentially
    for (const region of regions) {
      try {
        console.log(`Processing region: ${region.region}`);
        const searchData = await fetchStationData(
          region.latitude,
          region.longitude
        );

        if (searchData.data && searchData.data.length > 0) {
          console.log(
            `Found ${searchData.data.length} stations in ${region.region}`
          );
          totalProcessedStations += searchData.data.length;

          const stationData = await collectStationData(searchData);
          if (stationData.length > 0) {
            console.log(
              `Collected ${stationData.length} valid stations in ${region.region}`
            );
            await batchSaveStationStatus(
              client,
              stationData,
              existingStationIds
            );
            totalSavedStations += stationData.length;
          }
        }
      } catch (error) {
        console.error(`Error processing region ${region.region}:`, error);
        // Continue with next region even if this one fails
      }
    }

    console.log("\nStation Processing Summary:");
    console.log(`Total stations found: ${totalProcessedStations}`);
    console.log(`Total stations saved: ${totalSavedStations}`);
    console.log("Finished processing all stations");
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
