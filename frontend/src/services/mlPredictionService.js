import api from './api';

const mlPredictionService = {
  /**
   * Execute machine learning prediction on active deployment
   * @param {string} deploymentId 
   * @param {object} features 
   */
  predict: async (deploymentId, features) => {
    const response = await api.post(`/api/ml/predict/${deploymentId}`, {
      features,
    });
    return response.data?.data || response.data;
  },
};

export default mlPredictionService;
