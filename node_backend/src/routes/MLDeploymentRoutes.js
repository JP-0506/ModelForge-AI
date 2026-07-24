import express from "express";

import MLDeploymentController from "../controllers/MLDeploymentController.js";

const router = express.Router();

// ==========================================
// Deploy Machine Learning Model
// ==========================================

router.post("/", (request, response, next) =>
    
    MLDeploymentController.deployModel(
        request,
        response,
        next,
    ),

);

export default router;