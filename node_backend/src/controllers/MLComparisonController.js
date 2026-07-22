import MLComparisonService from "../services/MLComparisonService.js";

class MLComparisonController {

    // Compare Machine Learning Models

    async compareModels(
        req,
        res,
        next,
    ) {
        try {
            const {
                project_id,
            } = req.body;

            const comparisonResult =
                await MLComparisonService.compareModels(
                    project_id,
                );

            return res.status(
                200,
            ).json(
                {
                    success: true,

                    message:
                        "Models compared successfully.",

                    data:
                        comparisonResult,
                },
            );
        }

        catch (error) {

            next(error);
        }
    }
}

export default new MLComparisonController();