import { body } from "express-validator";

// Create Project Validator
export const createProjectValidator = [
  body("workspace_id")
    .trim()
    .notEmpty()
    .withMessage("Workspace ID is required."),

  body("project_name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be between 3 and 100 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("problem_type")
    .trim()
    .notEmpty()
    .withMessage("Problem type is required.")
    .isIn([
      "classification",
      "regression",
      "clustering",
      "forecasting",
      "anomaly_detection",
    ])
    .withMessage("Invalid problem type."),
];

// Update Project Validator
export const updateProjectValidator = [
  body("project_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Project name cannot be empty.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be between 3 and 100 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("problem_type")
    .optional()
    .trim()
    .isIn([
      "classification",
      "regression",
      "clustering",
      "forecasting",
      "anomaly_detection",
    ])
    .withMessage("Invalid problem type."),

  body("status")
    .optional()
    .trim()
    .isIn([
      "Draft",
      "Dataset Uploaded",
      "Experiment Created",
      "Training",
      "Completed",
      "Deployed",
    ])
    .withMessage("Invalid project status."),
];