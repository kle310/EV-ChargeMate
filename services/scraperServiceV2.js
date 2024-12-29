require("dotenv").config();
const { Client } = require("pg");
const { CronJob } = require("cron");

// Constants
const STATIONS = [
  { id: "12585A" },
  { id: "2DWE-13" },
  { id: "2DWE-14" },
  { id: "2XZB-22" },
  { id: "2XZB-23" },
  { id: "2XZB-24" },
  { id: "2XZB-25" },
];

const PG_CONFIG = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

const API_CONFIG = {
  url: process.env.API_URL,
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

// Insert station data into the database
async function insertStationData(client, stationId, data) {
  const ports = data.data.evses?.[0]?.ports || [];
  const ccsPorts = ports
    .filter((port) => port.plugType === "CCS")
    .map((port) => ({
      plugType: port.plugType || null,
      portOcppStatus: port.portOcppStatus || null,
    }));

  for (const port of ccsPorts) {
    const query = `
      INSERT INTO station_status_2 (station_id, plug_type, plug_status, timestamp)
      VALUES ($1, $2, $3, $4);
    `;
    const values = [stationId, port.plugType, port.portOcppStatus, new Date()];

    try {
      await client.query(query, values);
    } catch (error) {
      console.error(`Error inserting data for station ${stationId}`, error);
    }
  }
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

// Schedule the job
const job = new CronJob(
  CRON_CONFIG.expression,
  processStations,
  null,
  true,
  CRON_CONFIG.timezone
);

console.log("Cron job started with expression:", CRON_CONFIG.expression);
