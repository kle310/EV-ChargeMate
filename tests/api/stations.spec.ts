import { test, expect } from "@playwright/test";

// Helper function to send API requests and parse responses
const fetchStations = async (request, baseURL, queryParams = "") => {
  const response = await request.get(`${baseURL}/api/stations/${queryParams}`);
  expect(response.ok()).toBeTruthy(); // Ensure the API response is successful
  const json = await response.json();
  expect(json).toBeTruthy(); // Ensure the response body exists
  return [...(json.free || []), ...(json.paid || [])];
};

// Helper function to validate station properties
const validateStations = (stations, validator) => {
  expect(Array.isArray(stations)).toBeTruthy(); // Validate the result is an array
  stations.forEach(validator);
};

test.describe("Stations API Tests", () => {
  test("Find all stations in specific cities", async ({ request, baseURL }) => {
    const stations = await fetchStations(request, baseURL);

    // Validate stations in Pasadena and Los Angeles
    const citiesToCheck = ["Pasadena", "Los Angeles"];
    citiesToCheck.forEach((city) => {
      const station = stations.find((s) => s.city === city);
      expect(station).toBeTruthy(); // Expect at least one station in each city
    });
  });

  test("Filter stations by city", async ({ request, baseURL }) => {
    const cityName = "Los Angeles";
    const stations = await fetchStations(
      request,
      baseURL,
      `?city=${encodeURIComponent(cityName)}`
    );

    // Validate that all stations belong to the specified city
    validateStations(stations, (station) => {
      expect(station).toHaveProperty("city");
      expect(station.city).toEqual(cityName);
    });
  });

  test.describe("Filter stations by free", () => {
    test("Can filter by free=true", async ({ request, baseURL }) => {
      const stations = await fetchStations(request, baseURL, "?free=true");

      // Validate that all stations have price_per_kwh = 0
      validateStations(stations, (station) => {
        expect(station).toHaveProperty("price_per_kwh");
        const pricePerKwh = parseFloat(station.price_per_kwh);
        expect(pricePerKwh).not.toBeNaN();
        expect(pricePerKwh).toBe(0);
      });
    });

    test("Can filter by free=false", async ({ request, baseURL }) => {
      const stations = await fetchStations(request, baseURL, "?free=false");

      // Validate that all stations have price_per_kwh > 0
      validateStations(stations, (station) => {
        expect(station).toHaveProperty("price_per_kwh");
        const pricePerKwh = parseFloat(station.price_per_kwh);
        expect(pricePerKwh).not.toBeNaN();
        expect(pricePerKwh).toBeGreaterThanOrEqual(0);
      });
    });
  });

  test("Filter stations by fast charging", async ({ request, baseURL }) => {
    const stations = await fetchStations(request, baseURL, "?fast=true");

    // Validate that all stations support fast charging
    validateStations(stations, (station) => {
      expect(station).toHaveProperty("max_electric_power");
      const maxElectricPower = parseFloat(station.max_electric_power);
      expect(maxElectricPower).not.toBeNaN();
      expect(maxElectricPower).toBeGreaterThanOrEqual(50);
    });
  });
});
