import axios from "axios";
import FormData from "form-data";

class DjangoDatasetService {
  constructor() {
    this.baseURL = process.env.DJANGO_API_URL;
  }

  // ==============================
  // Upload Dataset
  // ==============================
  async uploadDataset(uploadedFile, datasetId, version = 1) {
    try {
      const formData = new FormData();

      formData.append("file", uploadedFile.buffer, {
        filename: uploadedFile.originalname,
        contentType: uploadedFile.mimetype,
      });

      formData.append("dataset_id", datasetId.toString());
      formData.append("version", version.toString());

      const response = await axios.post(
        `${this.baseURL}/datasets/upload/`,
        formData,
        {
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      return response.data;

    } catch (error) {

      const err = new Error(
        error.response?.data?.message ||
        "Dataset upload failed."
      );

      err.statusCode = error.response?.status || 500;

      throw err;
    }
  }

  // ==============================
  // Dataset Validation
  // ==============================
  async validateDataset(
    datasetId,
    version,
    datasetType,
  ) {

    const response = await axios.post(
      `${this.baseURL}/datasets/validation/`,
      {
        dataset_id: datasetId,
        version,
        dataset_type: datasetType,
      },
    );

    return response.data;

  }

  // ==============================
  // Dataset Profiling
  // ==============================
  async profileDataset(
    datasetId,
    version = 1
  ) {
    const response = await axios.post(
      `${this.baseURL}/datasets/profile/`,
      {
        dataset_id: datasetId,
        version,
      }
    );

    return response.data;
  }

  // ==============================
  // Data Cleaning
  // ==============================
  async cleanDataset(
    datasetId,
    version,
    cleaningOptions
  ) {
    const response = await axios.post(
      `${this.baseURL}/datasets/clean/`,
      {
        dataset_id: datasetId,
        version,
        cleaning_options: cleaningOptions,
      }
    );

    return response.data;
  }

  async previewCleanDataset(
    datasetId,
    version,
    cleaningOptions
  ) {
    const response = await axios.post(
      `${this.baseURL}/datasets/clean/preview/`,
      {
        dataset_id: datasetId,
        version,
        cleaning_options: cleaningOptions,
      }
    );

    return response.data;
  }


  // ==============================
  // Feature Engineering
  // ==============================
  async featureEngineering(
    datasetId,
    version,
    featureEngineeringOptions,
    targetColumn
  ) {
    const response = await axios.post(
      `${this.baseURL}/datasets/feature-engineering/`,
      {
        dataset_id: datasetId,
        version,
        feature_engineering_options: featureEngineeringOptions,
        target_column: targetColumn
      }
    );

    return response.data;
  }

  async previewFeatureEngineering(
    datasetId,
    version,
    featureEngineeringOptions,
    targetColumn
  ) {
    const response = await axios.post(
      `${this.baseURL}/datasets/feature-engineering/preview/`,
      {
        dataset_id: datasetId,
        version,
        feature_engineering_options: featureEngineeringOptions,
        target_column: targetColumn
      }
    );

    return response.data;
  }


  // ============================== 
  // EDA
  // ==============================
  async generateEDA(
    datasetId,
    version = 1
  ) {
    const response = await axios.post(
      `${this.baseURL}/datasets/eda/`,
      {
        dataset_id: datasetId,
        version,
      }
    );

    return response.data;
  }

  async getEDA(
    datasetId,
    version = 1
  ) {
    const response = await axios.get(
      `${this.baseURL}/datasets/eda/get/`,
      {
        params: {
          dataset_id: datasetId,
          version,
        },
      }
    );

    return response.data;
  }
}




export default new DjangoDatasetService();