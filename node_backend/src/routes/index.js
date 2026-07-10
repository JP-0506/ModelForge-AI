import { Router } from "express";
import AuthRoutes from "./AuthRoutes.js";
import UserRoutes from "./UserRoutes.js";
import WorkspaceRoutes from "./WorkspaceRoutes.js";
import ProjectRoutes from "./ProjectRoutes.js";
import DatasetRoutes from "./DatasetRoutes.js";

const router = Router();

// Health Check Route
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ModelForge AI API Running Successfully 🚀",
  });
});

// Authentication Routes
router.use("/api/auth", AuthRoutes);

// User Routes
router.use("/api/users", UserRoutes);

// Workspace Routes
router.use("/api/workspaces", WorkspaceRoutes);

// Project Routes
router.use("/api/projects", ProjectRoutes);

router.use("/api/datasets", DatasetRoutes);

export default router;