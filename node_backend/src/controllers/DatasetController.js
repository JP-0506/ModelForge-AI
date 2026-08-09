import DatasetService from "../services/DatasetService.js";

class DatasetController {
  // Upload New Dataset
  async uploadDataset(req, res, next) {
    try {
      const dataset = await DatasetService.uploadDataset(
        req.user.id,
        {
          ...req.body,
          uploaded_file: req.file,
        }
      );

      return res.status(201).json({
        success: true,
        message: "Dataset uploaded successfully.",
        data: dataset,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // Validate Dataset
  // ==========================================

  async validateDataset(
    request,
    response,
    next,
  ) {
    try {
      const { datasetId } = request.params;
      const { dataset_type } = request.body || {};

      const validation = await DatasetService.validateDataset(
        datasetId,
        dataset_type || "original",
      );

      return response.status(200).json({
        success: true,
        message: "Dataset validation completed successfully.",
        data: validation,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===========================================
  // Dataset Profiling
  // ===========================================
  async profileDataset(req, res, next) {
    try {
      const result =
        await DatasetService.profileDataset(
          req.user.id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message: "Dataset profiled successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Dataset Profile
  async getDatasetProfile(req, res, next) {
    try {
      const result = await DatasetService.getDatasetProfile(
        req.user.id,
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message: "Dataset profile retrieved successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }



  // ===========================================
  // Dataset Cleaning
  // ===========================================
  async cleanDataset(req, res, next) {
    try {
      const result =
        await DatasetService.cleanDataset(
          req.user.id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message: "Dataset cleaned successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async previewCleanDataset(req, res, next) {
    try {
      const result = await DatasetService.previewCleanDataset(
        req.user.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Dataset cleaning preview generated successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }


  // ===========================================
  // Feature Engineering
  // ===========================================
  async featureEngineering(req, res, next) {
    try {
      const result =
        await DatasetService.featureEngineering(
          req.user.id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message:
          "Feature engineering completed successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async previewFeatureEngineering(req, res, next) {
    try {
      const result =
        await DatasetService.previewFeatureEngineering(
          req.user.id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message:
          "Feature engineering preview generated successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }


  // ===========================================
  // EDA
  // ===========================================
  async generateEDA(req, res, next) {
    try {
      const result =
        await DatasetService.generateEDA(
          req.user.id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message: "EDA completed successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEDA(req, res, next) {
    try {
      const result =
        await DatasetService.getEDA(
          req.user.id,
          {
            dataset_id: req.params.id,
            version: req.query.version || 1,
          }
        );

      return res.status(200).json({
        success: true,
        message: "EDA report fetched successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }


  // Upload New Dataset Version
  async uploadDatasetVersion(req, res, next) {
    try {
      const dataset =
        await DatasetService.uploadDatasetVersion(
          req.user.id,
          req.params.id,
          {
            ...req.body,
            uploaded_file: req.file,
          }
        );

      return res.status(201).json({
        success: true,
        message: "Dataset version uploaded successfully.",
        data: dataset,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get All Datasets by Project
  async getDatasetsByProject(req, res, next) {
    try {
      const datasets =
        await DatasetService.getDatasetsByProject(
          req.params.projectId,
          req.user.id
        );

      return res.status(200).json({
        success: true,
        message: "Datasets fetched successfully.",
        data: datasets,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Dataset By ID
  async getDatasetById(req, res, next) {
    try {
      const dataset =
        await DatasetService.getDatasetById(
          req.params.id,
          req.user.id
        );

      return res.status(200).json({
        success: true,
        message: "Dataset fetched successfully.",
        data: dataset,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update Dataset
  async updateDataset(req, res, next) {
    try {
      const dataset =
        await DatasetService.updateDataset(
          req.params.id,
          req.user.id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message: "Dataset updated successfully.",
        data: dataset,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Dataset Version History
  async getDatasetVersions(req, res, next) {
    try {
      const versions =
        await DatasetService.getDatasetVersions(
          req.params.id,
          req.user.id
        );

      return res.status(200).json({
        success: true,
        message:
          "Dataset versions fetched successfully.",
        data: versions,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Column Names for a Dataset
  async getDatasetColumns(req, res, next) {
    try {
      const data = await DatasetService.getDatasetColumns(req.params.id);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Column Names by Dataset Version ID (GET /api/datasets/versions/:datasetVersionId/columns)
  async getDatasetVersionColumns(req, res, next) {
    try {
      const data = await DatasetService.getDatasetVersionColumns(
        req.user.id,
        req.params.datasetVersionId
      );
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }


  // Delete Dataset
  async deleteDataset(req, res, next) {
    try {
      const result =
        await DatasetService.deleteDataset(
          req.params.id,
          req.user.id
        );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DatasetController();
