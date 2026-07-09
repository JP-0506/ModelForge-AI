import { Router } from "express";

import ProjectController from "../controllers/ProjectController.js";

import AuthMiddleware from "../middleware/AuthMiddleware.js";
import ValidationMiddleware from "../middleware/ValidationMiddleware.js";

import {
  createProjectValidator,
  updateProjectValidator,
} from "../validators/ProjectValidator.js";

const router = Router();

// Create Project
router.post(
  "/",
  AuthMiddleware,
  createProjectValidator,
  ValidationMiddleware,
  ProjectController.createProject
);

// Get All Projects by Workspace
router.get(
  "/workspace/:workspaceId",
  AuthMiddleware,
  ProjectController.getProjectsByWorkspace
);

// Get Project By ID
router.get(
  "/:id",
  AuthMiddleware,
  ProjectController.getProjectById
);

// Update Project
router.put(
  "/:id",
  AuthMiddleware,
  updateProjectValidator,
  ValidationMiddleware,
  ProjectController.updateProject
);

// Delete Project (Soft Delete)
router.delete(
  "/:id",
  AuthMiddleware,
  ProjectController.deleteProject
);

export default router;