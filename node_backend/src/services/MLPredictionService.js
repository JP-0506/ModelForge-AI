import DeploymentRepository from "../repositories/DeploymentRepository.js";
import TrainedModelRepository from "../repositories/TrainedModelRepository.js";
import ExperimentRepository from "../repositories/ExperimentRepository.js";
import DatasetRepository from "../repositories/DatasetRepository.js";

import DjangoPredictionService from "./django/DjangoPredictionService.js";

class MLPredictionService {

    constructor() {

        this.deploymentRepository =
            DeploymentRepository;

        this.trainedModelRepository =
            TrainedModelRepository;

        this.experimentRepository =
            ExperimentRepository;

        this.datasetRepository =
            DatasetRepository;

        this.djangoPredictionService =
            DjangoPredictionService;
    }

    // ===================================================
    // Get Deployment
    // ===================================================

    async getDeployment(
        deploymentId,
    ) {

        const deployment =
            await this.deploymentRepository.findById(
                deploymentId,
            );

        if (!deployment) {

            throw new Error(
                "Deployment not found.",
            );

        }

        return deployment;
    }

    // ===================================================
    // Validate Deployment
    // ===================================================

    validateDeployment(
        deployment,
    ) {

        if (
            deployment.status !==
            "active"
        ) {

            throw new Error(
                "Deployment is not active.",
            );

        }

        return true;
    }

    // ===================================================
    // Get Trained Model
    // ===================================================

    async getTrainedModel(
        trainedModelId,
    ) {

        const trainedModel =
            await this.trainedModelRepository.findById(
                trainedModelId,
            );

        if (!trainedModel) {

            throw new Error(
                "Trained model not found.",
            );

        }

        return trainedModel;
    }

    // ===================================================
    // Validate Trained Model
    // ===================================================

    validateTrainedModel(
        trainedModel,
    ) {

        if (
            !trainedModel.model_path
        ) {

            throw new Error(
                "Model path not found.",
            );

        }

        if (
            trainedModel.status !==
            "active"
        ) {

            throw new Error(
                "Trained model is inactive.",
            );

        }

        return true;
    }

    // ===================================================
    // Generate Prediction
    // ===================================================

    async predict(
        deploymentId,
        features,
    ) {

        // ==========================================
        // Get Deployment
        // ==========================================

        const deployment =
            await this.getDeployment(
                deploymentId,
            );

        // ==========================================
        // Validate Deployment
        // ==========================================

        this.validateDeployment(
            deployment,
        );

        // ==========================================
        // Get Trained Model
        // ==========================================

        const trainedModel =
            await this.getTrainedModel(
                deployment.trained_model_id,
            );

        // ==========================================
        // Validate Trained Model
        // ==========================================

        this.validateTrainedModel(
            trainedModel,
        );

        // ==========================================
        // Get Experiment
        // ==========================================

        const experiment =
            await this.experimentRepository.findById(
                trainedModel.experiment_id,
            );

        if (!experiment) {

            throw new Error(
                "Experiment not found.",
            );

        }

        // ==========================================
        // Get Dataset Version
        // ==========================================

        const datasetVersion =
            await this.datasetRepository.getDatasetVersionById(
                experiment.dataset_version_id,
            );

        if (!datasetVersion) {

            throw new Error(
                "Dataset version not found.",
            );

        }

        const featureMetadataPath = datasetVersion?.feature_metadata_path || null;

        // ==========================================
        // Generate Prediction Using Django
        // ==========================================

        const prediction =
            await this.djangoPredictionService.predict(
                {
                    model_path:
                        trainedModel.model_path,

                    feature_metadata_path:
                        featureMetadataPath,

                    features,
                },
            );

        // ==========================================
        // Return Prediction
        // ==========================================

        return prediction;
    }
}

export default new MLPredictionService();