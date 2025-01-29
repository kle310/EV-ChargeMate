import { Request, Response } from "express";
import { StationModel } from "../models/stationModel";
import { Pool } from "pg";
import { AppError, catchAsync } from "../middleware/errorHandler";
import { Station, StationStatus } from "../types/types";

export class StationController {
  private stationModel: StationModel;
  private pool: Pool;

  constructor(stationModel: StationModel, pool: Pool) {
    this.stationModel = stationModel;
    this.pool = pool;
  }

  getStatus = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const stationId = req.query.station_id
      ? decodeURIComponent(req.query.station_id as string)
      : undefined;
    const city = req.query.city
      ? decodeURIComponent(req.query.city as string).replace(/_/g, " ")
      : undefined;

    if (!stationId && !city) {
      throw new AppError("Missing station_id or city in URL", 400);
    }

    if (city) {
      const stationStatuses = await this.stationModel.fetchStationStatusByCity(
        city
      );
      res.status(200).json({
        status: "success",
        data: stationStatuses,
      });
      return;
    }

    const status = await this.stationModel.fetchStationStatus(stationId!);
    res.status(200).json({
      status: "success",
      data: status,
    });
  });

  getStations = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const stations = await this.stationModel.getStations();
      res.status(200).json({
        status: "success",
        data: stations,
      });
    }
  );

  // Non-API method for internal use (like views)
  async fetchStationsForMap(region?: string): Promise<Station[]> {
    try {
      const stations = await this.stationModel.getStations(region);
      return stations;
    } catch (error) {
      console.error("Error fetching stations for map:", error);
      throw error;
    }
  }

  async getAllStations(): Promise<Station[]> {
    const result = await this.pool.query("SELECT * FROM stations");
    return result.rows;
  }

  async getStationById(stationId: string): Promise<Station | null> {
    const result = await this.pool.query(
      "SELECT * FROM stations WHERE station_id = $1",
      [stationId]
    );
    return result.rows[0] || null;
  }

  async getStationAvailabilityHistory(
    stationId: string
  ): Promise<StationStatus[]> {
    const status = await this.stationModel.fetchStationAvailability(stationId);
    return status;
  }

  async getStationStatus(stationId: string): Promise<StationStatus | null> {
    const result = await this.pool.query(
      "SELECT * FROM station_status WHERE station_id = $1 ORDER BY timestamp DESC LIMIT 1",
      [stationId]
    );
    return result.rows[0] || null;
  }

  async getFreeChargers(): Promise<Station[]> {
    const result = await this.pool.query(
      "SELECT * FROM stations WHERE price_per_kwh = 0"
    );
    return result.rows;
  }

  async getPaidChargers(): Promise<Station[]> {
    const result = await this.pool.query(
      "SELECT * FROM stations WHERE price_per_kwh > 0"
    );
    return result.rows;
  }
}
