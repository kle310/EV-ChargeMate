require("dotenv").config();
const { Client } = require("pg");
const { CronJob } = require("cron");

// Constants
const STATIONS = [{ id: "2OXV-02" }];

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

const url =
  "https://sky.shellrecharge.com/greenlots/coreapi/v4/evses/evse-details/";

// Fetch station data
async function fetchStationData(stationId) {
  try {
    const response = await fetch(`${url}${stationId}`, {
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

    const values = [
      stationId,
      data.data.name,
      data.data.address,
      data.data.city,
      ports[0].maxElectricPower,
      data.data.evses?.[0].multiPortChargingAllowed,
      data.data.evses[0].ports[0].portPrice.priceList[0].priceComponents[0]
        .price,
    ];

    console.log(values);
    // Insert status into the database
    await saveStationStatus(client, stationId, values);
  } catch (error) {
    console.error(`Error processing station ${stationId}:`, error);
  }
}

// Function to save station status to the database
async function saveStationStatus(client, stationId, values) {
  const query = `
    INSERT INTO stations (station_id, 
    name,
    address, 
    city, 
    max_electric_power, 
    multi_port_charging_allowed, 
    price_per_kwh)

    VALUES ($1, $2, $3, $4, $5, $6, $7);
  `;

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
