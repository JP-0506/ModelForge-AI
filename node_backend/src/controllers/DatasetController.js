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