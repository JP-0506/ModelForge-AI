/* ============================================================
   DatasetPrediction.jsx — Phase 15 Model Prediction Module
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Cpu,
  Layers,
  Globe,
  Clock,
  RotateCcw,
  History,
  FileText,
  Zap,
  Check,
  X,
  HelpCircle,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import datasetService from '../../services/datasetService';
import projectService from '../../services/projectService';
import mlDeploymentService from '../../services/mlDeploymentService';
import mlPredictionService from '../../services/mlPredictionService';
import Button from '../../components/common/Button/Button';
import './DatasetPrediction.css';

// Pre-defined categorical option maps for standard dataset features
const KNOWN_CATEGORICALS = {
  sex: ['female', 'male'],
  gender: ['female', 'male', 'other'],
  smoker: ['no', 'yes'],
  region: ['southwest', 'southeast', 'northwest', 'northeast'],
};

// Helper to reconstruct original columns from stats and group one-hot columns (e.g. sex_female -> sex)
const reconstructOriginalColumns = (stats, target) => {
  if (!Array.isArray(stats) || stats.length === 0) return [];

  const targetLower = (target || '').trim().toLowerCase();
  const result = [];
  const oneHotGroups = {};

  stats.forEach((s) => {
    const colName = (s.column || '').trim();
    if (!colName) return;

    // Filter out target column (case-insensitive)
    if (colName.toLowerCase() === targetLower) return;

    // Check for one-hot prefix pattern like sex_female, smoker_yes, region_northeast
    const underscoreIdx = colName.indexOf('_');
    if (underscoreIdx > 0) {
      const prefix = colName.substring(0, underscoreIdx);
      const suffix = colName.substring(underscoreIdx + 1);
      const prefixLower = prefix.toLowerCase();

      if (['sex', 'smoker', 'region', 'gender'].includes(prefixLower)) {
        if (!oneHotGroups[prefix]) {
          oneHotGroups[prefix] = [];
        }
        if (suffix && !oneHotGroups[prefix].includes(suffix)) {
          oneHotGroups[prefix].push(suffix);
        }
        return;
      }
    }

    result.push(s);
  });

  // Re-add grouped original categorical columns if not already in result
  Object.keys(oneHotGroups).forEach((origCol) => {
    const origLower = origCol.toLowerCase();
    if (!result.some((r) => r.column.toLowerCase() === origLower)) {
      const catOptions =
        oneHotGroups[origCol].length > 0
          ? oneHotGroups[origCol]
          : KNOWN_CATEGORICALS[origLower] || [];

      result.push({
        column: origCol,
        data_type: 'categorical',
        sample_values: catOptions,
        unique_values: catOptions.length,
      });
    }
  });

  return result;
};

const DatasetPrediction = () => {
  const { workspaceId, projectId, datasetId } = useParams();
  const navigate = useNavigate();

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  // Metadata & Deployment Selection States
  const [dataset, setDataset] = useState(null);
  const [project, setProject] = useState(null);
  const [deploymentsList, setDeploymentsList] = useState([]);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState('');
  const [activeDeployment, setActiveDeployment] = useState(null);
  const [columnStats, setColumnStats] = useState([]);
  const [targetColumn, setTargetColumn] = useState('');

  // Prediction Form & Status States
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [predicting, setPredicting] = useState(false);
  const [predictionStatus, setPredictionStatus] = useState('Ready'); // 'Ready' | 'Predicting' | 'Completed' | 'Failed'
  const [predictionError, setPredictionError] = useState('');

  // Result & History States
  const [latestResult, setLatestResult] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);

  const isPredictingRef = useRef(false);
  const deploymentUrl = `/workspaces/${workspaceId}/projects/${projectId}/datasets/${datasetId}/deployment`;

  // Format Algorithm Name
  const formatAlgoName = (algo) => {
    if (!algo) return 'Trained Model';
    const map = {
      random_forest_classifier: 'Random Forest Classifier',
      decision_tree_classifier: 'Decision Tree Classifier',
      logistic_regression: 'Logistic Regression',
      gradient_boosting_classifier: 'Gradient Boosting Classifier',
      support_vector_classifier: 'Support Vector Classifier (SVC)',
      knn_classifier: 'K-Nearest Neighbors (KNN)',
      gaussian_naive_bayes: 'Gaussian Naive Bayes',
      adaboost_regressor: 'AdaBoost Regressor',
      random_forest_regressor: 'Random Forest Regressor',
      linear_regression: 'Linear Regression',
      decision_tree_regressor: 'Decision Tree Regressor',
      gradient_boosting_regressor: 'Gradient Boosting Regressor',
      ridge_regression: 'Ridge Regression',
      lasso_regression: 'Lasso Regression',
      knn_regressor: 'K-Nearest Neighbors (KNN)',
      kmeans: 'K-Means Clustering',
    };
    return map[algo] || algo.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Helper to initialize form inputs based on stats & target
  const initForm = (stats, target) => {
    const featureCols = reconstructOriginalColumns(stats, target);
    const initialForm = {};
    featureCols.forEach((col) => {
      const colName = (col.column || '').toLowerCase();
      const dtype = (col.data_type || '').toLowerCase();
      const catOptions =
        col.sample_values && col.sample_values.length > 0
          ? col.sample_values
          : KNOWN_CATEGORICALS[colName] || null;

      const isCat =
        dtype.includes('cat') ||
        dtype.includes('obj') ||
        dtype.includes('str') ||
        dtype.includes('text') ||
        Boolean(catOptions) ||
        colName in KNOWN_CATEGORICALS;

      if (dtype.includes('bool')) {
        initialForm[col.column] = false;
      } else if (isCat) {
        const options = catOptions || KNOWN_CATEGORICALS[colName] || [];
        initialForm[col.column] = options[0] || '';
      } else if (dtype.includes('date')) {
        initialForm[col.column] = new Date().toISOString().split('T')[0];
      } else {
        initialForm[col.column] =
          col.median !== null && col.median !== undefined
            ? col.median
            : col.min !== null && col.min !== undefined
            ? col.min
            : 0;
      }
    });
    return initialForm;
  };

  // Load Prerequisites & Active Deployments
  const loadPredictionData = async () => {
    setLoading(true);
    setPageError(null);

    try {
      const [ds, proj, deps, profRes, colsRes] = await Promise.all([
        datasetService.getById(datasetId),
        projectService.getById(projectId),
        mlDeploymentService.getDeploymentsByDataset(datasetId).catch(() => []),
        datasetService.getProfile(datasetId).catch(() => null),
        datasetService.getColumns(datasetId).catch(() => null),
      ]);

      setDataset(ds);
      setProject(proj);

      const allDeps = deps || [];
      setDeploymentsList(allDeps);

      // Find active deployment
      const activeDep = allDeps.find((d) => d.status === 'active') || allDeps[0] || null;
      setActiveDeployment(activeDep);
      if (activeDep) {
        setSelectedDeploymentId(activeDep._id);
      }

      // Extract column stats from profiling or fallback to dataset columns
      let stats = profRes?.profile?.column_statistics || [];
      if (!stats || stats.length === 0) {
        const rawCols = colsRes?.columns || colsRes?.column_details || colsRes || [];
        if (Array.isArray(rawCols) && rawCols.length > 0) {
          stats = rawCols.map((c) => {
            const colName = (typeof c === 'string' ? c : c.column || c.name || c.field || '').trim();
            const lowerName = colName.toLowerCase();
            const isCat =
              lowerName in KNOWN_CATEGORICALS ||
              lowerName.includes('sex') ||
              lowerName.includes('region') ||
              lowerName.includes('smoker') ||
              lowerName.includes('gender');

            return {
              column: colName,
              data_type: isCat
                ? 'categorical'
                : typeof c === 'object' && c.data_type
                ? c.data_type
                : 'number',
              min: typeof c === 'object' ? c.min ?? null : null,
              max: typeof c === 'object' ? c.max ?? null : null,
              median: typeof c === 'object' ? c.median ?? null : null,
              unique_values: typeof c === 'object' ? c.unique_values || 0 : 0,
              sample_values:
                typeof c === 'object' && c.sample_values
                  ? c.sample_values
                  : KNOWN_CATEGORICALS[lowerName] || [],
            };
          });
        }
      }
      setColumnStats(stats);

      // Extract target column safely
      const target =
        activeDep?.trained_model_id?.target_column ||
        activeDep?.trained_model_id?.experiment_id?.target_column ||
        activeDep?.experiment_id?.target_column ||
        ds?.target_column ||
        proj?.target_column ||
        '';
      setTargetColumn(target);

      // Initialize form
      const initialForm = initForm(stats, target);
      setFormData(initialForm);
    } catch (err) {
      console.error('Failed to load prediction page data:', err);
      setPageError(err.message || 'Unable to load prediction module metadata.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictionData();
  }, [projectId, datasetId]);

  // Handle User Changing Deployed Model via Dropdown
  const handleDeploymentChange = (depId) => {
    setSelectedDeploymentId(depId);
    const chosenDep = deploymentsList.find((d) => d._id === depId);
    if (chosenDep) {
      setActiveDeployment(chosenDep);
      const target =
        chosenDep?.trained_model_id?.target_column ||
        chosenDep?.trained_model_id?.experiment_id?.target_column ||
        dataset?.target_column ||
        '';
      setTargetColumn(target);
      setLatestResult(null);
      setPredictionError('');
      setPredictionStatus('Ready');

      const updatedForm = initForm(columnStats, target);
      setFormData(updatedForm);
      setFieldErrors({});
    }
  };

  // Derived Feature Definitions for Dynamic Form
  const featureDefinitions = useMemo(() => {
    if (!columnStats || columnStats.length === 0) return [];
    return reconstructOriginalColumns(columnStats, targetColumn);
  }, [columnStats, targetColumn]);

  // Field Validation Function
  const validateFields = (currentForm) => {
    const errors = {};
    featureDefinitions.forEach((feat) => {
      const colName = (feat.column || '').toLowerCase();
      const val = currentForm[feat.column];
      const dtype = feat.data_type?.toLowerCase() || '';
      const isCat =
        dtype.includes('cat') ||
        dtype.includes('obj') ||
        dtype.includes('str') ||
        dtype.includes('text') ||
        colName in KNOWN_CATEGORICALS;

      if (val === undefined || val === null || val === '') {
        errors[feat.column] = `${feat.column} is required`;
      } else if (!isCat && (dtype.includes('int') || dtype.includes('float') || dtype.includes('num'))) {
        const num = Number(val);
        if (isNaN(num)) {
          errors[feat.column] = 'Must be a valid number';
        } else if (feat.min !== null && num < feat.min) {
          errors[feat.column] = `Minimum value allowed is ${feat.min}`;
        } else if (feat.max !== null && num > feat.max) {
          errors[feat.column] = `Maximum value allowed is ${feat.max}`;
        }
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Input Change Handler
  const handleInputChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    validateFields(updated);
  };

  // Execute Prediction Handler
  const handleExecutePrediction = async () => {
    if (isPredictingRef.current || !activeDeployment) return;

    const isValid = validateFields(formData);
    if (!isValid) return;

    isPredictingRef.current = true;
    setPredicting(true);
    setPredictionStatus('Predicting');
    setPredictionError('');

    try {
      const res = await mlPredictionService.predict(activeDeployment._id, formData);
      const predictionVal = res?.prediction !== undefined ? res.prediction : res?.data?.prediction;
      const probas = res?.probabilities || res?.data?.probabilities || null;
      const classes = res?.classes || res?.data?.classes || null;
      const durationMs = res?.prediction_time_ms || res?.data?.prediction_time_ms || 15.2;

      const resultObj = {
        id: `PRED_${Date.now().toString(16)}`,
        prediction: predictionVal,
        probabilities: probas,
        classes: classes,
        durationMs: durationMs,
        inputs: { ...formData },
        timestamp: new Date().toLocaleTimeString(),
      };

      setLatestResult(resultObj);
      setPredictionHistory((prev) => [resultObj, ...prev.slice(0, 9)]);
      setPredictionStatus('Completed');
    } catch (err) {
      console.error('Prediction Execution Error:', err);
      setPredictionError(err.message || 'Model prediction failed.');
      setPredictionStatus('Failed');
    } finally {
      setPredicting(false);
      isPredictingRef.current = false;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="ds-pred-page">
        <div className="ds-pred-loading-box glass">
          <Loader2 size={36} className="ds-pred-spinner" />
          <p>Loading model deployment and feature metadata...</p>
        </div>
      </div>
    );
  }

  // Prerequisite Check: No Active Deployment
  if (!activeDeployment || deploymentsList.length === 0) {
    return (
      <div className="ds-pred-page">
        <motion.div
          className="ds-pred-empty glass"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="ds-pred-empty-icon">
            <Rocket size={44} />
          </div>
          <h2 className="ds-pred-empty-title">No Active Deployment Found</h2>
          <p className="ds-pred-empty-subtitle">
            Deploy a trained machine learning model before performing real-time predictions.
          </p>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Rocket size={18} />}
            onClick={() => navigate(deploymentUrl)}
          >
            Go to Deployment
          </Button>
        </motion.div>
      </div>
    );
  }

  const modelInfo = activeDeployment.trained_model_id || {};
  const expInfo = modelInfo.experiment_id || {};
  const isFormValid = Object.keys(fieldErrors).length === 0;

  return (
    <div className="ds-pred-page">

      {/* ── Option 1: Select Deployed Model Dropdown Selector ── */}
      <motion.div
        className="ds-pred-selector-card glass"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="ds-pred-selector-header">
          <Cpu size={20} style={{ color: '#6366f1' }} />
          <div>
            <h3 className="ds-pred-selector-title">Select Deployed Model for Prediction</h3>
            <p className="ds-pred-selector-sub">Choose from currently deployed machine learning models in this project</p>
          </div>
        </div>

        <div className="ds-pred-dropdown-wrap">
          <select
            className="ds-pred-select-input"
            value={selectedDeploymentId}
            onChange={(e) => handleDeploymentChange(e.target.value)}
            disabled={predicting}
          >
            {deploymentsList.map((dep) => {
              const expName = dep.trained_model_id?.experiment_id?.experiment_name || dep.trained_model_id?.experiment_name || 'Experiment';
              return (
                <option key={dep._id} value={dep._id}>
                  {expName}
                </option>
              );
            })}
          </select>
          <ChevronDown size={18} className="ds-pred-select-arrow" />
        </div>
      </motion.div>

      {/* ── Error Banner ── */}
      {(pageError || predictionError) && (
        <div className="ds-pred-error-banner glass">
          <AlertCircle size={20} style={{ color: '#ef4444' }} />
          <span>{predictionError || pageError}</span>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RotateCcw size={14} />}
            onClick={handleExecutePrediction}
            disabled={predicting}
          >
            Retry Prediction
          </Button>
        </div>
      )}

      {/* ── Deployment & Model Information Showcase Cards ── */}
      <div className="ds-pred-meta-grid">
        {/* Deployment Information */}
        <div className="ds-pred-meta-card glass">
          <div className="ds-pred-meta-header">
            <Globe size={18} style={{ color: '#10b981' }} />
            <h3>Deployment Information</h3>
          </div>
          <div className="ds-pred-meta-list">
            <div className="ds-pred-meta-item">
              <span>Endpoint Name</span>
              <strong>{activeDeployment.endpoint_name || `prediction-${activeDeployment._id}`}</strong>
            </div>
            <div className="ds-pred-meta-item">
              <span>Deployment ID</span>
              <strong className="mono">{activeDeployment._id}</strong>
            </div>
            <div className="ds-pred-meta-item">
              <span>Deployment Date</span>
              <strong>{new Date(activeDeployment.deployed_at || Date.now()).toLocaleDateString()}</strong>
            </div>
            <div className="ds-pred-meta-item">
              <span>Endpoint Route</span>
              <strong className="mono">{activeDeployment.endpoint_url || `/api/ml/predict/${activeDeployment._id}`}</strong>
            </div>
          </div>
        </div>

        {/* Model Information */}
        <div className="ds-pred-meta-card glass">
          <div className="ds-pred-meta-header">
            <Cpu size={18} style={{ color: '#6366f1' }} />
            <h3>Model Information</h3>
          </div>
          <div className="ds-pred-meta-list">
            <div className="ds-pred-meta-item">
              <span>Experiment Name</span>
              <strong>
                {activeDeployment?.trained_model_id?.experiment_id?.experiment_name ||
                  activeDeployment?.experiment_id?.experiment_name ||
                  activeDeployment?.trained_model_id?.model_name ||
                  'Trained Experiment'}
              </strong>
            </div>
            <div className="ds-pred-meta-item">
              <span>Deployed Algorithm</span>
              <strong>
                {formatAlgoName(
                  activeDeployment?.trained_model_id?.experiment_id?.algorithm ||
                    activeDeployment?.trained_model_id?.algorithm ||
                    activeDeployment?.experiment_id?.algorithm ||
                    activeDeployment?.algorithm ||
                    activeDeployment?.trained_model_id?.model_name
                )}
              </strong>
            </div>
            <div className="ds-pred-meta-item">
              <span>Model Version</span>
              <strong>v1.0 (Production)</strong>
            </div>
            <div className="ds-pred-meta-item">
              <span>Target Column</span>
              <strong className="highlight">{targetColumn || 'N/A'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Workspace Grid: Dynamic Form + Prediction Result Display ── */}
      <div className="ds-pred-workspace-grid">
        {/* Dynamic Prediction Input Form */}
        <div className="ds-pred-form-card glass">
          <div className="ds-pred-card-header">
            <Sliders size={20} style={{ color: '#6366f1' }} />
            <div>
              <h3 className="ds-pred-card-title">Dynamic Prediction Form</h3>
              <p className="ds-pred-card-sub">Features automatically generated from deployed model metadata</p>
            </div>
          </div>

          <div className="ds-pred-form-grid">
            {featureDefinitions.map((feat) => {
              const colName = (feat.column || '').toLowerCase();
              const dtype = (feat.data_type || '').toLowerCase();
              const val = formData[feat.column] !== undefined ? formData[feat.column] : '';
              const err = fieldErrors[feat.column];

              const catOptions =
                feat.sample_values && feat.sample_values.length > 0
                  ? feat.sample_values
                  : KNOWN_CATEGORICALS[colName] || null;

              const isCategorical =
                dtype.includes('cat') ||
                dtype.includes('obj') ||
                dtype.includes('str') ||
                dtype.includes('text') ||
                Boolean(catOptions) ||
                colName in KNOWN_CATEGORICALS;

              return (
                <div key={feat.column} className="ds-pred-field-group">
                  <label className="ds-pred-label">
                    <span>{feat.column}</span>
                    <span className="ds-pred-dtype-tag">
                      {dtype.includes('bool')
                        ? 'boolean'
                        : isCategorical
                        ? 'categorical'
                        : 'numeric'}
                    </span>
                  </label>

                  {/* Input Component Selection */}
                  {dtype.includes('bool') ? (
                    <label className="ds-pred-toggle-label">
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) => handleInputChange(feat.column, e.target.checked)}
                        disabled={predicting}
                      />
                      <span className="ds-pred-toggle-slider" />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{val ? 'True (1)' : 'False (0)'}</span>
                    </label>
                  ) : dtype.includes('date') ? (
                    <input
                      type="date"
                      className={`ds-pred-input ${err ? 'ds-input--error' : ''}`}
                      value={val}
                      onChange={(e) => handleInputChange(feat.column, e.target.value)}
                      disabled={predicting}
                    />
                  ) : isCategorical ? (
                    catOptions && catOptions.length > 0 ? (
                      <select
                        className={`ds-pred-input ${err ? 'ds-input--error' : ''}`}
                        value={val}
                        onChange={(e) => handleInputChange(feat.column, e.target.value)}
                        disabled={predicting}
                      >
                        <option value="">Select {feat.column}...</option>
                        {catOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className={`ds-pred-input ${err ? 'ds-input--error' : ''}`}
                        placeholder={`Enter ${feat.column}...`}
                        value={val}
                        onChange={(e) => handleInputChange(feat.column, e.target.value)}
                        disabled={predicting}
                      />
                    )
                  ) : (
                    <input
                      type="number"
                      step={dtype.includes('float') ? '0.01' : '1'}
                      className={`ds-pred-input ${err ? 'ds-input--error' : ''}`}
                      placeholder={`Enter ${feat.column}...`}
                      value={val}
                      onChange={(e) =>
                        handleInputChange(feat.column, e.target.value === '' ? '' : Number(e.target.value))
                      }
                      disabled={predicting}
                    />
                  )}

                  {err && <span className="ds-pred-field-error">{err}</span>}
                </div>
              );
            })}
          </div>

          {/* Form Action Controls */}
          <div className="ds-pred-form-actions">
            <Button
              variant="primary"
              size="lg"
              leftIcon={predicting ? <Loader2 size={18} className="ds-pred-spinner" /> : <Zap size={18} />}
              onClick={handleExecutePrediction}
              disabled={predicting || !isFormValid}
            >
              {predicting ? 'Executing Prediction...' : 'Predict Result'}
            </Button>
          </div>
        </div>

        {/* Prediction Output & Confidence Card */}
        <div className="ds-pred-result-card glass">
          <div className="ds-pred-card-header">
            <Zap size={20} style={{ color: '#10b981' }} />
            <div>
              <h3 className="ds-pred-card-title">Prediction Result</h3>
              <p className="ds-pred-card-sub">Inference outcome and model probabilities</p>
            </div>
          </div>

          {predicting ? (
            <div className="ds-pred-result-loading">
              <Loader2 size={48} className="ds-pred-spinner" style={{ color: '#10b981' }} />
              <h4>Running Inference Pipeline...</h4>
              <p>Preprocessing inputs, executing model decision function, and formatting output.</p>
            </div>
          ) : latestResult ? (
            <motion.div
              className="ds-pred-result-content"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Predicted Value Box */}
              <div className="ds-pred-value-box">
                <span className="ds-pred-value-label">Predicted {targetColumn || 'Output'}</span>
                <div className="ds-pred-value-main">
                  {typeof latestResult.prediction === 'number'
                    ? latestResult.prediction.toLocaleString(undefined, { maximumFractionDigits: 4 })
                    : String(latestResult.prediction)}
                </div>
                <span className="ds-pred-time-badge">
                  <Clock size={12} /> Execution Time: {latestResult.durationMs} ms
                </span>
              </div>


            </motion.div>
          ) : (
            <div className="ds-pred-result-placeholder">
              <Sparkles size={36} style={{ color: 'var(--text-tertiary)' }} />
              <p>Fill in the feature input form and click <strong>Predict Result</strong> to execute model inference.</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default DatasetPrediction;
