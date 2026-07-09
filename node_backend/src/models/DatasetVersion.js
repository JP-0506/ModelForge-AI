import mongoose from "mongoose";

const datasetVersionSchema = new mongoose.Schema(
  {
    dataset_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
    },

    version_number: {
      type: Number,
      required: true,
      min: 1,
    },

    original_file_name: {
      type: String,
      required: true,
      trim: true,
    },

    stored_file_name: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // Django Generated File Paths
    // ==========================================

    original_file_path: {
      type: String,
      default: null,
      trim: true,
    },

    profiling_path: {
      type: String,
      default: null,
      trim: true,
    },

    cleaned_file_path: {
      type: String,
      default: null,
      trim: true,
    },

    feature_engineered_file_path: {
      type: String,
      default: null,
      trim: true,
    },

    eda_path: {
      type: String,
      default: null,
      trim: true,
    },

    model_file_path: {
      type: String,
      default: null,
      trim: true,
    },

    // ==========================================
    // File Information
    // ==========================================

    file_type: {
      type: String,
      required: true,
    },

    file_size: {
      type: Number,
      required: true,
    },

    // ==========================================
    // Original Dataset Statistics
    // ==========================================

    original_rows: {
      type: Number,
      default: null,
    },

    original_columns: {
      type: Number,
      default: null,
    },

    // ==========================================
    // Cleaned Dataset Statistics
    // ==========================================

    cleaned_rows: {
      type: Number,
      default: null,
    },

    cleaned_columns: {
      type: Number,
      default: null,
    },

    // ==========================================
    // Feature Engineered Dataset Statistics
    // ==========================================

    feature_engineered_rows: {
      type: Number,
      default: null,
    },

    feature_engineered_columns: {
      type: Number,
      default: null,
    },

    // ==========================================
    // Model Information (Future)
    // ==========================================

    trained_model_name: {
      type: String,
      default: null,
      trim: true,
    },

    target_column: {
      type: String,
      default: null,
      trim: true,
    },

    processing_status: {
      type: String,
      enum: [
        "uploaded",
        "profiled",
        "cleaned",
        "feature_engineered",
        "ready_for_training",
        "trained",
        "ready_for_prediction",
      ],
      default: "uploaded",
    },

    uploaded_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const DatasetVersion = mongoose.model(
  "DatasetVersion",
  datasetVersionSchema
);

export default DatasetVersion;