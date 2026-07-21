import path from "path";
import fs from "fs";

import ProjectRepository from "../repositories/ProjectRepository.js";
import DatasetRepository from "../repositories/DatasetRepository.js";
import ExperimentRepository from "../repositories/ExperimentRepository.js";
import TrainedModelRepository from "../repositories/TrainedModelRepository.js";

import DjangoTrainingService from "./django/DjangoTrainingService.js";

class MLTrainingService {
    constructor() {
        this.projectRepository = ProjectRepository;

        this.datasetRepository = DatasetRepository;

        this.experimentRepository = ExperimentRepository;

        this.trainedModelRepository = TrainedModelRepository;

        this.djangoTrainingService = DjangoTrainingService;
    }

    // ===================================================
    // Get Project
    // ===================================================

    async getProject(
        projectId,
    ) {
        const project = await this.projectRepository.getProjectById(
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
    // Get Dataset Version
    // ===================================================

    async getDatasetVersion(
        datasetVersionId,
    ) {
        const datasetVersion =
            await this.datasetRepository.getDatasetVersionById(
                datasetVersionId,
            );

        if (!datasetVersion) {
            throw new Error(
                "Dataset version not found.",
            );
        }

        return datasetVersion;
    }

    // ===================================================
    // Validate Feature Engineered Dataset
    // ===================================================

    validateTrainingDataset(
        datasetVersion,
    ) {
        if (
            !datasetVersion.feature_engineered_file_path
        ) {
            throw new Error(
                "Feature engineered dataset not found.",
            );
        }

        if (
            !fs.existsSync(
                datasetVersion.feature_engineered_file_path,
            )
        ) {
            throw new Error(
                "Feature engineered dataset file does not exist.",
            );
        }

        return true;
    }

    // ===================================================
    // Generate Model File Path
    // ===================================================

    generateModelPath(
        projectId,
        experimentId,
        algorithm,
    ) {
        const modelDirectory = path.join(
            process.env.DJANGO_MEDIA_PATH,
            "models",
            projectId.toString(),
            experimentId.toString(),
        );

        if (
            !fs.existsSync(
                modelDirectory,
            )
        ) {
            fs.mkdirSync(
                modelDirectory,
                {
                    recursive: true,
                },
            );
        }

        return path.join(
            modelDirectory,
            `${algorithm}.pkl`,
        );
    }

    // ===================================================
    // Build Django Request
    // ===================================================

    buildTrainingRequest(
        project,
        datasetVersion,
        algorithm,
        modelPath,
        target_column,
        parameters,
    ) {
        return {
            dataset_path:
                datasetVersion.feature_engineered_file_path,

            model_path:
                modelPath,

            problem_type:
                project.problem_type,

            algorithm,

            target_column,

            parameters,
        };
    }

    // ===================================================
    // Call Django Training API
    // ===================================================

    async trainModelUsingDjango(
        trainingRequest,
    ) {
        const response =
            await this.djangoTrainingService.trainModel(
                trainingRequest,
            );

        if (!response.success) {
            throw new Error(
                response.message,
            );
        }

        return response.data;
    }

    ///////////   PART 2    /////////


    // ===================================================
    // Train Machine Learning Model
    // ===================================================

    async trainModel(
        trainingData,
    ) {
        const {
            project_id,
            dataset_version_id,
            user_id,
            experiment_name,
            algorithm,
            target_column,
            parameters = {},
        } = trainingData;

        // ==========================================
        // Get Project
        // ==========================================

        const project =
            await this.getProject(
                project_id,
            );

        // ==========================================
        // Get Dataset Version
        // ==========================================

        const datasetVersion =
            await this.getDatasetVersion(
                dataset_version_id,
            );

        // ==========================================
        // Validate Dataset
        // ==========================================

        this.validateTrainingDataset(
            datasetVersion,
        );

        // ==========================================
        // Create Experiment
        // ==========================================

        const experiment =
            await this.experimentRepository.create(
                {
                    project_id,

                    dataset_version_id,

                    user_id,

                    experiment_name,

                    problem_type:
                        project.problem_type,

                    algorithm,

                    target_column,

                    parameters,

                    status: "training",
                },
            );


        // ==========================================
        // Generate Model Path
        // ==========================================

        const modelPath =
            this.generateModelPath(
                project_id,
                experiment._id,
                algorithm,
            );

        // ==========================================
        // Build Django Request
        // ==========================================

        const djangoRequest =
            this.buildTrainingRequest(
                project,
                datasetVersion,
                algorithm,
                modelPath,
                target_column,
                parameters,
            );

        // ==========================================
        // Start Training Timer
        // ==========================================

        const startTime = Date.now();

        // ==========================================
        // Call Django Training
        // ==========================================

        // const trainingResult =
        //     await this.trainModelUsingDjango(
        //         djangoRequest,
        //     );
        // ==========================================
        // Call Django Training
        // ==========================================

        let trainingResult;

        try {

            trainingResult =
                await this.trainModelUsingDjango(
                    djangoRequest,
                );

        }
        catch (error) {

            // ==========================================
            // Update Experiment Status
            // ==========================================

            await this.experimentRepository.update(
                experiment._id,
                {
                    status: "failed",
                },
            );

            throw error;
        }

        // ==========================================
        // Calculate Training Time
        // ==========================================

        const trainingTime =
            (Date.now() - startTime) / 1000;

        // ==========================================
        // Update Experiment
        // ==========================================

        await this.experimentRepository.update(
            experiment._id,
            {
                target_leakage:
                    trainingResult.target_leakage,

                cross_validation:
                    trainingResult.cross_validation,

                evaluation:
                    trainingResult.evaluation,

                training_time:
                    trainingTime,

                status: "completed",
            },
        );

        // ==========================================
        // Get Model Size
        // ==========================================

        const modelSize =
            fs.statSync(
                modelPath,
            ).size;

        // ==========================================
        // Create Trained Model
        // ==========================================

        const trainedModel =
            await this.trainedModelRepository.create(
                {
                    experiment_id:
                        experiment._id,

                    model_name:
                        trainingResult.model_name,

                    model_version: 1,

                    model_path:
                        modelPath,

                    model_size:
                        modelSize,

                    is_best_model: false,

                    deployment_status:
                        "not_deployed",

                    status: "active",
                },
            );

        ///////////   PART 3    /////////


        // ==========================================
        // Update Dataset Version
        // ==========================================

        await this.datasetRepository.updateDatasetVersion(
            dataset_version_id,
            {
                model_file_path: modelPath,

                trained_model_name:
                    trainingResult.model_name,

                processing_status:
                    "trained",
            },
        );

        // ==========================================
        // Update Project Status
        // ==========================================

        await this.projectRepository.updateProject(
            project_id,
            {
                status: "Training Completed"
            },
        );

        // ==========================================
        // Get Updated Experiment
        // ==========================================

        const updatedExperiment =
            await this.experimentRepository.findById(
                experiment._id,
            );

        // ==========================================
        // Return Response
        // ==========================================

        return {
            experiment: updatedExperiment,

            trained_model: trainedModel,

            training_result: trainingResult,
        };
    }
}

export default new MLTrainingService();