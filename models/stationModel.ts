import { Pool, QueryResult } from "pg";
import { Station, StationStatus } from "../types";
import { BaseModel } from "./BaseModel";

export class StationModel extends BaseModel {
  constructor(pool: Pool) {
    super(pool);
  }

  async fetchStationStatus(station_id: string): Promise<{ status: number }> {
    const query = `
    SELECT plug_status
    FROM station_status
    WHERE station_id = $1 
      AND timestamp >= NOW() - INTERVAL '1 days'
    ORDER BY timestamp DESC;
  `;

    try {
      const { rows: filteredResults }: QueryResult<StationStatus> =
        await this.pool.query(query, [station_id]);

      if (!filteredResults.length) {
        return { status: 0 };
      }

      const invalidStatuses = ["Preparing", "Finishing", "Unavailable"];
      const { plug_status: initialStatus } = filteredResults[0];

      if (invalidStatuses.includes(initialStatus.trim())) {
        return { status: 0 };
      }

      let progress = 0;
      const calculateProgress = (
        status: string,
        adjustment: number
      ): { status: number } => {
        filteredResults.forEach(({ plug_status }) => {
          if (plug_status.trim() === status) {
            progress += adjustment;
          }
        });
        return { status: progress };
      };

      if (initialStatus.trim() === "Charging") {
        return calculateProgress("Charging", -1);
      }

      if (initialStatus.trim() === "Available") {
        return calculateProgress("Available", 1);
      }

      return { status: 0 };
    } catch (error) {
      console.error(
        `Error fetching station status for station_id ${station_id}:`,
        error
      );
      throw error;
    }
  }

  async fetchStationAvailability(
    stationId: string,
    interval: string = "7 days"
  ): Promise<StationStatus[]> {
    const query = `
      SELECT timestamp 
      FROM station_status 
      WHERE station_id = $1 
        AND timestamp > NOW() - $2::INTERVAL
        AND plug_status = 'Available'
      ORDER BY timestamp DESC
    `;

    try {
      const { rows }: QueryResult<StationStatus> = await this.pool.query(
        query,
        [stationId, interval]
      );
      console.log(rows);
      return rows;
    } catch (error) {
      console.error("Error in fetchStationAvailability:", error);
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
      console.error("Error in getAllStations:", error);
      throw error;
    }
  }
}
