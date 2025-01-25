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
  excludePricing: false,
});

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
      data.data.latitude,
      data.data.longitude,
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
      data.data.latitude,
      data.data.longitude,
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
  const query = `
    INSERT INTO stations (
      station_id, 
      name,
      address, 
      city, 
      max_electric_power, 
      multi_port_charging_allowed, 
      price_per_kwh,
      latitude,
      longitude
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (station_id) 
    DO UPDATE SET
      name = EXCLUDED.name,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      max_electric_power = EXCLUDED.max_electric_power,
      multi_port_charging_allowed = EXCLUDED.multi_port_charging_allowed,
      price_per_kwh = EXCLUDED.price_per_kwh,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      updated_at = CURRENT_TIMESTAMP
  `;
  await client.query(query, values);
}

// Get stations from database
async function getStationsFromDB(client) {
  try {
    const query = "SELECT station_id FROM stations";
    const result = await client.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error fetching stations from database:", error);
    throw error;
  }
}

// Process stations from a list
async function processStationList(client, stationList, source = "api") {
  for (const station of stationList) {
    const stationId = source === "api" ? station.id : station.station_id;
    console.log(`Processing station ${stationId} from ${source}`);

    if (source === "api") {
      await fetchEVSEData(client, stationId);
    } else {
      await processStation(client, stationId);
    }
  }
}

// Main function to manage the database connection
async function main(source = "api") {
  const client = new Client(PG_CONFIG);

  try {
    await client.connect();

    if (source === "api") {
      // Get stations from Shell API
      const searchData = await fetchSearchData(client);
      await processStationList(client, searchData.data, "api");
    } else if (source === "db") {
      // Get stations from database
      const stations = await getStationsFromDB(client);
      await processStationList(client, stations, "db");
    } else {
      throw new Error('Invalid source specified. Use "api" or "db"');
    }
  } catch (error) {
    console.error("Error in main process:", error);
  } finally {
    await client.end();
  }
}

// Export the main function to be called with different sources
module.exports = { main };

// If running directly (not imported as a module)
if (require.main === module) {
  // Default to API source when run directly
  main("db");
}
