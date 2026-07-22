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

        if (
            !experiments.length
        ) {
            throw new Error(
                "No completed experiments found.",
            );
        }

        return experiments;
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
                continue;
            }

            models.push(
                {
                    experiment_id:
                        experiment._id.toString(),

                    algorithm:
                        experiment.algorithm,

                    model_name:
                        trainedModel.model_name,

                    evaluation:
                        experiment.evaluation,
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

            // ==========================================
            // Validate Models
            // ==========================================

            if (
                !comparisonRequest.models.length
            ) {
                throw new Error(
                    "No trained models available for comparison.",
                );
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