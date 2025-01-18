require("dotenv").config();
const { Client } = require("pg");

const PG_CONFIG = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const API_CONFIG = {
  evse_url: process.env.SHELL_EVSE_DETAILS,
  station_url: process.env.SHELL_STATION_DETAILS,
  search_url: process.env.SHELL_STATION_SEARCH,
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

const body = JSON.stringify({
  latitude: 34.040394524634046,
  longitude: -118.4659293574566,
  radius: 10,
  limit: 10,
  offset: 0,
  searchKey: "",
  recentSearchText: "",
  clearAllFilter: false,
  connectors: [],
  mappedCpos: ["GRL"],
  comingSoon: false,
  status: [],
  excludePricing: false,
});
// Other configurations remain the same
// ...

// Fetch station data
async function fetchSearchData(client) {
  try {
    const response = await fetch(`${API_CONFIG.search_url}`, {
      method: "POST",
      headers: API_CONFIG.headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`Failed to search: ${response.statusText}`);
    }

    const data = await response.json();
    const list = data.data;

    for (const station of list) {
      console.log(`Station ID: ${station.id}`);
      await fetchEVSEData(client, station.id);
    }

    return data;
  } catch (error) {
    console.error(`Error searching`, error);
    throw error;
  }
}

// Fetch EVSE data
async function fetchEVSEData(client, stationId) {
  try {
    const response = await fetch(`${API_CONFIG.station_url}${stationId}`, {
      method: "GET",
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data for station ${stationId}: ${response.statusText}`
      );
    }

    const data = await response.json();
    const evses = data.data.evses;

    for (const evse of evses) {
      console.log(evse.evseId);
      await processStation(client, evse.evseId);
    }

    return data;
  } catch (error) {
    console.error(`Error fetching data for station ${stationId}`, error);
    throw error;
  }
}

// Fetch station data
async function fetchStationData(stationId) {
  try {
    const response = await fetch(`${API_CONFIG.evse_url}${stationId}`, {
      method: "GET",
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data for station ${stationId}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data for station ${stationId}`, error);
    throw error;
  }
}

async function processStation(client, evseId) {
  try {
    console.log(`Processing station ${evseId}`);
    const data = await fetchStationData(evseId);
    await insertStationData(client, evseId, data);
  } catch (error) {
    console.error(`Error processing station ${evseId}:`, error);
  }
}

async function insertStationData(client, stationId, data) {
  try {
    const ports = data.data.evses?.[0]?.ports || [];

    const fields = [
      data.data.name,
      data.data.address,
      data.data.city,
      ports[0].maxElectricPower,
      data.data.evses?.[0].multiPortChargingAllowed,
      data.data.evses[0].ports[0].portPrice.priceList[0].priceComponents[0]
        .price,
    ];

    // Check if "test" is found in any of the fields (case-insensitive)
    const containsTest = fields.some(
      (field) =>
        typeof field === "string" && field.toLowerCase().includes("test")
    );

    if (containsTest) {
      console.log('Skipping insert as "test" was found in one of the fields');
      return; // Skip the insertion if "test" is found
    }

    const price =
      data.data.evses[0].ports[0].portPrice.priceList[0].priceComponents[0]
        .price;

    if (price > 0.2) {
      console.log(price);
      return; // Skip the insertion if "test" is found
    }

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

    // console.log(values);
    // Insert status into the database
    await saveStationStatus(client, stationId, values);
  } catch (error) {
    console.error(error);
  }
}

// Function to save station status to the database
async function saveStationStatus(client, stationId, values) {
  const query = `INSERT INTO stations (station_id, 
    name,
    address, 
    city, 
    max_electric_power, 
    multi_port_charging_allowed, 
    price_per_kwh)

    VALUES ($1, $2, $3, $4, $5, $6, $7);
  ;
  `;
  await client.query(query, values);
}

// Main function to manage the database connection
async function main() {
  const client = new Client(PG_CONFIG);

  try {
    console.log("Connecting to the database...");
    await client.connect();
    console.log("Database connected");

    await fetchSearchData(client);
  } catch (error) {
    console.error("Error in main execution", error);
  } finally {
    console.log("Closing the database connection...");
    await client.end();
    console.log("Database connection closed");
  }
}

// Start the process
main();
