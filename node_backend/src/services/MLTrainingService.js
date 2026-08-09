import path from "path";
import fs from "fs";

import ProjectRepository from "../repositories/ProjectRepository.js";
import DatasetRepository from "../repositories/DatasetRepository.js";
import ExperimentRepository from "../repositories/ExperimentRepository.js";
import TrainedModelRepository from "../repositories/TrainedModelRepository.js";
import DeploymentRepository from "../repositories/DeploymentRepository.js";

import DjangoTrainingService from "./django/DjangoTrainingService.js";

class MLTrainingService {
    constructor() {
        this.projectRepository = ProjectRepository;

        this.datasetRepository = DatasetRepository;

        this.experimentRepository = ExperimentRepository;

        this.trainedModelRepository = TrainedModelRepository;

        this.deploymentRepository = DeploymentRepository;

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

    // Helper to resolve disk path cross-platform
    resolveDatasetPath(p) {
        if (!p) return null;
        if (fs.existsSync(p)) return p;
        const normalized = String(p).replace(/\\/g, "/");
        const mediaIdx = normalized.indexOf("media/");
        if (mediaIdx !== -1) {
            const rel = normalized.substring(mediaIdx);
            const cand = path.resolve(process.cwd(), "..", "django_backend", rel);
            if (fs.existsSync(cand)) return cand;
        }
        return null;
    }

    // ===================================================
    // Validate Dataset Version File
    // ===================================================

    validateTrainingDataset(
        datasetVersion,
    ) {
        const candidatePaths = [
            datasetVersion.feature_engineered_file_path,
            datasetVersion.cleaned_file_path,
            datasetVersion.original_file_path,
        ];

        let validPath = null;
        for (const rawP of candidatePaths) {
            const resolved = this.resolveDatasetPath(rawP);
            if (resolved) {
                validPath = resolved;
                break;
            }
        }

        if (!validPath) {
            throw new Error(
                "Dataset file path not found for training.",
            );
        }

        datasetVersion.resolved_file_path = validPath;
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
            process.env.DJANGO_MEDIA_PATH || path.resolve(process.cwd(), "..", "django_backend", "media"),
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
        const datasetPath = datasetVersion.resolved_file_path ||
            datasetVersion.feature_engineered_file_path ||
            datasetVersion.cleaned_file_path ||
            datasetVersion.original_file_path;

        return {
            dataset_path:
                datasetPath,

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
        return await this.djangoTrainingService.trainModel(
            trainingRequest,
        );
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

        // Validate target column for non-clustering tasks
        if (project.problem_type !== 'clustering' && (!target_column || !target_column.trim())) {
            const error = new Error("Target column is required for model training. Please select a target column.");
            error.statusCode = 400;
            throw error;
        }

        // Check for duplicate experiment name in project
        if (experiment_name) {
            const existingExp = await this.experimentRepository.findByName(project_id, experiment_name);
            if (existingExp) {
                const error = new Error(`An experiment named '${experiment_name.trim()}' already exists in this project.`);
                error.statusCode = 400;
                throw error;
            }
        }

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

        console.log("\n========== DJANGO REQUEST ==========");
        console.dir(djangoRequest, { depth: null });
        console.log("====================================");
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

            const trainingResponse =
                await this.trainModelUsingDjango(
                    djangoRequest,
                );
            console.log("===== DJANGO RESPONSE =====");
            console.dir(trainingResponse, { depth: null });

            // ==========================================
            // Training Validation Failed
            // ==========================================

            if (!trainingResponse.success) {

                await this.experimentRepository.update(
                    experiment._id,
                    {
                        status: "validation_failed",
                    },
                );

                return {
                    success: false,
                    message: trainingResponse.message,
                    validation: trainingResponse.data,
                };
            }

            trainingResult = trainingResponse.data;

        }
        catch (error) {

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

        console.log("===== FINAL RETURN =====");
        console.dir({
            experiment: updatedExperiment,
            trained_model: trainedModel,
            training_result: trainingResult,
        }, { depth: null });
        // ==========================================
        // Return Response
        // ==========================================

        return {
            success: true,

            experiment: updatedExperiment,

            trained_model: trainedModel,

            training_result: trainingResult,
        };
    }

    // ===================================================
    // Soft Delete Trained Model / Experiment
    // ===================================================

    async deleteTrainedModel(modelOrExpId) {
        let trainedModel = await this.trainedModelRepository.findById(modelOrExpId);
        let experimentId = null;

        if (trainedModel) {
            experimentId = trainedModel.experiment_id;
            await this.trainedModelRepository.softDelete(trainedModel._id);
        } else {
            // Check if modelOrExpId is experiment_id
            const exp = await this.experimentRepository.findById(modelOrExpId);
            if (exp) {
                experimentId = exp._id;
                trainedModel = await this.trainedModelRepository.findByExperimentId(exp._id);
                if (trainedModel) {
                    await this.trainedModelRepository.softDelete(trainedModel._id);
                }
            } else {
                throw new Error("Trained model or experiment not found.");
            }
        }

        // Soft delete experiment
        if (experimentId) {
            await this.experimentRepository.softDelete(experimentId);
        }

        // Soft delete active deployment if exists
        if (trainedModel && trainedModel._id) {
            const dep = await this.deploymentRepository.findActiveDeploymentByModelId(trainedModel._id);
            if (dep) {
                await this.deploymentRepository.softDelete(dep._id);
            }
        }

        return {
            success: true,
            message: "Trained model deleted successfully.",
        };
    }
}

export default new MLTrainingService();