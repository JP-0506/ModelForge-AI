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

// ==========================================
// Get Deployments By Project
// ==========================================

router.get("/project/:projectId", (request, response, next) =>
    MLDeploymentController.getDeploymentsByProject(
        request,
        response,
        next,
    )
);

// ==========================================
// Get Deployments By Dataset
// ==========================================

router.get("/dataset/:datasetId", (request, response, next) =>
    MLDeploymentController.getDeploymentsByDataset(
        request,
        response,
        next,
    )
);

// ==========================================
// Delete Deployment (Soft Delete)
// ==========================================

router.delete("/:id", (request, response, next) =>
    MLDeploymentController.deleteDeployment(
        request,
        response,
        next,
    )
);

export default router;