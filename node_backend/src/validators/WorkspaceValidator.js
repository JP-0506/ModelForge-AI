import { body } from "express-validator";

// Create Workspace Validator
export const createWorkspaceValidator = [
  body("workspace_name")
    .trim()
    .notEmpty()
    .withMessage("Workspace name is required.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Workspace name must be between 3 and 100 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
];

// Update Workspace Validator
export const updateWorkspaceValidator = [
  body("workspace_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Workspace name cannot be empty.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Workspace name must be between 3 and 100 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
];