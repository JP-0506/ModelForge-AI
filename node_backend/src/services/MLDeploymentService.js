// import ProjectRepository from "../repositories/ProjectRepository.js";
// import TrainedModelRepository from "../repositories/TrainedModelRepository.js";

// import DjangoDeploymentService from "./django/DjangoDeploymentService.js";

// class MLDeploymentService {
//     constructor() {
//         this.projectRepository =
//             ProjectRepository;

//         this.trainedModelRepository =
//             TrainedModelRepository;

//         this.djangoDeploymentService =
//             DjangoDeploymentService;
//     }

//     // ===================================================
//     // Get Project
//     // ===================================================

//     async getProject(
//         projectId,
//     ) {
//         const project =
//             await this.projectRepository.getProjectById(
//                 projectId,
//             );

//         if (
//             !project
//         ) {
//             throw new Error(
//                 "Project not found.",
//             );
//         }

//         return project;
//     }

//     // ===================================================
//     // Get Trained Model
//     // ===================================================

//     async getTrainedModel(
//         trainedModelId,
//     ) {
//         const trainedModel =
//             await this.trainedModelRepository.findById(
//                 trainedModelId,
//             );

//         if (
//             !trainedModel
//         ) {
//             throw new Error(
//                 "Trained model not found.",
//             );
//         }

//         return trainedModel;
//     }

//     // ===================================================
//     // Validate Deployment
//     // ===================================================

//     validateDeployment(
//         trainedModel,
//     ) {
//         if (
//             trainedModel.deployment_status ===
//             "deployed"
//         ) {
//             throw new Error(
//                 "Model is already deployed.",
//             );
//         }

//         if (
//             trainedModel.status !==
//             "active"
//         ) {
//             throw new Error(
//                 "Only active models can be deployed.",
//             );
//         }

//         return true;
//     }

//     // ===================================================
//     // Deploy Using Django
//     // ===================================================

//     async deployUsingDjango(
//         modelPath,
//     ) {
//         const response =
//             await this.djangoDeploymentService.deployModel(
//                 {
//                     model_path:
//                         modelPath,
//                 },
//             );

//         if (
//             !response.success
//         ) {
//             throw new Error(
//                 response.message,
//             );
//         }

//         return response.data;
//     }

//     // ===================================================
//     // Deploy Machine Learning Model
//     // ===================================================

//     async deployModel(
//         deploymentData,
//     ) {
//         const {
//             project_id,
//             trained_model_id,
//         } = deploymentData;

//         // ==========================================
//         // Get Project
//         // ==========================================

//         await this.getProject(
//             project_id,
//         );

//         // ==========================================
//         // Get Trained Model
//         // ==========================================

//         const trainedModel =
//             await this.getTrainedModel(
//                 trained_model_id,
//             );

//         // ==========================================
//         // Validate Deployment
//         // ==========================================

//         this.validateDeployment(
//             trainedModel,
//         );

//         try {

//             // ==========================================
//             // Mark Deployment In Progress
//             // ==========================================

//             await this.trainedModelRepository.update(
//                 trained_model_id,
//                 {
//                     deployment_status: "deploying",
//                 },
//             );

//             // ==========================================
//             // Deploy Model Using Django
//             // ==========================================

//             const deploymentResult =
//                 await this.deployUsingDjango(
//                     trainedModel.model_path,
//                 );

//             // ==========================================
//             // Update Deployment Status
//             // ==========================================

//             const updatedModel =
//                 await this.trainedModelRepository.update(
//                     trained_model_id,
//                     {
//                         deployment_status:
//                             "deployed",
//                     },
//                 );

//             // ==========================================
//             // Update Project Status
//             // ==========================================

//             await this.projectRepository.updateProject(
//                 project_id,
//                 {
//                     status:
//                         "Model Deployed",
//                 },
//             );

//             // ==========================================
//             // Return Response
//             // ==========================================

//             return {
//                 trained_model:
//                     updatedModel,

//                 deployment:
//                     deploymentResult,
//             };

//         } catch (
//         error
//         ) {

//             // ==========================================
//             // Mark Deployment Failed
//             // ==========================================

//             await this.trainedModelRepository.update(
//                 trained_model_id,
//                 {
//                     deployment_status:
//                         "failed",
//                 },
//             );

//             throw error;
//         }
//     }
// }

// export default new MLDeploymentService();

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

        // ==========================================
        // Return Response
        // ==========================================

        return {
            deployment,
        };
    }
}

export default new MLDeploymentService();