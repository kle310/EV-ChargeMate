import { Pool, QueryResult } from "pg";
import { Station, StationStatus, ProgressResponse } from "../types";
import { BaseModel } from "./BaseModel";

export class StationModel extends BaseModel {
  constructor(pool: Pool) {
    super(pool);
  }

  async fetchStationStatus(station_id: string): Promise<ProgressResponse> {
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

      const progressResponse: ProgressResponse = {
        status_type: "",
        status_duration: 0,
      };

      if (!filteredResults.length) {
        return progressResponse;
      }

      // Identify the first status
      const firstStatus = filteredResults[0].plug_status.trim();
      let durationCount = 0;

      // Count how many consecutive rows have the same status
      for (const { plug_status } of filteredResults) {
        if (plug_status.trim() === firstStatus) {
          durationCount++;
        } else {
          break; // Stop counting when the status changes
        }
      }

      // Update the response
      progressResponse.status_type = firstStatus;
      progressResponse.status_duration = durationCount;

      return progressResponse;
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
    interval: string = "2 days"
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

  async getAllStations(): Promise<Station[]> {
    const query = `
      SELECT *
      FROM stations
      ORDER BY max_electric_power DESC, city;
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
