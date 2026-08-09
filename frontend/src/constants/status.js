/* ============================================================
   Status Constants
   ============================================================ */

export const PROJECT_STATUS = {
  ACTIVE:     'active',
  ARCHIVED:   'archived',
  DRAFT:      'draft',
};

export const DATASET_STATUS = {
  UPLOADED:    'uploaded',
  VALIDATING:  'validating',
  VALIDATED:   'validated',
  PROFILING:   'profiling',
  PROFILED:    'profiled',
  CLEANING:    'cleaning',
  CLEANED:     'cleaned',
  PROCESSING:  'processing',
  READY:       'ready',
  ERROR:       'error',
};

export const EXPERIMENT_STATUS = {
  PENDING:   'pending',
  RUNNING:   'running',
  COMPLETED: 'completed',
  FAILED:    'failed',
  CANCELLED: 'cancelled',
};

export const DEPLOYMENT_STATUS = {
  ACTIVE:   'active',
  INACTIVE: 'inactive',
  PENDING:  'pending',
  FAILED:   'failed',
};

export const PROBLEM_TYPE = {
  CLASSIFICATION: 'classification',
  REGRESSION:     'regression',
  CLUSTERING:     'clustering',
};

// Status → badge variant mapper
export const getStatusVariant = (status) => {
  const map = {
    active: 'success', completed: 'success', validated: 'success',
    cleaned: 'success', ready: 'success', profiled: 'success',
    running: 'primary', processing: 'primary', validating: 'primary',
    profiling: 'primary', cleaning: 'primary', pending: 'warning',
    uploaded: 'warning', draft: 'neutral',
    error: 'error', failed: 'error', cancelled: 'error',
    inactive: 'neutral', archived: 'neutral',
  };
  return map[status] || 'neutral';
};

export default {
  PROJECT_STATUS,
  DATASET_STATUS,
  EXPERIMENT_STATUS,
  DEPLOYMENT_STATUS,
  PROBLEM_TYPE,
  getStatusVariant,
};
