import { Router } from "express";

import AuthController from "../controllers/AuthController.js";

import {
  registerValidator,
  loginValidator,
} from "../validators/AuthValidator.js";

import ValidationMiddleware from "../middleware/ValidationMiddleware.js";

const router = Router();

// Register
router.post(
  "/register",
  registerValidator,
  ValidationMiddleware,
  AuthController.register
);

// Login
router.post(
  "/login",
  loginValidator,
  ValidationMiddleware,
  AuthController.login
);

export default router;