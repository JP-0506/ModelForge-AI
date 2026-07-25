import MLPredictionService from "../services/MLPredictionService.js";

class MLPredictionController {

    constructor() {

        this.mlPredictionService =
            MLPredictionService;

    }

    // ===================================================
    // Generate Machine Learning Prediction
    // ===================================================

    async predict(
        request,
        response,
        next,
    ) {

        try {

            const {
                deployment_id,
            } = request.params;

            const {
                features,
            } = request.body;

            const result =
                await this.mlPredictionService.predict(
                    deployment_id,
                    features,
                );

            return response.status(200).json({

                success: true,

                message:
                    "Prediction generated successfully.",

                data: result,

            });

        }
        catch (error) {

            next(error);

        }

    }

}

export default new MLPredictionController();