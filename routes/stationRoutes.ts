import { Router } from "express";
import { StationController } from "../controllers/stationController";

export const createStationRouter = (
  stationController: StationController
): Router => {
  const router = Router();

  router.get("/:station_id/status", stationController.getStatus);
  router.get("/status", stationController.getStatusByCity);

  return router;
};
