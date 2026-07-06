import { Router } from "express";
import AuthRoutes from "./AuthRoutes.js";
import UserRoutes from "./UserRoutes.js";

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
router.use("/api/users", UserRoutes);

export default router;