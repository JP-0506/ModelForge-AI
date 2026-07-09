import DatasetRepository from "../repositories/DatasetRepository.js";
import ProjectRepository from "../repositories/ProjectRepository.js";
import WorkspaceRepository from "../repositories/WorkspaceRepository.js";
import DjangoService from "./django/DjangoService.js";

class DatasetService {
  // Upload New Dataset
  async uploadDataset(userId, datasetData) {
    // const {
    //   project_id,
    //   dataset_name,
    //   original_file_name,
    //   stored_file_name,
    //   file_path,
    //   file_type,
    //   file_size,
    //   rows,
    //   columns,
    // } = datasetData;

    const {
      project_id,
      dataset_name,
      uploaded_file,
    } = datasetData;

    // Check Project
    const project = await ProjectRepository.getProjectById(project_id);

    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      throw error;
    }

    // Check Workspace Ownership
    const workspace = await WorkspaceRepository.getWorkspaceById(
      project.workspace_id,
      userId
    );

    if (!workspace) {
      const error = new Error("Access denied.");
      error.statusCode = 403;
      throw error;
    }

    // Create Dataset
    const dataset = await DatasetRepository.createDataset({
      project_id,
      dataset_name,
      current_version: 1,
    });

    // Create Dataset Version
    // const datasetVersion =
    //   await DatasetRepository.createDatasetVersion({
    //     dataset_id: dataset._id,
    //     version_number: 1,
    //     original_file_name,
    //     stored_file_name,
    //     file_type,
    //     file_size,
    //     rows,
    //     columns,
    //     processing_status: "uploaded",
    //   });

    const datasetVersion =
      await DatasetRepository.createDatasetVersion({
        dataset_id: dataset._id,
        version_number: 1,

        original_file_name: uploaded_file.originalname,
        stored_file_name: uploaded_file.originalname,

        file_type: uploaded_file.mimetype,
        file_size: uploaded_file.size,

        original_rows: null,
        original_columns: null,

        cleaned_rows: null,
        cleaned_columns: null,

        feature_engineered_rows: null,
        feature_engineered_columns: null,

        processing_status: "uploaded",
      });

    // =====================================
    // Upload Dataset to Django
    // =====================================

    // const djangoResponse =
    //   await DjangoService.uploadDataset(
    //     file_path,
    //     dataset._id,
    //     1
    //   );

    const djangoResponse =
      await DjangoService.uploadDataset(
        uploaded_file,
        dataset._id,
        1
      );

    // =====================================
    // Update Dataset Version
    // =====================================

    await DatasetRepository.updateDatasetVersion(
      datasetVersion._id,
      {
        original_file_path:
          djangoResponse.data.original_file_path,

        file_size:
          djangoResponse.data.file_size,

        original_rows:
          djangoResponse.data.rows,

        original_columns:
          djangoResponse.data.columns,

        processing_status:
          djangoResponse.data.processing_status,
      }
    );

