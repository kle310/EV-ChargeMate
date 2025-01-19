import { Request, Response } from "express";
import { StationModel } from "../models/stationModel";
import { Pool } from "pg";
import { AppError, catchAsync } from "../middleware/errorHandler";
import { Station, StationStatus } from "../types";

export class StationController {
  private stationModel: StationModel;
  private pool: Pool;

  constructor(stationModel: StationModel, pool: Pool) {
    this.stationModel = stationModel;
    this.pool = pool;
  }

  private handleRequest = catchAsync(
    async (
      req: Request,
      res: Response,
      fetchFunction: (stationId: string) => Promise<any>,
      responseHandler: (res: Response, data: any, stationId: string) => void
    ): Promise<void> => {
      const { station_id } = req.params;

      if (station_id === "favicon.ico") {
        res.status(204).send();
        return;
      }

      if (!station_id) {
        throw new AppError("Missing station_id in URL", 400);
      }

      const data = await fetchFunction(station_id);
      responseHandler(res, data, station_id);
    }
  );

  getStatus = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { station_id } = req.params;

    if (station_id === "favicon.ico") {
      res.status(204).send();
      return;
    }

    if (!station_id) {
      throw new AppError("Missing station_id in URL", 400);
    }

    const status = await this.stationModel.fetchStationStatus(station_id);
    if (!status) {
      throw new AppError("Station not found", 404);
    }

    res.json(status);
  });

  getStations = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const stations = await this.stationModel.getStations();
    res.status(200).json({
      status: 'success',
      data: stations
    });
  });

  // Non-API method for internal use (like views)
  async fetchStationsForMap(): Promise<Station[]> {
    return this.stationModel.getStations();
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
