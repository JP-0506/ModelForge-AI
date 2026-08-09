import api from './api';

const mlDeploymentService = {
  /**
   * Deploy a trained ML model
   * @param {string} projectId 
   * @param {string} trainedModelId 
   */
  deployModel: async (projectId, trainedModelId) => {
    const response = await api.post('/api/ml/deployment', {
      project_id: projectId,
      trained_model_id: trainedModelId,
    });
    return response.data?.data || response.data;
  },

  /**
   * Get all deployments for a project
   * @param {string} projectId 
   */
  getDeploymentsByProject: async (projectId) => {
    const response = await api.get(`/api/ml/deployment/project/${projectId}`);
    return response.data?.data || [];
  },

  /**
   * Get all deployments for a specific dataset
   * @param {string} datasetId
   */
  getDeploymentsByDataset: async (datasetId) => {
    const response = await api.get(`/api/ml/deployment/dataset/${datasetId}`);
    return response.data?.data || [];
  },

  /**
   * Export Deployment Report PDF
   * @param {object} reportData 
   * @param {string} projectName 
   */
  exportDeploymentReport: async (reportData, projectName = 'model') => {
    const response = await api.post(
      '/api/ml/report/generate',
      {
        report_type: 'deployment',
        ...reportData,
      },
      {
        responseType: 'blob',
      }
    );

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deployment_report_${projectName}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Delete deployment (Soft Delete)
   * @param {string} deploymentId 
   */
  deleteDeployment: async (deploymentId) => {
    const response = await api.delete(`/api/ml/deployment/${deploymentId}`);
    return response.data;
  },
};

export default mlDeploymentService;
