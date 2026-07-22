import { Router } from "express";

import MLComparisonController from "../controllers/MLComparisonController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";

const router = Router();

//  Compare Machine Learning Models

router.post(
    "/compare",
    AuthMiddleware,
    MLComparisonController.compareModels,
);

export default router;