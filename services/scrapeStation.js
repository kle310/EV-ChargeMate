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
  search_url: process.env.SHELL_STATION_SEARCH,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:134.0) Gecko/20100101 Firefox/134.0",
    "Content-Type": "application/json",
    Cookie: process.env.API_HEADERS_COOKIE,
  },
};

const searchBody = {
  latitude: 34.040428,
  longitude: -118.465899,
  radius: 100,
  limit: 10000,
  offset: 0,
  searchKey: "",
  recentSearchText: "",
  clearAllFilter: false,
  connectors: [],
  mappedCpos: ["EVC", "FL2", "GRL", "CPI"],
  comingSoon: false,
  status: [],
  excludePricing: false,
};

// Fetch station data from search endpoint
async function fetchSearchData() {
  try {
    const response = await fetch(API_CONFIG.search_url, {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify(searchBody),
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

async function processStation(client, station) {
  try {
    console.log(`Processing station ${station.id}`);

    // Skip if station name contains "test"
    if (station.name.toLowerCase().includes("test")) {
      console.log('Skipping station as name contains "test"');
      return;
    }

    // Get the first EVSE and port
    const evse = station.evses?.[0];
    if (!evse) {
      console.log("No EVSE data available");
      return;
    }

    const port = evse.ports?.[0];
    if (!port) {
      console.log("No port data available");
      return;
    }

    // Get price information
    const priceComponent = port.portPrice?.priceList?.[0]?.priceComponents?.[0];
    const rawPrice = priceComponent?.price || 0;
    const priceUnit = priceComponent?.priceUnit || "";

    // Convert hourly price to per kWh price
    // Assuming average charging session is 1 hour and average power is the port's max power
    let price = rawPrice;
    if (priceUnit === "Hourly" && port.power) {
      // Convert hourly rate to per kWh rate: hourly_price / power_in_kw
      price = rawPrice / port.power;
      console.log(
        `Converting hourly rate $${rawPrice}/hr with power ${
          port.power
        }kW to $${price.toFixed(3)}/kWh`
      );
    }

    // Skip if price per kWh is too high (likely an error or premium station)
    if (price > 0.25) {
      console.log(
        `Skipping station due to high price: $${price.toFixed(
          3
        )}/kWh (original: $${rawPrice}/${priceUnit})`
      );
      return;
    }

    // Validate and clamp numeric values
    const maxElectricPower = port.power;
    const validPrice = price;
    const validLat = parseFloat(station.latitude).toFixed(6);
    const validLon = parseFloat(station.longitude).toFixed(6);

    const values = [
      evse.evseId,
      station.name,
      station.address,
      station.city,
      maxElectricPower,
      evse.multiPortChargingAllowed || false,
      validPrice,
      validLat,
      validLon,
      "kWh", // Always store as per_kwh after conversion
      station.cpoId,
    ];

    console.log("Saving station with values:", {
      id: evse.evseId,
      power: maxElectricPower,
      originalPrice: `$${rawPrice}/${priceUnit}`,
      convertedPrice: `$${validPrice}/kWh`,
      lat: validLat,
      lon: validLon,
    });

    await saveStationStatus(client, evse.evseId, values);
  } catch (error) {
    console.error(`Error processing station ${station.id}:`, error);
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
      price,
      latitude,
      longitude,
      price_unit,
      cpo_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (station_id) 
    DO UPDATE SET
      name = EXCLUDED.name,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      max_electric_power = EXCLUDED.max_electric_power,
      multi_port_charging_allowed = EXCLUDED.multi_port_charging_allowed,
      price = EXCLUDED.price,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      updated_at = CURRENT_TIMESTAMP,
      price_unit = EXCLUDED.price_unit,
      cpo_id = EXCLUDED.cpo_id
  `;

  try {
    await client.query(query, values);
    console.log(`Successfully saved/updated station ${stationId}`);
  } catch (error) {
    console.error(`Error saving station ${stationId}:`, error);
    throw error;
  }
}

// Main function to manage the database connection
async function main() {
  const client = new Client(PG_CONFIG);

  try {
    await client.connect();
    console.log("Connected to database");

    const searchData = await fetchSearchData();
    const stations = searchData.data || [];

    console.log(`Found ${stations.length} stations`);

    for (const station of stations) {
      await processStation(client, station);
    }

    console.log("Finished processing all stations");
  } catch (error) {
    console.error("Error in main process:", error);
  } finally {
    await client.end();
    console.log("Closed database connection");
  }
}

// Export the main function
module.exports = { main };

// If running directly (not imported as a module)
if (require.main === module) {
  main().catch(console.error);
}
