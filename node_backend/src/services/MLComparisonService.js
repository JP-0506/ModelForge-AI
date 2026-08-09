import ProjectRepository from "../repositories/ProjectRepository.js";
import ExperimentRepository from "../repositories/ExperimentRepository.js";
import TrainedModelRepository from "../repositories/TrainedModelRepository.js";

import ModelComparisonService from "./django/ModelComparisonService.js";

class MLComparisonService {
    constructor() {
        this.projectRepository =
            ProjectRepository;

        this.experimentRepository =
            ExperimentRepository;

        this.trainedModelRepository =
            TrainedModelRepository;

        this.modelComparisonService =
            ModelComparisonService;
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
    // Get Completed Experiments
    // ===================================================

    async getCompletedExperiments(
        projectId,
    ) {
        const experiments =
            await this.experimentRepository.findCompletedByProjectId(
                projectId,
            );

        return experiments || [];
    }


    // ===================================================
    // Build Comparison Request
    // ===================================================

    async buildComparisonRequest(
        project,
        experiments,
    ) {
        const models = [];

        // ==========================================
        // Get Experiment IDs
        // ==========================================

        const experimentIds =
            experiments.map(
                (
                    experiment,
                ) =>
                    experiment._id,
            );

        // ==========================================
        // Fetch All Trained Models
        // ==========================================

        const trainedModels =
            await this.trainedModelRepository.findByExperimentIds(
                experimentIds,
            );

        // ==========================================
        // Create Trained Model Lookup
        // ==========================================

        const trainedModelMap =
            new Map();

        for (
            const trainedModel of trainedModels
        ) {
            trainedModelMap.set(
                trainedModel.experiment_id.toString(),
                trainedModel,
            );
        }

        // ==========================================
        // Build Models List
        // ==========================================

        for (
            const experiment of experiments
        ) {
            const trainedModel =
                trainedModelMap.get(
                    experiment._id.toString(),
                );

            if (
                !trainedModel
            ) {
                // Fallback to experiment metadata even if trainedModel doc is missing
            }

            models.push(
                {
                    experiment_id:
                        experiment._id.toString(),

                    experiment_name:
                        experiment.experiment_name || `Experiment ${experiment._id}`,

                    algorithm:
                        experiment.algorithm,

                    model_name:
                        trainedModel?.model_name || experiment.algorithm,

                    evaluation:
                        experiment.evaluation || {},

                    cross_validation:
                        experiment.cross_validation || {},

                    training_time:
                        experiment.training_time || 0.0,

                    prediction_time:
                        0.01,

                    model_size:
                        trainedModel?.model_size || 0,

                    parameters:
                        experiment.parameters || {},

                    target_column:
                        experiment.target_column || "N/A",

                    dataset_version:
                        experiment.dataset_version_id?.toString() || "v1",

                    status:
                        experiment.status || "completed",
                },
            );
        }

        return {
            problem_type:
                project.problem_type,

            models,
        };
    }


    // ===================================================
    // Compare Models Using Django
    // ===================================================

    async compareUsingDjango(
        comparisonRequest,
    ) {
        const response =
            await this.modelComparisonService.compareModels(
                comparisonRequest,
            );

        if (!response.success) {
            throw new Error(
                response.message,
            );
        }

        return response.data;
    }

    // ===================================================
    // Compare Machine Learning Models
    // ===================================================

    async compareModels(
        projectId,
    ) {
        try {

            // ==========================================
            // Get Project
            // ==========================================

            const project =
                await this.getProject(
                    projectId,
                );

            // ==========================================
            // Get Completed Experiments
            // ==========================================

            const experiments =
                await this.getCompletedExperiments(
                    projectId,
                );

            // ==========================================
            // Build Django Request
            // ==========================================

            const comparisonRequest =
                await this.buildComparisonRequest(
                    project,
                    experiments,
                );

            if (comparisonRequest.models.length < 2) {
                return {
                    project_id: projectId,
                    problem_type: project.problem_type,
                    comparison_metric: "n/a",
                    total_models: comparisonRequest.models.length,
                    leaderboard: comparisonRequest.models.map((m, idx) => ({ ...m, rank: idx + 1, score: 0, is_best_model: idx === 0 })),
                    best_model: null,
                };
            }

            // ==========================================
            // Compare Models Using Django
            // ==========================================

            const comparisonResult =
                await this.compareUsingDjango(
                    comparisonRequest,
                );


            // ==========================================
            // Extract Leaderboard
            // ==========================================

            const leaderboard =
                comparisonResult.leaderboard || [];

            if (
                !leaderboard.length
            ) {
                throw new Error(
                    "No comparison results returned.",
                );
            }

            // ==========================================
            // Reset Best Model Flag
            // ==========================================

            const experimentIds =
                experiments.map(
                    (
                        experiment,
                    ) =>
                        experiment._id,
                );

            await this.trainedModelRepository.resetBestModels(
                experimentIds,
            );

            // ==========================================
            // Set Best Model
            // ==========================================

            const bestModel =
                leaderboard.find(
                    (
                        model,
                    ) =>
                        model.is_best_model,
                );

            let updatedBestModel =
                null;

            if (
                bestModel
            ) {
                updatedBestModel =
                    await this.trainedModelRepository.setBestModel(
                        bestModel.experiment_id,
                    );
            }

            // ==========================================
            // Return Response
            // ==========================================

            return {
                project_id:
                    projectId,

                comparison_metric:
                    comparisonResult.comparison_metric,

                total_models:
                    comparisonResult.total_models,

                leaderboard,

                best_model:
                    updatedBestModel,
            };

        } catch (error) {

            // ==========================================
            // Failure Handling
            // ==========================================

            throw new Error(
                error.message ||
                "Model comparison failed.",
            );
        }
    }
}

export default new MLComparisonService();