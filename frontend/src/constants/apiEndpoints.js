/* ============================================================
   API Endpoint Constants
   ============================================================ */

// Base URL from environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ── Auth ──
export const AUTH = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh-token',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  VERIFY_EMAIL: '/api/auth/verify-email',
};

// ── User / Profile ──
export const USER = {
  PROFILE: '/api/users/profile',
  UPDATE_PROFILE: '/api/users/profile',
  CHANGE_PASSWORD: '/api/users/change-password',
  DELETE_ACCOUNT: '/api/users/profile',
};

// ── Workspaces ──
export const WORKSPACE = {
  LIST: '/api/workspaces',
  CREATE: '/api/workspaces',
  GET: (id) => `/api/workspaces/${id}`,
  UPDATE: (id) => `/api/workspaces/${id}`,
  DELETE: (id) => `/api/workspaces/${id}`,
  ANALYTICS: (id) => `/api/workspaces/${id}/analytics`,
};

// ── Projects ──
export const PROJECT = {
  LIST: (workspaceId) => `/api/projects/workspace/${workspaceId}`,
  CREATE: `/api/projects`,
  GET: (projectId) => `/api/projects/${projectId}`,
  UPDATE: (projectId) => `/api/projects/${projectId}`,
  DELETE: (projectId) => `/api/projects/${projectId}`,
};

// ── Datasets ──
export const DATASET = {
  LIST: (projectId) => `/api/datasets/project/${projectId}`,
  UPLOAD: (projectId) => `/api/datasets/upload/${projectId}`,
  GET: (datasetId) => `/api/datasets/${datasetId}`,
  DELETE: (datasetId) => `/api/datasets/${datasetId}`,
  VALIDATE: (datasetId) => `/api/datasets/${datasetId}/validate`,
  PROFILE: (datasetId) => `/api/datasets/${datasetId}/profile`,
  CLEAN: (datasetId) => `/api/datasets/${datasetId}/clean`,
  FEATURE_ENGINEER: (datasetId) => `/api/datasets/${datasetId}/feature-engineer`,
  EDA: (datasetId) => `/api/datasets/${datasetId}/eda`,
};

// ── ML Training ──
export const ML = {
  TRAIN: (datasetId) => `/api/training/${datasetId}/train`,
  EXPERIMENTS: (datasetId) => `/api/training/${datasetId}/experiments`,
  EXPERIMENT: (experimentId) => `/api/training/experiments/${experimentId}`,
  COMPARE: '/api/ml/comparison',
  DEPLOY: (modelId) => `/api/ml/deployment/${modelId}/deploy`,
  DEPLOYMENTS: '/api/ml/deployment',
  PREDICT: (deploymentId) => `/api/ml/predict/${deploymentId}`,
  REPORTS: (projectId) => `/api/ml/report/${projectId}`,
};

// ── Dashboard ──
export const DASHBOARD = {
  STATS: '/api/users/dashboard/stats',
  RECENT_ACTIVITY: '/api/users/dashboard/activity',
};

export default {
  AUTH,
  USER,
  WORKSPACE,
  PROJECT,
  DATASET,
  ML,
  DASHBOARD,
};
