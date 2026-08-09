// import MLTrainingService from "../services/MLTrainingService.js";

// class MLTrainingController {
//     /*
//         Train Machine Learning model.
//     */
//     async trainModel(
//         request,
//         response,
//         next,
//     ) {
//         try {

//             const result =
//                 await MLTrainingService.trainModel(
//                     request.body,
//                 );

//             return response.status(200).json({
//                 success: true,
//                 message: "Model trained successfully.",
//                 data: result,
//             });

//         } catch (error) {

//             next(error);

//         }
//     }
// }

// export default new MLTrainingController();


import MLTrainingService from "../services/MLTrainingService.js";
import ExperimentRepository from "../repositories/ExperimentRepository.js";

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

            console.log("===== CONTROLLER RESULT =====");
            console.dir(result, { depth: null });

            if (!result.success) {

                return response.status(400).json({
                    success: false,
                    message: result.message,
                    validation: result.validation,
                });

            }

            return response.status(200).json({
                success: true,
                message: "Model trained successfully.",
                data: result,
            });

        }
        catch (error) {

            next(error);

        }
    }

    async getExperimentsByProject(request, response, next) {
        try {
            const { projectId } = request.params;
            const experiments = await ExperimentRepository.findByProjectId(projectId);
            return response.status(200).json({
                success: true,
                data: experiments,
            });
        } catch (error) {
            next(error);
        }
    }

    async getExperimentsByDataset(request, response, next) {
        try {
            const { datasetId } = request.params;
            const experiments = await ExperimentRepository.findByDatasetId(datasetId);
            return response.status(200).json({
                success: true,
                data: experiments,
            });
        } catch (error) {
            next(error);
        }
    }

    async getExperimentById(request, response, next) {
        try {
            const { experimentId } = request.params;
            const experiment = await ExperimentRepository.findById(experimentId);
            return response.status(200).json({
                success: true,
                data: experiment,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteTrainedModel(request, response, next) {
        try {
            const { id } = request.params;
            const result = await MLTrainingService.deleteTrainedModel(id);
            return response.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new MLTrainingController();

