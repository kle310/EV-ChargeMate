import { Request, Response } from "express";
import { StationModel } from "../models/stationModel";
import { Pool } from "pg";
import { generateStatusPage } from "../views/statusView";
import { AppError, catchAsync } from "../middleware/errorHandler";
import { Station, StationStatus, StationAvailability } from "../types";

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

  getStatusPage = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
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

      const html = generateStatusPage({ status, station_id });
      res.send(html);
    }
  );

  getDetailedView = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { station_id } = req.params;
      const { interval = "7 days" } = req.query;

      if (!station_id) {
        throw new AppError("Missing station_id in URL", 400);
      }

      const availability = await this.stationModel.fetchStationAvailability(
        station_id,
        interval as string
      );
      if (!availability) {
        throw new AppError("Station not found", 404);
      }

      const table = generateTable(availability);
      const html = generateDetailedPage(availability, table);
      res.send(html);
    }
  );

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
  ): Promise<StationAvailability[]> {
    const result = await this.pool.query(
      "SELECT * FROM station_status WHERE station_id = $1 ORDER BY timestamp DESC LIMIT 600",
      [stationId]
    );
    return result.rows;
  }

  async getStationStatus(
    stationId: string
  ): Promise<StationAvailability | null> {
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
