import { test, expect } from "@playwright/test";
import type { APIRequestContext } from '@playwright/test';

interface Station {
  city: string;
  price_per_kwh: number;
  [key: string]: any;
}

interface StationsResponse {
  free: Station[];
  paid: Station[];
}

// Helper function to send API requests and parse responses
const fetchStations = async (
  request: APIRequestContext, 
  baseURL: string, 
  queryParams: string = ""
): Promise<Station[]> => {
  const response = await request.get(`${baseURL}/api/stations/${queryParams}`);
  expect(response.ok()).toBeTruthy(); // Ensure the API response is successful
  const json = await response.json() as StationsResponse;
  expect(json).toBeTruthy(); // Ensure the response body exists
  return [...(json.free || []), ...(json.paid || [])];
};

// Helper function to validate station properties
const validateStations = (
  stations: Station[], 
  validator: (station: Station) => void
): void => {
  expect(Array.isArray(stations)).toBeTruthy(); // Validate the result is an array
  stations.forEach(validator);
};

test.describe("Stations api tests", () => {
  test("Find all stations in specific cities", async ({ request, baseURL }) => {
    if (!baseURL) throw new Error("baseURL is required");
    const stations = await fetchStations(request, baseURL);

    // Validate stations in Pasadena and Los Angeles
    const citiesToCheck = ["Pasadena", "Los Angeles"];
    citiesToCheck.forEach((city) => {
      const station = stations.find((s) => s.city === city);
      expect(station).toBeTruthy(); // Expect at least one station in each city
    });
  });

  test("Filter stations by city", async ({ request, baseURL }) => {
    if (!baseURL) throw new Error("baseURL is required");
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
      if (!baseURL) throw new Error("baseURL is required");
      const stations = await fetchStations(request, baseURL, "?free=true");

      // Validate that all stations have price_per_kwh = 0
      validateStations(stations, (station) => {
        expect(station).toHaveProperty("price_per_kwh");
        expect(station.price_per_kwh).toBe(0);
      });
    });

    test("Can filter by free=false", async ({ request, baseURL }) => {
      if (!baseURL) throw new Error("baseURL is required");
      const stations = await fetchStations(request, baseURL, "?free=false");

      // Validate that all stations have price_per_kwh > 0
      validateStations(stations, (station) => {
        expect(station).toHaveProperty("price_per_kwh");
        expect(station.price_per_kwh).toBeGreaterThan(0);
      });
    });
  });

  test("Filter stations by fast charging", async ({ request, baseURL }) => {
    if (!baseURL) throw new Error("baseURL is required");
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
