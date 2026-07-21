import mongoose from "mongoose";

const experimentSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    dataset_version_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DatasetVersion",
      required: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    experiment_name: {
      type: String,
      required: true,
      trim: true,
    },

    problem_type: {
      type: String,
      required: true,
      enum: [
        "regression",
        "classification",
        "clustering",
        "anomaly_detection",
        "time_series",
      ],
    },

    algorithm: {
      type: String,
      required: true,
      trim: true,
    },

    target_column: {
      type: String,
      default: null,
      trim: true,
    },

    parameters: {
      type: Object,
      default: {},
    },

    target_leakage: {
      type: Object,
      default: {},
    },

    cross_validation: {
      type: Object,
      default: {},
    },

    evaluation: {
      type: Object,
      default: {},
    },

    training_time: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "training",
        "completed",
        "failed",
      ],
      default: "pending",
    },

    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    versionKey: false,
  }
);

const Experiment = mongoose.model(
  "Experiment",
  experimentSchema,
);

export default Experiment;