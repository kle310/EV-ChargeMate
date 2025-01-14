import axios from 'axios';
import { Pool } from 'pg';
import { config } from '../config/api';

interface StationStatus {
  station_id: string;
  plug_type: string;
  plug_status: string;
}

export class StatusScraper {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async scrapeAndStore(): Promise<void> {
    try {
      const statuses = await this.fetchStatuses();
      await this.storeStatuses(statuses);
    } catch (error) {
      console.error('Error in scrapeAndStore:', error);
      throw error;
    }
  }

  private async fetchStatuses(): Promise<StationStatus[]> {
    try {
      const response = await axios.get<StationStatus[]>(config.statusEndpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching statuses:', error);
      throw error;
    }
  }

  private async storeStatuses(statuses: StationStatus[]): Promise<void> {
    const query = `
      INSERT INTO station_status (station_id, plug_type, plug_status, timestamp)
      VALUES ($1, $2, $3, NOW())
    `;

    try {
      await Promise.all(statuses.map(status =>
        this.pool.query(query, [
          status.station_id,
          status.plug_type,
          status.plug_status
        ])
      ));
    } catch (error) {
      console.error('Error storing statuses:', error);
      throw error;
    }
  }
}
