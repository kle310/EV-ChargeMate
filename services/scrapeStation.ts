import axios from 'axios';
import { Pool } from 'pg';
import { config } from '../config/api';

interface Station {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  price_per_kwh: number;
}

export class StationScraper {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async scrapeAndStore(): Promise<void> {
    try {
      const stations = await this.fetchStations();
      await this.storeStations(stations);
    } catch (error) {
      console.error('Error in scrapeAndStore:', error);
      throw error;
    }
  }

  private async fetchStations(): Promise<Station[]> {
    try {
      const response = await axios.get<Station[]>(config.stationEndpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching stations:', error);
      throw error;
    }
  }

  private async storeStations(stations: Station[]): Promise<void> {
    const query = `
      INSERT INTO stations (id, name, latitude, longitude, price_per_kwh)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) 
      DO UPDATE SET
        name = EXCLUDED.name,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        price_per_kwh = EXCLUDED.price_per_kwh
    `;

    try {
      await Promise.all(stations.map(station => 
        this.pool.query(query, [
          station.id,
          station.name,
          station.location.lat,
          station.location.lng,
          station.price_per_kwh
        ])
      ));
    } catch (error) {
      console.error('Error storing stations:', error);
      throw error;
    }
  }
}
