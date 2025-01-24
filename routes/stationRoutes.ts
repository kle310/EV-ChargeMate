import { Router } from "express";
import { StationController } from "../controllers/stationController";

export const createStationRouter = (
  stationController: StationController
): Router => {
  const router = Router();

  router.get("/status", stationController.getStatus);

  return router;
};
