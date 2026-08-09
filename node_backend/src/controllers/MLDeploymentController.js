import MLDeploymentService from "../services/MLDeploymentService.js";

class MLDeploymentController {

    constructor() {

        this.mlDeploymentService = MLDeploymentService;
    }

    // ===================================================
    // Deploy Machine Learning Model
    // ===================================================
    async deployModel(request, response, next) {

        try {

            const result =
                await this.mlDeploymentService.deployModel(
                    request.body,
                );

            return response.status(201).json({

                success: true,
                message: "Model deployed successfully.",
                data: result,

            });

        }
        catch (error) {

            next(error);

        }
    }

    // ===================================================
    // Get Deployments By Project
    // ===================================================
    async getDeploymentsByProject(request, response, next) {
        try {
            const { projectId } = request.params;
            const deployments = await this.mlDeploymentService.getDeploymentsByProject(projectId);
            return response.status(200).json({
                success: true,
                message: "Deployments retrieved successfully.",
                data: deployments,
            });
        } catch (error) {
            next(error);
        }
    }

    // ===================================================
    // Get Deployments By Dataset
    // ===================================================
    async getDeploymentsByDataset(request, response, next) {
        try {
            const { datasetId } = request.params;
            const deployments = await this.mlDeploymentService.getDeploymentsByDataset(datasetId);
            return response.status(200).json({
                success: true,
                message: "Deployments retrieved successfully.",
                data: deployments,
            });
        } catch (error) {
            next(error);
        }
    }

    // ===================================================
    // Delete Deployment
    // ===================================================
    async deleteDeployment(request, response, next) {
        try {
            const { id } = request.params;
            const result = await this.mlDeploymentService.deleteDeployment(id);
            return response.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new MLDeploymentController();