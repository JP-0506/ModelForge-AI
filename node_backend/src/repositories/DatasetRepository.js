import Dataset from "../models/Dataset.js";
import DatasetVersion from "../models/DatasetVersion.js";

class DatasetRepository {
  // Create Dataset
  async createDataset(datasetData) {
    return await Dataset.create(datasetData);
  }

  // Create Dataset Version
  async createDatasetVersion(versionData) {
    return await DatasetVersion.create(versionData);
  }

  // Get All Datasets by Project
  async getDatasetsByProject(projectId) {
    const datasets = await Dataset.find({
      project_id: projectId,
      is_deleted: false,
    })
      .sort({ created_at: -1 })
      .lean();

    return await Promise.all(
      datasets.map(async (ds) => {
        const latestVersion = await DatasetVersion.findOne({
          dataset_id: ds._id,
          version_number: ds.current_version,
        }).lean();

        return {
          ...ds,
          latest_version: latestVersion,
        };
      })
    );
  }

  // Get Dataset By ID
  async getDatasetById(datasetId) {
    const dataset = await Dataset.findOne({
      _id: datasetId,
      is_deleted: false,
    }).lean();

    if (!dataset) return null;

    const latestVersion = await DatasetVersion.findOne({
      dataset_id: dataset._id,
      version_number: dataset.current_version,
    }).lean();

    return {
      ...dataset,
      latest_version: latestVersion,
    };
  }

  // Update Dataset
  async updateDataset(datasetId, updateData) {
    const dataset = await Dataset.findOneAndUpdate(
      {
        _id: datasetId,
        is_deleted: false,
      },
      {
        ...updateData,
        updated_at: new Date(),
      },
      {
        returnDocument: "after",
      }
    ).lean();

    if (!dataset) return null;

    const latestVersion = await DatasetVersion.findOne({
      dataset_id: dataset._id,
      version_number: dataset.current_version,
    }).lean();

    return {
      ...dataset,
      latest_version: latestVersion,
    };
  }

  // Get DatasetVersion By ID
  async getDatasetVersionById(
    datasetVersionId,
  ) {
    return await DatasetVersion.findById(
      datasetVersionId,
    );
  }

  // Get Latest Dataset Version
  async getLatestDatasetVersion(datasetId) {
    return await DatasetVersion.findOne({
      dataset_id: datasetId,
    }).sort({ version_number: -1 });
  }

  // Get Dataset Version History
  async getDatasetVersions(datasetId) {
    return await DatasetVersion.find({
      dataset_id: datasetId,
    }).sort({ version_number: -1 });
  }

  // Set Current Version
  async setCurrentVersion(datasetId, versionNumber) {
    return await Dataset.findByIdAndUpdate(
      datasetId,
      {
        current_version: versionNumber,
        updated_at: new Date(),
      },
      {
        // new: true,
        returnDocument: "after",
      }
    );
  }

  // Update Dataset Version
  async updateDatasetVersion(versionId, updateData) {
    return await DatasetVersion.findByIdAndUpdate(
      versionId,
      {
        ...updateData,
      },
      {
        // new: true,
        returnDocument: "after",
      }
    );
  }

  async findByProjectAndName(
    projectId,
    datasetName,
  ) {
    return await Dataset.findOne({
      project_id: projectId,
      dataset_name: {
        $regex: `^${datasetName.trim()}$`,
        $options: "i",
      },
      is_deleted: false,
    });
  }

  // Soft Delete Dataset
  async deleteDataset(datasetId) {
    return await Dataset.findOneAndUpdate(
      {
        _id: datasetId,
        is_deleted: false,
      },
      {
        is_deleted: true,
        updated_at: new Date(),
      },
      {
        // new: true,
        returnDocument: "after",
      }
    );
  }

  // ==========================================
  // Hard Delete Dataset
  // ==========================================

  async hardDeleteDataset(datasetId) {
    return await Dataset.findByIdAndDelete(datasetId);
  }

  // ==========================================
  // Hard Delete Dataset Version
  // ==========================================

  async hardDeleteDatasetVersion(versionId) {
    return await DatasetVersion.findByIdAndDelete(versionId);
  }
}

export default new DatasetRepository();