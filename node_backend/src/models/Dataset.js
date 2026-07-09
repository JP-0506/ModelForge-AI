import mongoose from "mongoose";

const datasetSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    dataset_name: {
      type: String,
      required: true,
      trim: true,
    },

    current_version: {
      type: Number,
      default: 1,
      min: 1,
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

const Dataset = mongoose.model("Dataset", datasetSchema);

export default Dataset;