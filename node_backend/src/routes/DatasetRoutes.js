import { Router } from "express";

import DatasetController from "../controllers/DatasetController.js";

import AuthMiddleware from "../middleware/AuthMiddleware.js";
import ValidationMiddleware from "../middleware/ValidationMiddleware.js";
import upload from "../middleware/UploadMiddleware.js";

import {
  uploadDatasetValidator,
  uploadDatasetVersionValidator,
} from "../validators/DatasetValidator.js";

const router = Router();

// ===========================================
// Upload New Dataset
// ===========================================
router.post(
  "/upload",
  AuthMiddleware,
  upload.single("dataset"),
  uploadDatasetValidator,
  ValidationMiddleware,
  DatasetController.uploadDataset
);

// ==========================================
// Validate Dataset
// ==========================================

router.post(
  "/:datasetId/validation",
  AuthMiddleware,
  DatasetController.validateDataset.bind(
  DatasetController,
  ),
);

// ===========================================
// Dataset Profiling
// ===========================================
router.post(
  "/profile",
  AuthMiddleware,
  DatasetController.profileDataset
);

// ===========================================
// Dataset Cleaning
// ===========================================
router.post(
  "/clean",
  AuthMiddleware,
  DatasetController.cleanDataset
);

// ===========================================
// Feature Engineering
// ===========================================
router.post(
  "/feature-engineering",
  AuthMiddleware,
  DatasetController.featureEngineering
);

// ===========================================
// EDA
// ===========================================
router.post(
  "/eda",
  AuthMiddleware,
  DatasetController.generateEDA
);

// ===========================================
// Upload New Dataset Version
// ===========================================
router.post(
  "/:id/version",
  AuthMiddleware,
  upload.single("dataset"),
  uploadDatasetVersionValidator,
  ValidationMiddleware,
  DatasetController.uploadDatasetVersion
);

// ===========================================
// Get All Datasets by Project
// ===========================================
router.get(
  "/project/:projectId",
  AuthMiddleware,
  DatasetController.getDatasetsByProject
);

// ===========================================
// Get Dataset By ID
// ===========================================
router.get(
  "/:id",
  AuthMiddleware,
  DatasetController.getDatasetById
);

// ===========================================
// Get Dataset Version History
// ===========================================
router.get(
  "/:id/versions",
  AuthMiddleware,
  DatasetController.getDatasetVersions
);

// ===========================================
// Soft Delete Dataset
// ===========================================
router.delete(
  "/:id",
  AuthMiddleware,
  DatasetController.deleteDataset
);

export default router;