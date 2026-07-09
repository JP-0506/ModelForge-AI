import { body } from "express-validator";

// Update Profile Validator
export const updateProfileValidator = [
  body("fullName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name cannot be empty."),

  body("phone")
    .optional()
    .trim(),

  body("bio")
    .optional()
    .trim(),

  body("profile_image")
    .optional()
    .trim(),
];

// Change Password Validator
export const changePasswordValidator = [
  body("currentPassword")
    .trim()
    .notEmpty()
    .withMessage("Current password is required."),

  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required.")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long."),
];