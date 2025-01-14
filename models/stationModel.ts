import { Pool, QueryResult } from 'pg';
import { Station, StationStatus, StationAvailability } from '../types';
import { BaseModel } from './BaseModel';

export class StationModel extends BaseModel {
  constructor(pool: Pool) {
    super(pool);
  }

  async fetchStationStatus(station_id: string): Promise<StationStatus> {
    const query = `
      SELECT plug_status
      FROM station_status
      WHERE station_id = $1 AND 
      timestamp >= NOW() - INTERVAL '1 days'
      ORDER BY timestamp DESC;
    `;

    try {
      const { rows: filteredResults }: QueryResult<Station> = await this.pool.query(query, [station_id]);

      if (!filteredResults.length) {
        return { status: 0 };
      }

      const invalidStatuses = ["Preparing", "Finishing", "Unavailable"];
      const { plug_status } = filteredResults[0];

      // Early exit if status is invalid
      if (invalidStatuses.includes(plug_status.trim())) {
        return { status: 0 };
      }

      let progress = 0;

      // Helper to calculate progress based on status
      const calculateProgress = (status: string, adjustment: number): StationStatus => {
        for (const { plug_status } of filteredResults) {
          if (plug_status.trim() === status) {
            progress += adjustment;
          } else {
            return { status: progress };
          }
        }
        return { status: progress }; // Fallback if no early return
      };

      // Determine progress adjustment based on initial status
      const initialStatus = plug_status.trim();
      if (initialStatus === "Charging") {
        return calculateProgress("Charging", -1);
      }

      if (initialStatus === "Available") {
        return calculateProgress("Available", 1);
      }

      return { status: 0 };
    } catch (error) {
      console.error('Error in fetchStationStatus:', error);
      throw error;
    }
  }

  async fetchStationAvailability(stationId: string, interval: string = '7 days'): Promise<StationAvailability[]> {
    const query = `
      SELECT timestamp 
      FROM station_status 
      WHERE station_id = $1 
        AND timestamp > NOW() - $2::INTERVAL
        AND plug_status = 'Available'
      ORDER BY timestamp DESC
    `;

    try {
      const { rows }: QueryResult<StationAvailability> = await this.pool.query(query, [stationId, interval]);
      console.log(rows);
      return rows;
    } catch (error) {
      console.error('Error in fetchStationAvailability:', error);
      throw error;
    }
  }

  async getAllStations(): Promise<Station[]> {
    const query = `
      SELECT *
      FROM stations
      ORDER BY station_id;
    `;

    try {
      const { rows }: QueryResult<Station> = await this.pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error in getAllStations:', error);
      throw error;
    }
  }
}
