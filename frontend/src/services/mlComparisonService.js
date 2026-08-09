import api from './api';

const mlComparisonService = {
  /**
   * Compare all trained models for a project
   * @param {string} projectId 
   */
  compareModels: async (projectId) => {
    const response = await api.post('/api/ml/comparison/compare', {
      project_id: projectId,
    });
    return response.data?.data || response.data;
  },

  /**
   * Export PDF report for model comparison
   * @param {object} reportData 
   * @param {string} projectName 
   */
  exportComparisonReport: async (reportData, projectName = 'project') => {
    const response = await api.post(
      '/api/ml/report/generate',
      {
        report_type: 'comparison',
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
    link.download = `model_comparison_report_${projectName}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default mlComparisonService;
