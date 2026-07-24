import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    workspace_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    project_name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    problem_type: {
      type: String,
      required: true,
      enum: [
        "classification",
        "regression",
        "clustering",
        "forecasting",
        "anomaly_detection",
      ],
    },

    status: {
      type: String,
      default: "Draft",
      enum: [
        "Draft",
        "Dataset Uploaded",
        "Experiment Created",
        "Training",
        "Training Completed",
        "Model Compared",
        "Completed",
        "Model Deployed",
      ],
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

const Project = mongoose.model("Project", projectSchema);

export default Project;