import mongoose from "mongoose";

const trainedModelSchema = new mongoose.Schema(
  {
    experiment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experiment",
      required: true,
    },

    model_name: {
      type: String,
      required: true,
      trim: true,
    },

    model_version: {
      type: Number,
      required: true,
      default: 1,
    },

    model_path: {
      type: String,
      required: true,
      trim: true,
    },

    model_size: {
      type: Number,
      default: 0,
    },

    is_best_model: {
      type: Boolean,
      default: false,
    },
    
    status: {
      type: String,
      enum: [
        "active",
        "inactive",
      ],
      default: "active",
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

const TrainedModel = mongoose.model(
  "TrainedModel",
  trainedModelSchema,
);

export default TrainedModel;