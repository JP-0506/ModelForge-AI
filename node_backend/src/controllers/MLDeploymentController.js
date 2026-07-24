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
}

export default new MLDeploymentController();