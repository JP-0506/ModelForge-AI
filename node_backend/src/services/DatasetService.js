import fs from "fs";
import path from "path";
import DatasetRepository from "../repositories/DatasetRepository.js";
import ProjectRepository from "../repositories/ProjectRepository.js";
import WorkspaceRepository from "../repositories/WorkspaceRepository.js";
import DjangoDatasetService from "./django/DjangoDatasetService.js";

class DatasetService {
  // Upload New Dataset
  async uploadDataset(userId, datasetData) {

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

    let dataset = null;
    let datasetVersion = null;

    // =====================================
    // Check Duplicate Dataset Name
    // =====================================

    const existingDataset =
      await DatasetRepository.findByProjectAndName(
        project_id,
        dataset_name.trim(),
      );

    if (existingDataset) {
      const error = new Error(
        "A dataset with this name already exists in this project."
      );
      error.statusCode = 409;
      throw error;
    }

    try {
      // Create Dataset
      dataset = await DatasetRepository.createDataset({
        project_id,
        dataset_name,
        current_version: 1,
      });

      datasetVersion =
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

      const djangoResponse =
        await DjangoDatasetService.uploadDataset(
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

      return await DatasetRepository.getDatasetById(dataset._id);
    } catch (error) {

      console.error("Dataset Upload Failed:", error.message);

      // =====================================
      // Rollback Dataset Version
      // =====================================

      if (datasetVersion) {

        await DatasetRepository.hardDeleteDatasetVersion(
          datasetVersion._id
        );

      }

      // =====================================
      // Rollback Dataset
      // =====================================

      if (dataset) {

        await DatasetRepository.hardDeleteDataset(
          dataset._id
        );

      }

      throw error;
    }
  }

  // ==========================================
  // Validate Dataset
  // ==========================================

  async validateDataset(
    datasetId,
    datasetType = "original",
  ) {
    // Get dataset
    const dataset =
      await DatasetRepository.getDatasetById(
        datasetId,
      );

    if (!dataset) {
      const error = new Error("Dataset not found.");
      error.statusCode = 404;
      throw error;
    }

    const type = datasetType || "original";
    const version = dataset.current_version || 1;

    // Call Django Validation Service
    return await DjangoDatasetService.validateDataset(
      datasetId,
      version,
      type,
    );
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
      await DjangoDatasetService.profileDataset(
        dataset_id,
        version
      );

    // Update MongoDB
    const updatedVersion = await DatasetRepository.updateDatasetVersion(
      datasetVersion._id,
      {
        profiling_path:
          djangoResponse.data.profiling_path,

        processing_status:
          djangoResponse.data.processing_status,
      }
    );

    return {
      version: updatedVersion,
      profile: djangoResponse.data.profile,
    };
  }

  // Get Dataset Profile JSON
  async getDatasetProfile(userId, datasetId) {
    const dataset = await this.getDatasetById(datasetId, userId);

    const datasetVersion =
      await DatasetRepository.getLatestDatasetVersion(datasetId);

    if (!datasetVersion || !datasetVersion.profiling_path) {
      return {
        status: "not_generated",
        profile: null,
      };
    }

    try {
      const profilePath = datasetVersion.profiling_path;
      if (fs.existsSync(profilePath)) {
        const raw = fs.readFileSync(profilePath, "utf-8");
        const profile = JSON.parse(raw);
        return {
          status: "completed",
          profile,
        };
      }
    } catch (err) {
      console.error("Failed to read profiling.json:", err);
    }

    return {
      status: "not_generated",
      profile: null,
    };
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

    // Verify Validation & Profiling completed
    if (!datasetVersion.original_file_path) {
      const error = new Error("Dataset validation must be completed before cleaning.");
      error.statusCode = 400;
      throw error;
    }

    // Call Django
    const djangoResponse =
      await DjangoDatasetService.cleanDataset(
        dataset_id,
        version || dataset.current_version || 1,
        cleaning_options
      );

    // Update MongoDB
    const cleaningSummary = {
      rows_before: djangoResponse.data.rows_before,
      rows_after: djangoResponse.data.rows_after,
      columns_before: djangoResponse.data.columns_before,
      columns_after: djangoResponse.data.columns_after,
      missing_values_removed: djangoResponse.data.missing_values_removed,
      duplicate_rows_removed: djangoResponse.data.duplicate_rows_removed,
      outliers_removed: djangoResponse.data.outliers_removed,
      columns_removed: djangoResponse.data.columns_removed,
      cleaning_duration: djangoResponse.data.cleaning_duration,
    };

    await DatasetRepository.updateDatasetVersion(
      datasetVersion._id,
      {
        cleaned_file_path:
          djangoResponse.data.cleaned_file_path,

        cleaned_rows:
          djangoResponse.data.rows,

        cleaned_columns:
          djangoResponse.data.columns,

        cleaning_options:
          cleaning_options,

        cleaning_summary:
          cleaningSummary,

        processing_status:
          djangoResponse.data.processing_status,
      }
    );

    return {
      version: await DatasetRepository.getLatestDatasetVersion(dataset_id),
      cleaning_summary: cleaningSummary,
      cleaned_file_path: djangoResponse.data.cleaned_file_path,
    };
  }

  // Preview Dataset Cleaning
  async previewCleanDataset(userId, cleaningData) {
    const {
      dataset_id,
      version,
      cleaning_options,
    } = cleaningData;

    // Verify Dataset
    const dataset = await DatasetRepository.getDatasetById(dataset_id);
    if (!dataset) {
      const error = new Error("Dataset not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Project
    const project = await ProjectRepository.getProjectById(dataset.project_id);
    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Workspace Ownership
    const workspace = await WorkspaceRepository.getWorkspaceById(
      project.workspace_id,
      userId
    );
    if (!workspace) {
      const error = new Error("Access denied.");
      error.statusCode = 403;
      throw error;
    }

    const djangoResponse = await DjangoDatasetService.previewCleanDataset(
      dataset_id,
      version || dataset.current_version || 1,
      cleaning_options
    );

    return djangoResponse.data;
  }


  // ===========================================
  // Feature Engineering
  // ===========================================
  async featureEngineering(userId, featureData) {
    const {
      dataset_id,
      version,
      feature_engineering_options,
      target_column
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

    // Verify Prerequisites: Validation, Profiling, Cleaning
    if (!datasetVersion.original_file_path) {
      const error = new Error("Dataset Validation must be completed before performing Feature Engineering.");
      error.statusCode = 400;
      throw error;
    }
    if (!datasetVersion.profiling_path) {
      const error = new Error("Dataset Profiling must be completed before performing Feature Engineering.");
      error.statusCode = 400;
      throw error;
    }
    if (!datasetVersion.cleaned_file_path) {
      const error = new Error("Dataset Cleaning must be completed before performing Feature Engineering.");
      error.statusCode = 400;
      throw error;
    }

    // Call Django
    const djangoResponse =
      await DjangoDatasetService.featureEngineering(
        dataset_id,
        version || dataset.current_version || 1,
        feature_engineering_options,
        target_column
      );

    const feSummary = {
      rows_before: djangoResponse.data.rows_before,
      rows_after: djangoResponse.data.rows_after,
      columns_before: djangoResponse.data.columns_before,
      columns_after: djangoResponse.data.columns_after,
      features_generated: djangoResponse.data.features_generated,
      features_removed: djangoResponse.data.features_removed,
      encoded_columns: djangoResponse.data.encoded_columns,
      transformed_columns: djangoResponse.data.transformed_columns,
      execution_duration: djangoResponse.data.execution_duration,
    };

    // Update MongoDB
    await DatasetRepository.updateDatasetVersion(
      datasetVersion._id,
      {
        feature_engineered_file_path:
          djangoResponse.data.feature_engineered_file_path,

        feature_metadata_path:
          djangoResponse.data.feature_metadata_path,

        feature_engineered_rows:
          djangoResponse.data.rows,

        feature_engineered_columns:
          djangoResponse.data.columns,

        feature_engineering_options:
          feature_engineering_options,

        feature_engineering_summary:
          feSummary,

        processing_status:
          djangoResponse.data.processing_status,
      }
    );

    return {
      version: await DatasetRepository.getLatestDatasetVersion(dataset_id),
      feature_engineering_summary: feSummary,
      feature_engineered_file_path: djangoResponse.data.feature_engineered_file_path,
    };
  }

  // Preview Feature Engineering
  async previewFeatureEngineering(userId, featureData) {
    const {
      dataset_id,
      version,
      feature_engineering_options,
      target_column,
    } = featureData;

    // Verify Dataset
    const dataset = await DatasetRepository.getDatasetById(dataset_id);
    if (!dataset) {
      const error = new Error("Dataset not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Project
    const project = await ProjectRepository.getProjectById(dataset.project_id);
    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      throw error;
    }

    // Verify Workspace Ownership
    const workspace = await WorkspaceRepository.getWorkspaceById(
      project.workspace_id,
      userId
    );
    if (!workspace) {
      const error = new Error("Access denied.");
      error.statusCode = 403;
      throw error;
    }

    const djangoResponse = await DjangoDatasetService.previewFeatureEngineering(
      dataset_id,
      version || dataset.current_version || 1,
      feature_engineering_options,
      target_column
    );

    return djangoResponse.data;
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
      await DjangoDatasetService.generateEDA(
        dataset_id,
        version
      );

    // Update MongoDB
    const edaSummary = djangoResponse.data.eda_report?.statistics?.dataset_summary || {};

    await DatasetRepository.updateDatasetVersion(
      datasetVersion._id,
      {
        eda_path: djangoResponse.data.eda_path,
        eda_summary: edaSummary,
        processing_status: djangoResponse.data.processing_status || "eda_completed",
      }
    );

    return {
      version: await DatasetRepository.getLatestDatasetVersion(dataset_id),
      eda_report: djangoResponse.data.eda_report,
      eda_path: djangoResponse.data.eda_path,
    };
  }

  // Get EDA Report
  async getEDA(userId, edaData) {
    const { dataset_id, version } = edaData;

    const dataset = await DatasetRepository.getDatasetById(dataset_id);
    if (!dataset) {
      const error = new Error("Dataset not found.");
      error.statusCode = 404;
      throw error;
    }

    const project = await ProjectRepository.getProjectById(dataset.project_id);
    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      throw error;
    }

    const workspace = await WorkspaceRepository.getWorkspaceById(project.workspace_id, userId);
    if (!workspace) {
      const error = new Error("Access denied.");
      error.statusCode = 403;
      throw error;
    }

    const djangoResponse = await DjangoDatasetService.getEDA(
      dataset_id,
      version || dataset.current_version || 1
    );

    return djangoResponse.data;
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

  // Update Dataset
  async updateDataset(datasetId, userId, updateData) {
    await this.getDatasetById(datasetId, userId);

    return await DatasetRepository.updateDataset(datasetId, updateData);
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

  // Get Column Names for a Dataset from MongoDB metadata or CSV header
  async getDatasetColumns(datasetId) {
    const datasetVersion = await DatasetRepository.getLatestDatasetVersion(datasetId);

    if (!datasetVersion) {
      return { success: false, columns: [] };
    }

    let columns = [];

    // Helper to resolve cross-platform disk paths
    const resolvePath = (p) => {
      if (!p) return null;
      const normalized = String(p).replace(/\\/g, "/");
      if (fs.existsSync(p)) return p;
      if (fs.existsSync(normalized)) return normalized;

      const mediaIdx = normalized.indexOf("media/");
      if (mediaIdx !== -1) {
        const rel = normalized.substring(mediaIdx);
        const cand1 = path.resolve(process.cwd(), "..", "django_backend", rel);
        if (fs.existsSync(cand1)) return cand1;

        const cand2 = path.resolve(process.cwd(), rel);
        if (fs.existsSync(cand2)) return cand2;
      }
      return null;
    };

    // 0. Read from MongoDB datasetVersion column_names if saved
    if (datasetVersion.column_names && Array.isArray(datasetVersion.column_names) && datasetVersion.column_names.length > 0) {
      columns = datasetVersion.column_names;
    }

    // 1. Read from feature_metadata_path (feature_metadata.json)
    if (columns.length === 0 && datasetVersion.feature_metadata_path) {
      const metaPath = resolvePath(datasetVersion.feature_metadata_path);
      if (metaPath) {
        try {
          const raw = fs.readFileSync(metaPath, "utf-8");
          const metadata = JSON.parse(raw);
          if (metadata.engineered_features && metadata.engineered_features.length > 0) {
            columns = metadata.engineered_features;
          } else if (metadata.original_features && metadata.original_features.length > 0) {
            columns = metadata.original_features;
          }
        } catch (e) {
          console.error("Failed to read feature_metadata.json:", e);
        }
      }
    }

    // 2. Read from profiling_path (profiling.json)
    if (columns.length === 0 && datasetVersion.profiling_path) {
      const profPath = resolvePath(datasetVersion.profiling_path);
      if (profPath) {
        try {
          const raw = fs.readFileSync(profPath, "utf-8");
          const prof = JSON.parse(raw);
          if (prof.columns) {
            columns = Object.keys(prof.columns);
          } else if (prof.variables) {
            columns = Object.keys(prof.variables);
          }
        } catch (e) {
          console.error("Failed to read profiling.json:", e);
        }
      }
    }

    // 3. Read from eda_path (eda.json)
    if (columns.length === 0 && datasetVersion.eda_path) {
      const edaPath = resolvePath(datasetVersion.eda_path);
      if (edaPath) {
        try {
          const raw = fs.readFileSync(edaPath, "utf-8");
          const eda = JSON.parse(raw);
          if (eda.outliers?.outlier_summary) {
            columns = Object.keys(eda.outliers.outlier_summary);
          } else if (eda.distribution?.numerical) {
            columns = Object.keys(eda.distribution.numerical);
          }
        } catch (e) {
          console.error("Failed to read eda.json:", e);
        }
      }
    }

    // 4. Read header line directly from available CSV candidate files
    if (columns.length === 0) {
      const candidatePaths = [
        datasetVersion.feature_engineered_file_path,
        datasetVersion.cleaned_file_path,
        datasetVersion.original_file_path,
      ];

      for (const rawP of candidatePaths) {
        if (!rawP) continue;
        const csvPath = resolvePath(rawP);
        if (csvPath && fs.existsSync(csvPath)) {
          try {
            const content = fs.readFileSync(csvPath, "utf-8");
            const firstLine = content.split(/\r?\n/)[0];
            if (firstLine) {
              const parsed = firstLine.split(",").map(c => c.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
              if (parsed.length > 0) {
                columns = parsed;
                break;
              }
            }
          } catch (e) {
            console.error("Failed reading CSV header:", e);
          }
        }
      }
    }

    return {
      success: true,
      columns: columns,
      target_column: datasetVersion.target_column || (columns.length > 0 ? columns[columns.length - 1] : null)
    };
  }

  // Get Column Names by Dataset Version ID (GET /api/datasets/versions/:datasetVersionId/columns)
  async getDatasetVersionColumns(userId, datasetVersionId) {
    const datasetVersion = await DatasetRepository.getDatasetVersionById(datasetVersionId);
    if (!datasetVersion) {
      const error = new Error("Dataset version not found.");
      error.statusCode = 404;
      throw error;
    }

    let columns = [];

    // Helper to resolve cross-platform disk paths
    const resolvePath = (p) => {
      if (!p) return null;
      const normalized = String(p).replace(/\\/g, "/");
      if (fs.existsSync(p)) return p;
      if (fs.existsSync(normalized)) return normalized;

      const mediaIdx = normalized.indexOf("media/");
      if (mediaIdx !== -1) {
        const rel = normalized.substring(mediaIdx);
        const cand1 = path.resolve(process.cwd(), "..", "django_backend", rel);
        if (fs.existsSync(cand1)) return cand1;
        const cand2 = path.resolve(process.cwd(), rel);
        if (fs.existsSync(cand2)) return cand2;
      }
      return null;
    };

    // 0. Read from MongoDB datasetVersion column_names if saved
    if (datasetVersion.column_names && Array.isArray(datasetVersion.column_names) && datasetVersion.column_names.length > 0) {
      columns = datasetVersion.column_names;
    }

    // 1. Read from feature_metadata_path (feature_metadata.json)
    if (columns.length === 0 && datasetVersion.feature_metadata_path) {
      const metaPath = resolvePath(datasetVersion.feature_metadata_path);
      if (metaPath) {
        try {
          const raw = fs.readFileSync(metaPath, "utf-8");
          const metadata = JSON.parse(raw);
          columns = metadata.engineered_features || metadata.original_features || [];
        } catch (e) {
          console.error("Failed to read feature_metadata.json:", e);
        }
      }
    }

    // 2. Read from profiling_path (profiling.json)
    if (columns.length === 0 && datasetVersion.profiling_path) {
      const profPath = resolvePath(datasetVersion.profiling_path);
      if (profPath) {
        try {
          const raw = fs.readFileSync(profPath, "utf-8");
          const prof = JSON.parse(raw);
          if (prof.columns) columns = Object.keys(prof.columns);
          else if (prof.variables) columns = Object.keys(prof.variables);
        } catch (e) {
          console.error("Failed to read profiling.json:", e);
        }
      }
    }

    // 3. Read header line directly from available CSV candidate files
    if (columns.length === 0) {
      const candidatePaths = [
        datasetVersion.feature_engineered_file_path,
        datasetVersion.cleaned_file_path,
        datasetVersion.original_file_path,
      ];

      for (const rawP of candidatePaths) {
        if (!rawP) continue;
        const csvPath = resolvePath(rawP);
        if (csvPath && fs.existsSync(csvPath)) {
          try {
            const content = fs.readFileSync(csvPath, "utf-8");
            const firstLine = content.split(/\r?\n/)[0];
            if (firstLine) {
              const parsed = firstLine.split(",").map(c => c.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
              if (parsed.length > 0) {
                columns = parsed;
                break;
              }
            }
          } catch (e) {
            console.error("Failed reading CSV header:", e);
          }
        }
      }
    }

    return {
      success: true,
      columns,
    };
  }
}

export default new DatasetService();