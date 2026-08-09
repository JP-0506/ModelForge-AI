import TrainedModel from "../models/TrainedModel.js";

class TrainedModelRepository {

    //  Create a trained model.

    async create(
        trainedModelData,
    ) {
        return await TrainedModel.create(
            trainedModelData,
        );
    }
    
    async findById(
        trainedModelId,
    ) {
        return await TrainedModel.findOne(
            {
                _id: trainedModelId,
                is_deleted: false,
            },
        );
    }

    //  Find trained model by ID.

    async findById(
        trainedModelId,
    ) {
        return await TrainedModel.findById(
            trainedModelId,
        );
    }

    //  Find all trained models for an experiment.

    async findByExperimentId(
        experimentId,
    ) {
        return await TrainedModel.find(
            {
                experiment_id: experimentId,
                is_deleted: false,
            },
        ).sort(
            {
                model_version: -1,
            },
        );
    }

    // ==========================================
    // Find Trained Models By Experiment IDs
    // ==========================================

    async findByExperimentIds(
        experimentIds,
    ) {
        return await TrainedModel.find(
            {
                experiment_id: {
                    $in: experimentIds,
                },
                is_deleted: false,
            },
        );
    }

    // ==========================================
    // Find Best Model By Experiment ID
    // ==========================================

    async findBestModelByExperimentId(
        experimentId,
    ) {
        return await TrainedModel.findOne(
            {
                experiment_id: experimentId,
                is_best_model: true,
                is_deleted: false,
            },
        );
    }

    // ==========================================
    // Reset Best Model Flag
    // ==========================================

    async resetBestModels(
        experimentIds,
    ) {
        return await TrainedModel.updateMany(
            {
                experiment_id: {
                    $in: experimentIds,
                },
                is_deleted: false,
            },
            {
                is_best_model: false,
            },
        );
    }

    // ==========================================
    // Set Best Model
    // ==========================================

    // async setBestModel(
    //     experimentId,
    // ) {
    //     return await TrainedModel.findOneAndUpdate(
    //         {
    //             experiment_id: experimentId,
    //             is_deleted: false,
    //         },
    //         {
    //             is_best_model: true,
    //         },
    //         {
    //             new: true,
    //         },
    //     );
    // }

    async setBestModel(
        trainedModelId,
    ) {
        return await TrainedModel.findOneAndUpdate(
            {
                _id: trainedModelId,
                is_deleted: false,
            },
            {
                is_best_model: true,
            },
            {
                new: true,
            },
        );
    }

    //  Update trained model.

    async update(
        trainedModelId,
        updateData,
    ) {
        return await TrainedModel.findByIdAndUpdate(
            trainedModelId,
            updateData,
            {
                new: true,
            },
        );
    }

    //   Soft delete trained model.
    async softDelete(
        trainedModelId,
    ) {
        return await TrainedModel.findByIdAndUpdate(
            trainedModelId,
            {
                is_deleted: true,
            },
            {
                new: true,
            },
        );
    }
}

export default new TrainedModelRepository();