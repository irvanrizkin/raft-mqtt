import { Router } from "express";
import { MeasurementController } from "../controllers/MeasurementController";

const measurementController = new MeasurementController();

export const measurementRouter = Router();

measurementRouter.get('/:id', measurementController.listByPeriod);
