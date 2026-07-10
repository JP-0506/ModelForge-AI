import { Router } from "express";

import UserController from "../controllers/UserController.js";

import AuthMiddleware from "../middleware/AuthMiddleware.js";
import ValidationMiddleware from "../middleware/ValidationMiddleware.js";

import {
  updateProfileValidator,
  changePasswordValidator,
} from "../validators/UserValidator.js";

const router = Router();

// Get Profile
router.get(
  "/profile",
  AuthMiddleware,
  UserController.getProfile
);

// Update Profile
router.put(
  "/profile",
  AuthMiddleware,
  updateProfileValidator,
  ValidationMiddleware,
  UserController.updateProfile
);

// Change Password
router.put(
  "/change-password",
  AuthMiddleware,
  changePasswordValidator,
  ValidationMiddleware,
  UserController.changePassword
);

// Delete Account (Soft Delete)
router.delete(
  "/profile",
  AuthMiddleware,
  UserController.deleteAccount
);

export default router;