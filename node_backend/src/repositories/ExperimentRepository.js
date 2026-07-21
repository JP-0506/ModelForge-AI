import Experiment from "../models/Experiment.js";

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

    async findById(
        experimentId,
    ) {
        return await Experiment.findById(
            experimentId,
        );
    }


    //  Get all experiments for a project.

    async findByProjectId(
        projectId,
    ) {
        return await Experiment.find(
            {
                project_id: projectId,
                is_deleted: false,
            },
        ).sort(
            {
                created_at: -1,
            },
        );
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