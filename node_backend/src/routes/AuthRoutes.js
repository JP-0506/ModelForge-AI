import { Router } from "express";

import AuthController from "../controllers/AuthController.js";

import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOTPValidator,
  resetPasswordValidator,
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

// Forgot Password (Request OTP)
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  ValidationMiddleware,
  AuthController.forgotPassword
);

// Verify OTP
router.post(
  "/verify-otp",
  verifyOTPValidator,
  ValidationMiddleware,
  AuthController.verifyOTP
);

// Reset Password
router.post(
  "/reset-password",
  resetPasswordValidator,
  ValidationMiddleware,
  AuthController.resetPassword
);

export default router;