import ProjectRepository from "../repositories/ProjectRepository.js";
import ExperimentRepository from "../repositories/ExperimentRepository.js";
import TrainedModelRepository from "../repositories/TrainedModelRepository.js";
import DeploymentRepository from "../repositories/DeploymentRepository.js";

import DjangoReportService from "./django/DjangoReportService.js";

const NOT_AVAILABLE = "None";

class ReportService {

    constructor() {
        this.projectRepository = ProjectRepository;
        this.experimentRepository = ExperimentRepository;
        this.trainedModelRepository = TrainedModelRepository;
        this.deploymentRepository = DeploymentRepository;
        this.djangoReportService = DjangoReportService;
    }

    // ===================================================
    // Get Project
    // ===================================================

    async getProject(projectId) {
        const project = await this.projectRepository.getProjectById(projectId);

        if (!project) {
            throw new Error("Project not found.");
        }

        return project;
    }

    // ===================================================
    // Get Experiment
    // ===================================================

    async getExperiment(experimentId) {
        const experiment = await this.experimentRepository.findById(experimentId);

        if (!experiment) {
            throw new Error("Experiment not found.");
        }

        return experiment;
    }

    // ===================================================
    // Get Deployment
    // ===================================================

    async getDeployment(deploymentId) {
        const deployment = await this.deploymentRepository.findById(deploymentId);

        if (!deployment) {
            throw new Error("Deployment not found.");
        }

        return deployment;
    }

    // ===================================================
    // Get Trained Model
    // ===================================================

    async getTrainedModel(trainedModelId) {
        return await this.trainedModelRepository.findById(trainedModelId);
    }

    // ===================================================
    // Get Best Model
    // ===================================================

    async getBestModel(experimentId) {
        return await this.trainedModelRepository.findBestModelByExperimentId(experimentId);
    }

    // ===================================================
    // Get Primary Metric
    // ===================================================

    getPrimaryMetric(evaluation) {
        if (!evaluation) {
            return null;
        }

        return (
            evaluation.r2_score ??
            evaluation.accuracy ??
            evaluation.silhouette_score ??
            null
        );
    }

    // ===================================================
    // Build Training Report Data
    // ===================================================

    async buildTrainingReportData(experimentId) {
        const experiment = await this.getExperiment(experimentId);
        const project = await this.getProject(experiment.project_id);
        const trainedModel = await this.getBestModel(experimentId);

        return {
            project_name: project.project_name,
            experiment_name: experiment.experiment_name,
            problem_type: experiment.problem_type,
            target_column: experiment.target_column,
            algorithm: experiment.algorithm,
            parameters: experiment.parameters,
            cross_validation: experiment.cross_validation,
            target_leakage: experiment.target_leakage,
            training_time: experiment.training_time,
            model_name: trainedModel?.model_name ?? experiment.algorithm,
            model_size: trainedModel?.model_size ?? NOT_AVAILABLE,
            training_date: trainedModel?.created_at ?? experiment.created_at,
            metrics: experiment.evaluation ?? {},
        };
    }


    // ===================================================
    // Build Comparison Report Data
    // ===================================================

    async buildComparisonReportData(projectId) {
        const project = await this.getProject(projectId);
        const experiments = await this.experimentRepository.findCompletedByProjectId(projectId);

        if (experiments.length === 0) {
            return {
                project_name: project.project_name,
                experiment_name: NOT_AVAILABLE,
                problem_type: NOT_AVAILABLE,
                best_model: NOT_AVAILABLE,
                best_score: NOT_AVAILABLE,
                models: [],
            };
        }

        const models = [];
        let bestExperiment = null;

        for (const experiment of experiments) {
            const score = this.getPrimaryMetric(experiment.evaluation);

            models.push({
                model_name: experiment.algorithm,
                score: score ?? NOT_AVAILABLE,
            });

            if (!bestExperiment) {
                bestExperiment = experiment;
                continue;
            }

            const bestScore = this.getPrimaryMetric(bestExperiment.evaluation);

            if (score !== null && (bestScore === null || score > bestScore)) {
                bestExperiment = experiment;
            }
        }

        return {
            project_name: project.project_name,
            experiment_name: bestExperiment.experiment_name,
            problem_type: bestExperiment.problem_type,
            best_model: bestExperiment.algorithm,
            best_score: this.getPrimaryMetric(bestExperiment.evaluation) ?? NOT_AVAILABLE,
            models,
        };
    }

    // ===================================================
    // Build Deployment Report Data
    // ===================================================

    async buildDeploymentReportData(deploymentId) {
        const deployment = await this.getDeployment(deploymentId);
        const trainedModel = await this.getTrainedModel(deployment.trained_model_id);

        const experiment = trainedModel
            ? await this.getExperiment(trainedModel.experiment_id)
            : null;

        const project = experiment
            ? await this.getProject(experiment.project_id)
            : null;

        return {
            project_name: project?.project_name ?? NOT_AVAILABLE,
            experiment_name: experiment?.experiment_name ?? NOT_AVAILABLE,
            model_name: trainedModel?.model_name ?? NOT_AVAILABLE,
            endpoint_name: deployment.endpoint_name,
            endpoint_url: deployment.endpoint_url,
            deployment_status: deployment.status,
            deployment_date: deployment.deployed_at,
        };
    }

    // ===================================================
    // Generate Training Report
    // ===================================================

    async generateTrainingReport(experimentId) {
        const reportData = await this.buildTrainingReportData(experimentId);

        const report = await this.djangoReportService.generateReport({
            report_type: "training",
            report_data: reportData,
        });

        return {
            fileBuffer: report.fileBuffer,
            contentType: report.contentType,
            fileName: "training_report.pdf",
        };
    }

    // ===================================================
    // Generate Comparison Report
    // ===================================================

    async generateComparisonReport(projectId) {
        const reportData = await this.buildComparisonReportData(projectId);

        const report = await this.djangoReportService.generateReport({
            report_type: "comparison",
            report_data: reportData,
        });

        return {
            fileBuffer: report.fileBuffer,
            contentType: report.contentType,
            fileName: "comparison_report.pdf",
        };
    }

    // ===================================================
    // Generate Deployment Report
    // ===================================================

    async generateDeploymentReport(deploymentId) {
        const reportData = await this.buildDeploymentReportData(deploymentId);

        const report = await this.djangoReportService.generateReport({
            report_type: "deployment",
            report_data: reportData,
        });

        return {
            fileBuffer: report.fileBuffer,
            contentType: report.contentType,
            fileName: "deployment_report.pdf",
        };
    }

    // ===================================================
    // Generate Report
    // ===================================================

    async generateReport(reportRequest) {
        const { report_type, experiment_id, project_id, deployment_id } = reportRequest;

        switch (report_type) {
            case "training":
                return await this.generateTrainingReport(experiment_id);

            case "comparison":
                return await this.generateComparisonReport(project_id);

            case "deployment":
                return await this.generateDeploymentReport(deployment_id);

            case "validation":
                const valReport = await this.djangoReportService.generateReport({
                    report_type: "validation",
                    report_data: reportRequest.report_data || reportRequest,
                });
                return {
                    fileBuffer: valReport.fileBuffer,
                    contentType: valReport.contentType,
                    fileName: "validation_report.pdf",
                };

            default:
                throw new Error("Invalid report type.");
        }
    }

}

export default new ReportService();