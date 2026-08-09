import mongoose from "mongoose";
import Deployment from "../models/Deployment.js";

class DeploymentRepository {

    // ==========================================
    // Create Deployment
    // ==========================================

    async create(
        deploymentData,
    ) {
        const deploymentId =
            new mongoose.Types.ObjectId();

        const deployment =
        {
            _id:
                deploymentId,

            trained_model_id:
                deploymentData.trained_model_id,

            endpoint_name:
                `prediction-${deploymentId}`,

            endpoint_url:
                `/api/ml/predict/${deploymentId}`,

            status:
                "active",

            deployed_at:
                new Date(),
        };

        return await Deployment.create(
            deployment,
        );
    }
    // ==========================================
    // Find Deployment By ID
    // ==========================================

    async findById(
        deploymentId,
    ) {
        return await Deployment.findOne(
            {
                _id: deploymentId,
                is_deleted: false,
            },
        );
    }

    // ==========================================
    // Find Active Deployment By Model ID
    // ==========================================

    async findActiveDeploymentByModelId(
        trainedModelId,
    ) {
        return await Deployment.findOne(
            {
                trained_model_id:
                    trainedModelId,

                status:
                    "active",

                is_deleted:
                    false,
            },
        );
    }

    // ==========================================
    // Update Deployment
    // ==========================================

    async update(
        deploymentId,
        updateData,
    ) {
        return await Deployment.findOneAndUpdate(
            {
                _id: deploymentId,
                is_deleted: false,
            },
            {
                ...updateData,
                updated_at: new Date(),
            },
            {
                new: true,
            },
        );
    }

    // ==========================================
    // Find Deployments By Trained Model IDs
    // ==========================================

    async findByTrainedModelIds(
        trainedModelIds,
    ) {
        return await Deployment.find(
            {
                trained_model_id: { $in: trainedModelIds },
                is_deleted: false,
            },
        )
            .populate({
                path: "trained_model_id",
                populate: { path: "experiment_id" },
            })
            .sort({ created_at: -1 });
    }

    // ==========================================
    // Soft Delete Deployment
    // ==========================================

    async softDelete(
        deploymentId,
    ) {
        return await Deployment.findOneAndUpdate(
            {
                _id: deploymentId,
                is_deleted: false,
            },
            {
                is_deleted: true,
            },
            {
                new: true,
            },
        );
    }
}

export default new DeploymentRepository();