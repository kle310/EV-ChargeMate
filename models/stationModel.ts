import { Pool, QueryResult } from "pg";
import { Station, StationStatus } from "../types";
import { BaseModel } from "./BaseModel";

export class StationModel extends BaseModel {
  constructor(pool: Pool) {
    super(pool);
  }

  async fetchStationStatus(station_id: string): Promise<StationStatus> {
    const query = `
    SELECT station_id, plug_type, plug_status, timestamp
    FROM station_status
    WHERE station_id = $1 
      AND timestamp >= NOW() - INTERVAL '1 days'
    ORDER BY timestamp DESC;
  `;

    try {
      const { rows: filteredResults }: QueryResult<StationStatus> =
        await this.pool.query(query, [station_id]);

      const stationStatus: StationStatus | null = filteredResults.length
        ? filteredResults[0]
        : null;

      if (!stationStatus) {
        throw new Error(`No status found for station ${station_id}`);
      }

      // Identify the first status
      const firstStatus = stationStatus.plug_status.trim();
      let durationCount = 0;

      // Count how many consecutive rows have the same status
      for (const { plug_status } of filteredResults) {
        if (plug_status.trim() === firstStatus) {
          durationCount++;
        } else {
          break; // Stop counting when the status changes
        }
      }
      return {
        station_id: stationStatus.station_id.trim(),
        plug_type: stationStatus.plug_type.trim(),
        plug_status: firstStatus || "",
        duration: durationCount,
        timestamp: stationStatus.timestamp,
      };
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
    SELECT plug_type, plug_status, timestamp
    FROM station_status
    WHERE station_id = $1 AND 
      timestamp >= NOW() - INTERVAL '${interval}'
    ORDER BY timestamp ASC; -- Ascending to calculate duration correctly
  `;

    try {
      const result = await this.pool.query(query, [stationId]);
      const rows = result.rows;
      const mergedData: StationStatus[] = [];

      if (rows.length > 0) {
        let plugType = rows[0].plug_type;
        let startTime = rows[0].timestamp;
        let endTime = rows[0].timestamp;
        let currentStatus = rows[0].plug_status;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.plug_status === currentStatus) {
            endTime = row.timestamp; // Extend the duration
          } else {
            // Calculate duration
            const duration = Math.round(
              (endTime.getTime() - startTime.getTime()) / 60000
            ); // Duration in minutes
            if (duration >= 0) {
              mergedData.push({
                station_id: stationId,
                plug_type: plugType,
                plug_status: currentStatus,
                timestamp: startTime,
                duration: duration,
              });
            }

            // Reset for the new group
            currentStatus = row.plug_status;
            startTime = row.timestamp;
            endTime = row.timestamp;
          }
        }

        // Handle the final group
        const finalDuration = Math.round(
          (endTime.getTime() - startTime.getTime()) / 60000
        ); // Duration in minutes
        if (finalDuration >= 0) {
          mergedData.push({
            station_id: stationId,
            plug_type: plugType,
            plug_status: currentStatus,
            timestamp: startTime,
            duration: finalDuration,
          });
        }
      }

      return mergedData.reverse();
    } catch (error) {
      console.error("Error in fetchStationAvailability:", error);
      throw error;
    }
  }

  async getStations(): Promise<Station[]> {
    const query = `
      SELECT station_id, name, latitude, longitude, price_per_kwh 
      FROM stations 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `;

    try {
      const { rows } = await this.pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error fetching stations:", error);
      throw error;
    }
  }

  async getAllStations(): Promise<Station[]> {
    const query = `
      SELECT *
      FROM stations
      ORDER BY max_electric_power DESC, city, name, address;
    `;

    try {
      const { rows }: QueryResult<Station> = await this.pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error in getAllStations:", error);
      throw error;
    }
  }

  async fetchStationStatusByCity(city: string): Promise<StationStatus[]> {
    const query = `
      WITH latest_status AS (
        SELECT 
          s.station_id,
          ss.plug_type,
          ss.plug_status,
          ss.timestamp,
          ROW_NUMBER() OVER (PARTITION BY s.station_id ORDER BY ss.timestamp DESC) as rn
        FROM station_status ss
        INNER JOIN stations s ON s.station_id = ss.station_id
        WHERE LOWER(s.city) = LOWER($1)
      )
      SELECT 
        station_id,
        plug_type,
        plug_status,
        timestamp
      FROM latest_status
      WHERE rn = 1
      ORDER BY timestamp DESC;
    `;

    try {
      const { rows }: QueryResult<StationStatus> = await this.pool.query(
        query,
        [city]
      );
      return rows;
    } catch (error) {
      throw new Error(
        `Failed to fetch station status for city ${city}: ${error}`
      );
    }
  }
}
