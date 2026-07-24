import mongoose from "mongoose";

const deploymentSchema = new mongoose.Schema(
    {
        trained_model_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TrainedModel",
            required: true,
        },

        endpoint_name: {
            type: String,
            required: true,
            trim: true,
        },

        endpoint_url: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "active",
                "inactive",
                "archived",
            ],
            default: "active",
        },

        deployed_at: {
            type: Date,
            default: Date.now,
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
    },
);

const Deployment = mongoose.model(
    "Deployment",
    deploymentSchema,
);

export default Deployment;