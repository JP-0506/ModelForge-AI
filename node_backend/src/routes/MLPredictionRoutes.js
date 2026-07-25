import express from "express";

import MLPredictionController from "../controllers/MLPredictionController.js";

const router = express.Router();

// ==========================================
// Generate Machine Learning Prediction
// ==========================================

router.post(
    "/:deployment_id",
    (
        request,
        response,
        next,
    ) =>
        MLPredictionController.predict(
            request,
            response,
            next,
        ),
);

export default router;