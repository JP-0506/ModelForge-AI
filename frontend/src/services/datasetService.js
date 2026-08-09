/* ============================================================
   Dataset Service — API calls for Dataset management
   Endpoints from Node.js backend:
     POST   /api/datasets/upload                  → upload new dataset (multipart)
     GET    /api/datasets/project/:projectId       → list datasets by project
     GET    /api/datasets/:id                      → get single dataset
     GET    /api/datasets/:id/versions             → get version history
     DELETE /api/datasets/:id                      → soft-delete dataset
   Note: dataset_name update uses update() semantics
   ============================================================ */

import api from './api';
import storage from '../utils/storage';

const datasetService = {

  /** List all datasets for a specific project */
  getByProject: async (projectId) => {
    const res = await api.get(`/api/datasets/project/${projectId}`);
    return res.data.data || [];
  },

  /** Get single dataset by ID */
  getById: async (datasetId) => {
    const res = await api.get(`/api/datasets/${datasetId}`);
    return res.data.data;
  },

  /** Get dataset column names from MongoDB version metadata & CSV header */
  getColumns: async (datasetId) => {
    const res = await api.get(`/api/datasets/${datasetId}/columns`);
    return res.data.data;
  },

  /** Validate dataset */
  validateDataset: async (datasetId, datasetType = 'original') => {
    const res = await api.post(`/api/datasets/${datasetId}/validation`, {
      dataset_type: datasetType,
    });
    return res.data.data;
  },


  /**
   * Upload a new dataset (multipart/form-data)
   * formData fields: dataset_name, project_id, dataset (file)
   * onProgress(percent: number) callback for upload progress
   */
  upload: (formData, onProgress) => {
    return new Promise((resolve, reject) => {
      const token = storage.getToken() || '';
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${baseURL}/api/datasets/upload`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        try {
          const body = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(body.data);
          } else {
            reject(new Error(body.message || `Upload failed with status ${xhr.status}`));
          }
        } catch {
          reject(new Error('Invalid server response'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.ontimeout = () => reject(new Error('Upload timed out'));

      xhr.send(formData);
    });
  },

  /**
   * Update dataset name (update)
   */
  update: async (datasetId, body) => {
    const res = await api.put(`/api/datasets/${datasetId}`, body);
    return res.data.data;
  },

  /** Soft-delete dataset */
  delete: async (datasetId) => {
    const res = await api.delete(`/api/datasets/${datasetId}`);
    return res.data;
  },

  /** Get version history for a dataset */
  getVersions: async (datasetId) => {
    const res = await api.get(`/api/datasets/${datasetId}/versions`);
    return res.data.data || [];
  },

  /** Get dataset profile */
  getProfile: async (datasetId) => {
    const res = await api.get(`/api/datasets/${datasetId}/profile`);
    return res.data.data;
  },

  /** Generate dataset profile */
  generateProfile: async (datasetId, version = 1) => {
    const res = await api.post(`/api/datasets/profile`, {
      dataset_id: datasetId,
      version,
    });
    return res.data.data;
  },

  /** Clean dataset */
  clean: async (datasetId, version = 1, cleaningOptions = {}) => {
    const res = await api.post(`/api/datasets/clean`, {
      dataset_id: datasetId,
      version,
      cleaning_options: cleaningOptions,
    });
    return res.data.data;
  },

  /** Preview dataset cleaning estimated changes */
  previewClean: async (datasetId, version = 1, cleaningOptions = {}) => {
    const res = await api.post(`/api/datasets/clean/preview`, {
      dataset_id: datasetId,
      version,
      cleaning_options: cleaningOptions,
    });
    return res.data.data;
  },

  /** Feature engineering */
  featureEngineering: async (datasetId, version = 1, featureEngineeringOptions = {}, targetColumn = null) => {
    const res = await api.post(`/api/datasets/feature-engineering`, {
      dataset_id: datasetId,
      version,
      feature_engineering_options: featureEngineeringOptions,
      target_column: targetColumn,
    });
    return res.data.data;
  },

  /** Preview feature engineering estimated changes */
  previewFeatureEngineering: async (datasetId, version = 1, featureEngineeringOptions = {}, targetColumn = null) => {
    const res = await api.post(`/api/datasets/feature-engineering/preview`, {
      dataset_id: datasetId,
      version,
      feature_engineering_options: featureEngineeringOptions,
      target_column: targetColumn,
    });
    return res.data.data;
  },

  /** Generate EDA */

  generateEDA: async (datasetId, version = 1) => {
    const res = await api.post(`/api/datasets/eda`, {
      dataset_id: datasetId,
      version,
    });
    return res.data.data;
  },

  /** Get EDA Report */
  getEDA: async (datasetId, version = 1) => {
    const res = await api.get(`/api/datasets/${datasetId}/eda`, {
      params: { version },
    });
    return res.data.data;
  },
  getDatasetVersionColumns: async (datasetVersionId) => {
    const res = await api.get(
      `/api/datasets/versions/${datasetVersionId}/columns`
    );

    return res.data.data;
  },

  /** Format file size to human-readable string */
  formatFileSize: (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  },

  /** Get file type display label */
  getFileTypeLabel: (fileType) => {
    if (!fileType) return 'Unknown';
    return fileType.toUpperCase().replace('.', '');
  },

  /** Normalize file type / extension from MIME type or original filename */
  parseFileType: (typeStr, filenameStr) => {
    if (filenameStr && filenameStr.includes('.')) {
      const ext = filenameStr.split('.').pop().toLowerCase();
      if (['csv', 'xlsx', 'xls', 'json'].includes(ext)) return ext;
    }
    if (typeStr) {
      const clean = typeStr.toLowerCase().replace('.', '');
      if (clean.includes('csv')) return 'csv';
      if (clean.includes('json')) return 'json';
      if (clean.includes('excel') || clean.includes('spreadsheetml') || clean.includes('xlsx')) return 'xlsx';
      if (clean.includes('xls')) return 'xls';
      if (!clean.includes('/')) return clean;
    }
    return '';
  },

  /** Get file type color class */
  getFileTypeColor: (fileType) => {
    const type = (fileType || '').toLowerCase().replace('.', '');
    const map = {
      csv: 'ds-type--csv',
      xlsx: 'ds-type--xlsx',
      xls: 'ds-type--xls',
      json: 'ds-type--json',
    };
    return map[type] || 'ds-type--default';
  },

  /** Export Dataset Validation PDF Report */
  exportValidationReport: async (reportData, datasetName = 'dataset') => {
    const response = await api.post(
      '/api/ml/report/generate',
      {
        report_type: 'validation',
        report_data: reportData,
      },
      {
        responseType: 'blob',
      }
    );

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `validation_report_${datasetName}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default datasetService;
