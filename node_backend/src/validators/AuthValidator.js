import { body } from "express-validator";

// Register Validator
export const registerValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please enter a valid email address."),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required."),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),

  body("bio")
    .optional()
    .trim(),
];

// Login Validator
export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please enter a valid email address."),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required."),
];

// Forgot Password Validator
export const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please enter a valid email address."),
];

// Verify OTP Validator
export const verifyOTPValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please enter a valid email address."),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP code is required.")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP code must be 6 digits."),
];

// Reset Password Validator
export const resetPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please enter a valid email address."),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP code is required.")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP code must be 6 digits."),

  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
];