import Experiment from "../models/Experiment.js";
import TrainedModel from "../models/TrainedModel.js";
import DatasetVersion from "../models/DatasetVersion.js";

class ExperimentRepository {

    //  Create a new experiment.

    async create(
        experimentData,
    ) {
        return await Experiment.create(
            experimentData,
        );
    }

    //  Find experiment by ID.

    // async findById(
    //     experimentId,
    // ) {
    //     return await Experiment.findById(
    //         experimentId,
    //     );
    // }
    async findById(
        experimentId,
    ) {
        return await Experiment.findOne(
            {
                _id: experimentId,
                is_deleted: false,
            },
        );
    }

    // Find experiment by project and name (case-insensitive)
    async findByName(projectId, experimentName) {
        if (!experimentName) return null;
        const escapedName = experimentName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return await Experiment.findOne({
            project_id: projectId,
            is_deleted: false,
            experiment_name: { $regex: new RegExp(`^${escapedName}$`, "i") },
        });
    }


    //  Get all experiments for a project.

    // ==========================================
    // Get Experiments with Trained Models
    // ==========================================

    async findByProjectId(projectId) {

        const experiments = await Experiment.find(
            {
                project_id: projectId,
                is_deleted: false,
            }
        ).sort({
            created_at: -1,
        });

        const result = await Promise.all(

            experiments.map(async (experiment) => {

                const trainedModel =
                    await TrainedModel.findOne({
                        experiment_id: experiment._id,
                        is_deleted: false,
                    });

                return {
                    ...experiment.toObject(),
                    trained_model: trainedModel,
                };

            })

        );

        return result;
    }

    // ==========================================
    // Get Experiments By Dataset ID
    // ==========================================

    async findByDatasetId(datasetId) {
        // Find all dataset versions associated with this dataset ID
        const versions = await DatasetVersion.find({ dataset_id: datasetId });
        const versionIds = versions.map((v) => v._id);

        const experiments = await Experiment.find({
            $or: [
                { dataset_version_id: { $in: versionIds } },
                { dataset_version_id: datasetId },
            ],
            is_deleted: false,
        }).sort({
            created_at: -1,
        });

        const result = await Promise.all(
            experiments.map(async (experiment) => {
                const trainedModel = await TrainedModel.findOne({
                    experiment_id: experiment._id,
                    is_deleted: false,
                });

                return {
                    ...experiment.toObject(),
                    trained_model: trainedModel,
                };
            })
        );

        return result;
    }

    // ==========================================
    // Get Completed Experiments By Project
    // ==========================================

    async findCompletedByProjectId(
        projectId,
    ) {
        return await Experiment.find(
            {
                project_id: projectId,
                status: "completed",
                is_deleted: false,
            },
        ).sort(
            {
                created_at: -1,
            },
        );
    }

    // ==========================================
    // Get Experiments By IDs
    // ==========================================

    async findByIds(
        experimentIds,
    ) {
        return await Experiment.find(
            {
                _id: {
                    $in: experimentIds,
                },
                is_deleted: false,
            },
        );
    }


    //  Update experiment.

    async update(
        experimentId,
        updateData,
    ) {
        return await Experiment.findByIdAndUpdate(
            experimentId,
            updateData,
            {
                new: true,
            },
        );
    }


    //  Soft delete experiment.

    async softDelete(
        experimentId,
    ) {
        return await Experiment.findByIdAndUpdate(
            experimentId,
            {
                is_deleted: true,
            },
            {
                new: true,
            },
        );
    }
}

export default new ExperimentRepository();