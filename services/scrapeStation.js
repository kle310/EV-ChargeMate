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

const searchBody = {
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
  excludePricing: false,
};

// Fetch station data from search endpoint
async function fetchSearchData(latitude, longitude) {
  searchBody.latitude = latitude;
  searchBody.longitude = longitude;
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

async function processStation(client, station, region) {
  try {
    console.log(`Processing station ${station.id}`);

    // Skip if station name contains "test"
    if (station.name.toLowerCase().includes("test")) {
      console.log('Skipping station as name contains "test"');
      return { saved: 0 };
    }

    // Get the first EVSE and port
    if (!station.evses || station.evses.length === 0) {
      console.log("No EVSEs available");
      return { saved: 0 };
    }

    let savedCount = 0;
    for (const evse of station.evses) {
      const port = evse.ports?.[0];
      if (!port) {
        console.log(`No port data available for EVSE ${evse.evseId}`);
        continue;
      }

      // Get price information
      const priceComponent =
        port.portPrice?.priceList?.[0]?.priceComponents?.[0];
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
      if (price > 0.3) {
        console.log(
          `Skipping EVSE due to high price: $${price.toFixed(
            3
          )}/kWh (original: $${rawPrice}/${priceUnit})`
        );
        continue;
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
        region,
      ];

      await saveStationStatus(client, evse.evseId, values);
      savedCount++;
    }

    return { saved: savedCount };
  } catch (error) {
    console.error(`Error processing station ${station.id}:`, error);
    return { saved: 0 };
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
      cpo_id,
      region
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
      cpo_id = EXCLUDED.cpo_id,
      region = EXCLUDED.region
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

    let totalStationsFound = 0;
    let totalStationsSaved = 0;

    for (const region of regions) {
      console.log(`Processing region: ${region.region}`);
      const searchData = await fetchSearchData(
        region.latitude,
        region.longitude
      );
      const stations = searchData.data || [];

      console.log(`Found ${stations.length} stations in ${region.region}`);
      totalStationsFound += stations.length;

      for (const station of stations) {
        const result = await processStation(client, station, region.region);
        totalStationsSaved += result.saved;
      }

      console.log(`Processed ${stations.length} stations in ${region.region}`);
    }

    console.log("\nStation Processing Summary:");
    console.log(`Total stations found: ${totalStationsFound}`);
    console.log(`Total stations saved to database: ${totalStationsSaved}`);
    console.log("Finished processing all stations");
  } catch (error) {
    console.error("Error in main:", error);
  } finally {
    await client.end();
  }
}

// Export the main function
module.exports = { main };

// If running directly (not imported as a module)
if (require.main === module) {
  main().catch(console.error);
}
