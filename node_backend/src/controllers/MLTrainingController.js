import MLTrainingService from "../services/MLTrainingService.js";

class MLTrainingController {
    /*
        Train Machine Learning model.
    */
    async trainModel(
        request,
        response,
        next,
    ) {
        try {

            const result =
                await MLTrainingService.trainModel(
                    request.body,
                );

            return response.status(200).json({
                success: true,
                message: "Model trained successfully.",
                data: result,
            });

        } catch (error) {

            next(error);

        }
    }
}

export default new MLTrainingController();
