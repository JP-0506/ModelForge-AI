import ProjectRepository from "../repositories/ProjectRepository.js";
import TrainedModelRepository from "../repositories/TrainedModelRepository.js";
import ExperimentRepository from "../repositories/ExperimentRepository.js";
import DeploymentRepository from "../repositories/DeploymentRepository.js";

import DjangoDeploymentService from "./django/DjangoDeploymentService.js";

class MLDeploymentService {

    constructor() {
        this.projectRepository =
            ProjectRepository;

        this.trainedModelRepository =
            TrainedModelRepository;

        this.experimentRepository =
            ExperimentRepository;

        this.deploymentRepository =
            DeploymentRepository;

        this.djangoDeploymentService =
            DjangoDeploymentService;
    }

    // ===================================================
    // Get Project
    // ===================================================

    async getProject(
        projectId,
    ) {
        const project =
            await this.projectRepository.getProjectById(
                projectId,
            );

        if (!project) {
            throw new Error(
                "Project not found.",
            );
        }

        return project;
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
    // Validate Project Ownership
    // ===================================================

    async validateProjectOwnership(
        projectId,
        trainedModel,
    ) {
        const experiment =
            await this.experimentRepository.findById(
                trainedModel.experiment_id,
            );

        if (
            !experiment
        ) {
            throw new Error(
                "Experiment not found.",
            );
        }

        if (
            experiment.project_id.toString() !==
            projectId.toString()
        ) {
            throw new Error(
                "The trained model does not belong to the specified project.",
            );
        }

        return true;
    }

    // ===================================================
    // Validate Deployment
    // ===================================================

    validateDeployment(
        trainedModel,
    ) {
        // ------------------------------------------
        // Model Path Exists
        // ------------------------------------------

        if (
            !trainedModel.model_path
        ) {
            throw new Error(
                "Model path not found.",
            );
        }

        // ------------------------------------------
        // Model Status
        // ------------------------------------------

        if (
            trainedModel.status !==
            "active"
        ) {
            throw new Error(
                "Model is not available for deployment.",
            );
        }

        return true;
    }

    // ===================================================
    // Validate Model Using Django
    // ===================================================

    async deployUsingDjango(
        modelPath,
    ) {
        const response =
            await this.djangoDeploymentService.deployModel(
                {
                    model_path:
                        modelPath,
                },
            );

        if (
            !response.success
        ) {
            throw new Error(
                response.message,
            );
        }

        return response.data;
    }

    // ===================================================
    // Deploy Machine Learning Model
    // ===================================================

    async deployModel(
        deploymentData,
    ) {
        const {
            project_id,
            trained_model_id,
        } = deploymentData;

        // ==========================================
        // Get Project
        // ==========================================

        await this.getProject(
            project_id,
        );

        // ==========================================
        // Get Trained Model
        // ==========================================

        const trainedModel =
            await this.getTrainedModel(
                trained_model_id,
            );

        // ==========================================
        // Validate Project Ownership
        // ==========================================

        await this.validateProjectOwnership(
            project_id,
            trainedModel,
        );

        // ==========================================
        // Validate Deployment
        // ==========================================

        this.validateDeployment(
            trainedModel,
        );

        // ==========================================
        // Check Existing Deployment
        // ==========================================

        const existingDeployment =
            await this.deploymentRepository.findActiveDeploymentByModelId(
                trained_model_id,
            );

        if (
            existingDeployment
        ) {
            throw new Error(
                "Model is already deployed.",
            );
        }

        // ==========================================
        // Validate Model Using Django
        // ==========================================

        await this.deployUsingDjango(
            trainedModel.model_path,
        );

        // ==========================================
        // Create Deployment Record
        // ==========================================

        const deployment =
            await this.deploymentRepository.create(
                {
                    trained_model_id,
                },
            );

        return {
            deployment: {
                ...deployment.toObject(),
                trained_model_id: trainedModel,
            },
        };
    }

    // ===================================================
    // Get Deployments By Project
    // ===================================================

    async getDeploymentsByProject(projectId) {
        const experiments = await this.experimentRepository.findCompletedByProjectId(projectId);
        if (!experiments || !experiments.length) {
            return [];
        }

        const experimentIds = experiments.map((e) => e._id);
        const trainedModels = await this.trainedModelRepository.findByExperimentIds(experimentIds);
        if (!trainedModels || !trainedModels.length) {
            return [];
        }

        const trainedModelIds = trainedModels.map((m) => m._id);
        const deployments = await this.deploymentRepository.findByTrainedModelIds(trainedModelIds);

        return deployments;
    }

    // ===================================================
    // Get Deployments By Dataset
    // ===================================================

    async getDeploymentsByDataset(datasetId) {
        // Get only experiments linked to this specific dataset
        const experiments = await this.experimentRepository.findByDatasetId(datasetId);
        const completedExperiments = (experiments || []).filter(
            (e) => e.status === 'completed'
        );
        if (!completedExperiments.length) {
            return [];
        }

        const experimentIds = completedExperiments.map((e) => e._id);
        const trainedModels = await this.trainedModelRepository.findByExperimentIds(experimentIds);
        if (!trainedModels || !trainedModels.length) {
            return [];
        }

        const trainedModelIds = trainedModels.map((m) => m._id);
        const deployments = await this.deploymentRepository.findByTrainedModelIds(trainedModelIds);

        return deployments;
    }

    // ===================================================
    // Soft Delete Deployment
    // ===================================================

    async deleteDeployment(deploymentId) {
        const deployment = await this.deploymentRepository.findById(deploymentId);
        if (!deployment) {
            throw new Error("Deployment not found.");
        }

        await this.deploymentRepository.softDelete(deploymentId);

        if (deployment.trained_model_id) {
            const modelId = deployment.trained_model_id._id || deployment.trained_model_id;
            await this.trainedModelRepository.update(
                modelId,
                { deployment_status: "not_deployed" }
            );
        }

        return {
            success: true,
            message: "Deployment deleted successfully.",
        };
    }
}

export default new MLDeploymentService();
