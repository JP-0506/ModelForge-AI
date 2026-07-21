import { Router } from "express";
import MLTrainingController from "../controllers/MLTrainingController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";

const router = Router();

/*
    Train Machine Learning Model
*/
router.post(
    "/train",
    AuthMiddleware,
    MLTrainingController.trainModel,
);

export default router;