    return dataset;
  }

  // Upload New Dataset Version
  async uploadDatasetVersion(
    userId,
    datasetId,
    versionData
  ) {
    const dataset =
      await DatasetRepository.getDatasetById(datasetId);

    if (!dataset) {
      const error = new Error("Dataset not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Project
    const project =
      await ProjectRepository.getProjectById(
        dataset.project_id
      );

    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Workspace Ownership
    const workspace =
      await WorkspaceRepository.getWorkspaceById(
        project.workspace_id,
        userId
      );

    if (!workspace) {
      const error = new Error("Access denied.");
      error.statusCode = 403;
      throw error;
    }

    const versionNumber =
      dataset.current_version + 1;

    await DatasetRepository.createDatasetVersion({
      dataset_id: dataset._id,
      version_number: versionNumber,
      ...versionData,
      processing_status: "uploaded",
    });

    await DatasetRepository.setCurrentVersion(
      dataset._id,
      versionNumber
    );

    return await DatasetRepository.getDatasetById(
      dataset._id
    );
  }

  // ===========================================
  // Dataset Profiling
  // ===========================================
  async profileDataset(userId, profileData) {
    const { dataset_id, version } = profileData;

    // Verify Dataset
    const dataset = await DatasetRepository.getDatasetById(
      dataset_id
    );

    if (!dataset) {
      const error = new Error("Dataset not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Project
    const project =
      await ProjectRepository.getProjectById(
        dataset.project_id
      );

    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Workspace Ownership
    const workspace =
      await WorkspaceRepository.getWorkspaceById(
        project.workspace_id,
        userId
      );

    if (!workspace) {
      const error = new Error("Access denied.");
      error.statusCode = 403;
      throw error;
    }

    // Get Dataset Version
    const datasetVersion =
      await DatasetRepository.getLatestDatasetVersion(
        dataset_id
      );

    if (!datasetVersion) {
      const error = new Error(
        "Dataset version not found."
      );
      error.statusCode = 404;
      throw error;
    }

    // Call Django
    const djangoResponse =
      await DjangoService.profileDataset(
        dataset_id,
        version
      );

    // Update MongoDB
    await DatasetRepository.updateDatasetVersion(
      datasetVersion._id,
      {
        profiling_path:
          djangoResponse.data.profiling_path,

        processing_status:
          djangoResponse.data.processing_status,
      }
    );

    return await DatasetRepository.getLatestDatasetVersion(
      dataset_id
    );
  }

  // ===========================================
  // Dataset Cleaning
  // ===========================================
  async cleanDataset(userId, cleaningData) {
    const {
      dataset_id,
      version,
      cleaning_options,
    } = cleaningData;

    // Verify Dataset
    const dataset =
      await DatasetRepository.getDatasetById(
        dataset_id
      );

    if (!dataset) {
      const error = new Error("Dataset not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Project
    const project =
      await ProjectRepository.getProjectById(
        dataset.project_id
      );

    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Workspace Ownership
    const workspace =
      await WorkspaceRepository.getWorkspaceById(
        project.workspace_id,
        userId
      );

    if (!workspace) {
      const error = new Error("Access denied.");
      error.statusCode = 403;
      throw error;
    }

    // Get Latest Dataset Version
    const datasetVersion =
      await DatasetRepository.getLatestDatasetVersion(
        dataset_id
      );

    if (!datasetVersion) {
      const error = new Error(
        "Dataset version not found."
      );
      error.statusCode = 404;
      throw error;
    }

    // Call Django
    const djangoResponse =
      await DjangoService.cleanDataset(
        dataset_id,
        version,
        cleaning_options
      );

    // Update MongoDB
    await DatasetRepository.updateDatasetVersion(
      datasetVersion._id,
      {
        cleaned_file_path:
          djangoResponse.data.cleaned_file_path,

        cleaned_rows:
          djangoResponse.data.rows,

        cleaned_columns:
          djangoResponse.data.columns,

        processing_status:
          djangoResponse.data.processing_status,
      }
    );

    return await DatasetRepository.getLatestDatasetVersion(
      dataset_id
    );
  }

  // ===========================================
  // Feature Engineering
  // ===========================================
  async featureEngineering(userId, featureData) {
    const {
      dataset_id,
      version,
      feature_engineering_options,
    } = featureData;

    // Verify Dataset
    const dataset =
      await DatasetRepository.getDatasetById(
        dataset_id
      );

    if (!dataset) {
      const error = new Error("Dataset not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Project
    const project =
      await ProjectRepository.getProjectById(
        dataset.project_id
      );

    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Workspace Ownership
    const workspace =
      await WorkspaceRepository.getWorkspaceById(
        project.workspace_id,
        userId
      );

    if (!workspace) {
      const error = new Error("Access denied.");
      error.statusCode = 403;
      throw error;
    }

    // Get Latest Dataset Version
    const datasetVersion =
      await DatasetRepository.getLatestDatasetVersion(
        dataset_id
      );

    if (!datasetVersion) {
      const error = new Error(
        "Dataset version not found."
      );
      error.statusCode = 404;
      throw error;
    }

    // Call Django
    const djangoResponse =
      await DjangoService.featureEngineering(
        dataset_id,
        version,
        feature_engineering_options
      );

    // Update MongoDB
    await DatasetRepository.updateDatasetVersion(
      datasetVersion._id,
      {
        feature_engineered_file_path:
          djangoResponse.data.feature_engineered_file_path,

        feature_engineered_rows:
          djangoResponse.data.rows,

        feature_engineered_columns:
          djangoResponse.data.columns,

        processing_status:
          djangoResponse.data.processing_status,
      }
    );

    return await DatasetRepository.getLatestDatasetVersion(
      dataset_id
    );
  }

  // ===========================================
  // EDA
  // ===========================================
  async generateEDA(userId, edaData) {
    const {
      dataset_id,
      version,
    } = edaData;

    // Verify Dataset
    const dataset =
      await DatasetRepository.getDatasetById(
        dataset_id
      );

    if (!dataset) {
      const error = new Error("Dataset not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Project
    const project =
      await ProjectRepository.getProjectById(
        dataset.project_id
      );

    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Workspace Ownership
    const workspace =
      await WorkspaceRepository.getWorkspaceById(
        project.workspace_id,
        userId
      );

    if (!workspace) {
      const error = new Error("Access denied.");
      error.statusCode = 403;
      throw error;
    }

    // Get Latest Dataset Version
    const datasetVersion =
      await DatasetRepository.getLatestDatasetVersion(
        dataset_id
      );

    if (!datasetVersion) {
      const error = new Error(
        "Dataset version not found."
      );
      error.statusCode = 404;
      throw error;
    }

    // Call Django
    const djangoResponse =
      await DjangoService.generateEDA(
        dataset_id,
        version
      );

    // Update MongoDB
    await DatasetRepository.updateDatasetVersion(
      datasetVersion._id,
      {
        eda_path:
          djangoResponse.data.eda_path,

        processing_status:
          djangoResponse.data.processing_status,
      }
    );

    return await DatasetRepository.getLatestDatasetVersion(
      dataset_id
    );
  }

  // Get All Datasets by Project
  async getDatasetsByProject(projectId, userId) {
    const project =
      await ProjectRepository.getProjectById(projectId);

    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      throw error;
    }

    const workspace =
      await WorkspaceRepository.getWorkspaceById(
        project.workspace_id,
        userId
      );

    if (!workspace) {
      const error = new Error("Access denied.");
      error.statusCode = 403;
      throw error;
    }

    return await DatasetRepository.getDatasetsByProject(
      projectId
    );
  }

  // Get Dataset By ID
  async getDatasetById(datasetId, userId) {
    const dataset =
      await DatasetRepository.getDatasetById(datasetId);

    if (!dataset) {
      const error = new Error("Dataset not found.");
      error.statusCode = 404;
      throw error;
    }

    const project =
      await ProjectRepository.getProjectById(
        dataset.project_id
      );

    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      throw error;
    }

    const workspace =
      await WorkspaceRepository.getWorkspaceById(
        project.workspace_id,
        userId
      );

    if (!workspace) {
      const error = new Error("Access denied.");
      error.statusCode = 403;
      throw error;
    }

    return dataset;
  }

  // Get Dataset Version History
  async getDatasetVersions(datasetId, userId) {
    await this.getDatasetById(datasetId, userId);

    return await DatasetRepository.getDatasetVersions(
      datasetId
    );
  }

  // Delete Dataset
  async deleteDataset(datasetId, userId) {
    await this.getDatasetById(datasetId, userId);

    await DatasetRepository.deleteDataset(datasetId);

    return {
      message: "Dataset deleted successfully.",
    };
  }
}

export default new DatasetService();