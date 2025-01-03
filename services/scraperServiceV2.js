require("dotenv").config();
const { Client } = require("pg");
const { CronJob } = require("cron");

// Constants
const STATIONS = [
  // free fast chargers
  { id: "12585A" },
  { id: "2DWE-13" },
  { id: "2DWE-14" },
  { id: "2XZB-22" },
  { id: "2XZB-23" },
  { id: "2XZB-24" },
  { id: "2XZB-25" },
  { id: "2ZG5-01" },

  // discounted fast chargers
  { id: "153420" },
  { id: "153421" },
  { id: "153528" },
  { id: "153787" },
  { id: "15152B" },
  { id: "15157B" },
  { id: "15158B" },
  { id: "153368" },
  { id: "153370" },
  { id: "153372" },
  { id: "153376" },
  { id: "153380" },
  { id: "153384" },

  //free chargers
  { id: "245F-01" },
  { id: "245F-02" },
  { id: "2N9O-01" },
  { id: "2N9O-02" },
  { id: "2GWB-01" },
  { id: "2GWB-02" },
  { id: "24XI-01" },
  { id: "2GWB-03" },
];

const PG_CONFIG = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

const API_CONFIG = {
  url: process.env.API_URL_2,
  headers: {
    Host: process.env.API_HEADERS_HOST,
    "Content-Type": process.env.API_HEADERS_CONTENT_TYPE,
    Cookie: process.env.API_HEADERS_COOKIE,
    Accept: process.env.API_HEADERS_ACCEPT,
    "User-Agent": process.env.API_HEADERS_USER_AGENT,
    "Device-Authorization": process.env.API_HEADERS_DEVICE_AUTHORIZATION,
    "Accept-Language": process.env.API_HEADERS_ACCEPT_LANGUAGE,
    "Content-Encoding": process.env.API_HEADERS_CONTENT_ENCODING,
  },
};

const CRON_CONFIG = {
  expression: process.env.CRON_EXPRESSION,
  timezone: process.env.CRON_TIMEZONE,
};

// Fetch station data
async function fetchStationData(stationId) {
  try {
    const response = await fetch(`${API_CONFIG.url}${stationId}`, {
      method: "GET",
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data for station ${stationId}: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching data for station ${stationId}`, error);
    throw error;
  }
}

// Refactored function to insert station data into the database
async function insertStationData(client, stationId, data) {
  try {
    const ports = data.data.evses?.[0]?.ports || [];

    // Filter ports based on plug types and map them to the required format
    const ccsPorts = ports
      .filter(({ plugType }) =>
        ["CCS", "CHAdeMO", "SAEJ1772"].includes(plugType)
      )
      .map(({ plugType, portOcppStatus, portStatus }) => ({
        plugType: plugType || null,
        portOcppStatus: portOcppStatus || null,
        portStatus: portStatus || null,
      }));

    // Determine the status of the station
    const status = determinePortStatus(ccsPorts);
    // Insert status into the database
    // await saveStationStatus(client, stationId, status);
  } catch (error) {
    console.error(`Error processing station ${stationId}:`, error);
  }
}

// Function to determine the status of the station based on the ports
function determinePortStatus(evses) {
  if (evses[0].portStatus === "OFFLINE") {
    return { plugType: evses[0].plugType, portOcppStatus: "Offline" };
  }
  if (evses.length > 1) {
    const [firstPort, secondPort] = evses;

    if (["Charging", "Faulted"].includes(firstPort.portOcppStatus)) {
      return firstPort;
    }

    if (["Charging", "Faulted"].includes(secondPort.portOcppStatus)) {
      return secondPort;
    }

    if (
      firstPort.portOcppStatus === "Available" &&
      secondPort.portOcppStatus === "Available"
    ) {
      return firstPort; // Choose any available port
    }

    return firstPort; // Default to the first port
  }
  return evses[0]; // Single port or no valid ports
}

// Function to save station status to the database
async function saveStationStatus(client, stationId, status) {
  const query = `
    INSERT INTO station_status_2 (station_id, plug_type, plug_status, timestamp)
    VALUES ($1, $2, $3, $4);
  `;

  const values = [
    stationId,
    status?.plugType || null,
    status?.portOcppStatus || null,
    new Date(),
  ];

  await client.query(query, values);
}

// Fetch and store status data for all stations
async function processStations() {
  const client = new Client(PG_CONFIG);

  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected to database");

    for (const station of STATIONS) {
      try {
        console.log(`Processing station ${station.id}`);
        const data = await fetchStationData(station.id);
        await insertStationData(client, station.id, data);
      } catch (error) {
        console.error(`Error processing station ${station.id}`, error);
      }
    }
  } catch (error) {
    console.error("Error with database operations", error);
  } finally {
    await client.end();
    console.log("Database connection closed");
  }
}

processStations();

// // Schedule the job
// const job = new CronJob(
//   CRON_CONFIG.expression,
//   processStations,
//   null,
//   true,
//   CRON_CONFIG.timezone
// );

// console.log("Cron job started with expression:", CRON_CONFIG.expression);
