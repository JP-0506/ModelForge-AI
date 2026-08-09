import api from './api';

const BASE = '/api/training';

const mlTrainingService = {
  // Train Model
  trainModel: async (trainingData) => {
    const response = await api.post(`${BASE}/train`, trainingData);
    return response.data.data;
  },

  // Get Experiments by Project
  getExperimentsByProject: async (projectId) => {
    const response = await api.get(
      `${BASE}/experiments/project/${projectId}`
    );

    return response.data.data || [];
  },

  // Get Experiments by Dataset
  getExperimentsByDataset: async (datasetId) => {
    const response = await api.get(
      `${BASE}/experiments/dataset/${datasetId}`
    );

    return response.data.data || [];
  },

  // Get Experiment by ID
  getExperimentById: async (experimentId) => {
    const response = await api.get(
      `${BASE}/experiments/${experimentId}`
    );

    return response.data.data;
  },

  // Export Report
  exportTrainingReport: async (
    experimentId,
    experimentName = "model"
  ) => {
    const response = await api.post(
      "/api/ml/report/generate",
      {
        report_type: "training",
        experiment_id: experimentId,
      },
      {
        responseType: "blob",
      }
    );

    const blob = new Blob(
      [response.data],
      {
        type: "application/pdf",
      }
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `training_report_${experimentName}.pdf`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  },

  // Delete Trained Model (Soft Delete)
  deleteTrainedModel: async (id) => {
    const response = await api.delete(`${BASE}/models/${id}`);
    return response.data;
  },
};

export default mlTrainingService;