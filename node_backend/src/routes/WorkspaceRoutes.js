import { Router } from "express";

import WorkspaceController from "../controllers/WorkspaceController.js";

import AuthMiddleware from "../middleware/AuthMiddleware.js";
import ValidationMiddleware from "../middleware/ValidationMiddleware.js";

import {
  createWorkspaceValidator,
  updateWorkspaceValidator,
} from "../validators/WorkspaceValidator.js";

const router = Router();

// Create Workspace
router.post(
  "/",
  AuthMiddleware,
  createWorkspaceValidator,
  ValidationMiddleware,
  WorkspaceController.createWorkspace
);

// Get All Workspaces
router.get(
  "/",
  AuthMiddleware,
  WorkspaceController.getAllWorkspaces
);

// Get Workspace By ID
router.get(
  "/:id",
  AuthMiddleware,
  WorkspaceController.getWorkspaceById
);

// Update Workspace
router.put(
  "/:id",
  AuthMiddleware,
  updateWorkspaceValidator,
  ValidationMiddleware,
  WorkspaceController.updateWorkspace
);

// Delete Workspace (Soft Delete)
router.delete(
  "/:id",
  AuthMiddleware,
  WorkspaceController.deleteWorkspace
);

export default router;