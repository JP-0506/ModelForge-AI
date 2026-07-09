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
    return await Dataset.find({
      project_id: projectId,
      is_deleted: false,
    }).sort({ created_at: -1 });
  }

  // Get Dataset By ID
  async getDatasetById(datasetId) {
    return await Dataset.findOne({
      _id: datasetId,
      is_deleted: false,
    });
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
}

export default new DatasetRepository();