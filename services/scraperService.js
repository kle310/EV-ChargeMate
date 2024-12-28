require("dotenv").config();

const { Client } = require("pg");
const { CronJob } = require("cron");

const STATIONS = [
  {
    id: 418,
    name: "DS-28",
    address: "11107 Nebraska Ave",
  },
];

const PG_CONFIG = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

const API_URL = process.env.API_URL;
const API_HEADERS = {
  Host: process.env.API_HEADERS_HOST,
  "Content-Type": process.env.API_HEADERS_CONTENT_TYPE,
  Cookie: process.env.API_HEADERS_COOKIE,
  Accept: process.env.API_HEADERS_ACCEPT,
  "User-Agent": process.env.API_HEADERS_USER_AGENT,
  "Device-Authorization": process.env.API_HEADERS_DEVICE_AUTHORIZATION,
  "Accept-Language": process.env.API_HEADERS_ACCEPT_LANGUAGE,
  "Content-Encoding": process.env.API_HEADERS_CONTENT_ENCODING,
};

const CRON_EXPRESSION = process.env.CRON_EXPRESSION;
const CRON_TIMEZONE = process.env.CRON_TIMEZONE;

async function fetchStationData(stationId) {
  const response = await fetch(`${API_URL}${stationId}`, {
    method: "GET",
    headers: API_HEADERS,
  });

  if (!response.ok) {
    throw new Error("Network response was not ok.");
  }

  return response.json();
}

async function insertStationData(client, stationId, data) {
  const port1 = data.data.evses[0].ports[0];
  const port2 = data.data.evses[0].ports[1];

  const values = [
    stationId,
    port1.plugType,
    port1.portStatus,
    port1.portOcppStatus,
    port2.plugType,
    port2.portStatus,
    port2.portOcppStatus,
    new Date(),
  ];

  const query = `
    INSERT INTO station_status (station_id, plug_type_1, port_status_1, ocpp_status_1, plug_type_2, port_status_2, ocpp_status_2, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
  `;

  await client.query(query, values);
}

async function getStatus() {
  const client = new Client(PG_CONFIG);
  await client.connect();

  for (const station of STATIONS) {
    try {
      const data = await fetchStationData(station.id);
      await insertStationData(client, station.id, data);
    } catch (error) {
      console.error("Error fetching or inserting data", error);
    }
  }
  await client.end();
}

const job = new CronJob(
  CRON_EXPRESSION, // runs every minute (change the cron expression as needed)
  getStatus,
  null,
  true,
  CRON_TIMEZONE
);

job.start();
