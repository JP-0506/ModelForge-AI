import { body } from "express-validator";

// Upload New Dataset Validator
export const uploadDatasetValidator = [
  body("project_id")
    .trim()
    .notEmpty()
    .withMessage("Project ID is required."),

  body("dataset_name")
    .trim()
    .notEmpty()
    .withMessage("Dataset name is required.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Dataset name must be between 3 and 100 characters."),
];

// Upload Dataset Version Validator
export const uploadDatasetVersionValidator = [
  body("dataset_id")
    .optional()
];