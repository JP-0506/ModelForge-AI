/* ============================================================
   DatasetModelTraining.jsx — Model Training & Evaluation Module
   ============================================================ */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  RefreshCw,
  BarChart2,
  TrendingUp,
  Layers,
  History,
  Clock,
  HardDrive,
  Award,
  Zap,
  Target,
  Sliders,
  Trash2,
} from 'lucide-react';

import datasetService from '../../services/datasetService';
import projectService from '../../services/projectService';
import mlTrainingService from '../../services/mlTrainingService';
import useAuth from '../../hooks/useAuth';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import './DatasetModelTraining.css';

// Helper to reconstruct original columns from stats and group one-hot columns (e.g. sex_female -> sex)
const getCleanOriginalColumns = (rawCols) => {
  if (!Array.isArray(rawCols) || rawCols.length === 0) return [];

  const result = [];
  const oneHotPrefixes = new Set();

  rawCols.forEach((col) => {
    const colName = (typeof col === 'string' ? col : col.column || col.name || '').trim();
    if (!colName) return;

    const underscoreIdx = colName.indexOf('_');
    if (underscoreIdx > 0) {
      const prefix = colName.substring(0, underscoreIdx);
      const prefixLower = prefix.toLowerCase();
      if (['sex', 'smoker', 'region', 'gender'].includes(prefixLower)) {
        oneHotPrefixes.add(prefix);
        return;
      }
    }

    if (!result.includes(colName)) {
      result.push(colName);
    }
  });

  // Add back the original categorical column names
  oneHotPrefixes.forEach((origCol) => {
    if (!result.some((c) => c.toLowerCase() === origCol.toLowerCase())) {
      result.push(origCol);
    }
  });

  return result;
};

const DatasetModelTraining = () => {
  const { workspaceId, projectId, datasetId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [dataset, setDataset] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [experimentName, setExperimentName] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [problemType, setProblemType] = useState('classification');
  const [algorithm, setAlgorithm] = useState('random_forest_classifier');
  const [testSize, setTestSize] = useState(0.2);

  // Hyperparameters State per Algorithm
  const DEFAULT_PARAMETERS = {
    adaboost: { n_estimators: 100, learning_rate: 1.0, loss: 'linear', random_state: 42 },
    adaboost_regressor: { n_estimators: 100, learning_rate: 1.0, loss: 'linear', random_state: 42 },
    adaboost_classifier: { n_estimators: 100, learning_rate: 1.0, random_state: 42 },
    random_forest_classifier: { n_estimators: 100, max_depth: 10, random_state: 42 },
    random_forest_regressor: { n_estimators: 100, max_depth: 10, random_state: 42 },
    decision_tree_classifier: { max_depth: 5, random_state: 42 },
    decision_tree_regressor: { max_depth: 5, random_state: 42 },
    logistic_regression: { C: 1.0, max_iter: 100, random_state: 42 },
    linear_regression: { fit_intercept: true },
    gradient_boosting_classifier: { n_estimators: 100, learning_rate: 0.1, max_depth: 3, random_state: 42 },
    gradient_boosting_regressor: { n_estimators: 100, learning_rate: 0.1, max_depth: 3, random_state: 42 },
    support_vector_classifier: { C: 1.0, kernel: 'rbf', random_state: 42 },
    support_vector_regressor: { C: 1.0, kernel: 'rbf' },
    ridge_regression: { alpha: 1.0, random_state: 42 },
    lasso_regression: { alpha: 1.0, random_state: 42 },
    knn_classifier: { n_neighbors: 5 },
    knn_regressor: { n_neighbors: 5 },
    kmeans: { n_clusters: 3, random_state: 42 },
    agglomerative: { n_clusters: 3 },
    dbscan: { eps: 0.5, min_samples: 5 },
    isolation_forest: { n_estimators: 100, contamination: 'auto', random_state: 42 },
    local_outlier_factor: { n_neighbors: 20, contamination: 'auto' },
    one_class_svm: { kernel: 'rbf', nu: 0.1 },
    arima: { p: 1, d: 1, q: 1 },
    sarima: { p: 1, d: 1, q: 1, s: 12 },
    prophet: { seasonality_mode: 'additive' },
  };

  const [parameters, setParameters] = useState({ n_estimators: 100, max_depth: 10, random_state: 42 });

  const handleAlgorithmChange = (algoId) => {
    setAlgorithm(algoId);
    const defaults = DEFAULT_PARAMETERS[algoId] || { random_state: 42 };
    setParameters({ ...defaults });
  };

  // Training Execution State
  const [isTraining, setIsTraining] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: Prep, 2: Train, 3: CV, 4: Eval, 5: Save, 6: Done
  const [trainingError, setTrainingError] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Experiment History State
  const [experiments, setExperiments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Available Algorithms by Problem Type (Fetched from Project Collection)
  const ALGORITHM_OPTIONS = {
    classification: [
      { id: 'random_forest_classifier', label: 'Random Forest Classifier' },
      { id: 'decision_tree_classifier', label: 'Decision Tree Classifier' },
      { id: 'logistic_regression', label: 'Logistic Regression' },
      { id: 'support_vector_classifier', label: 'Support Vector Classifier (SVC)' },
      { id: 'knn_classifier', label: 'K-Nearest Neighbors (KNN)' },
      { id: 'xgboost_classifier', label: 'XGBoost Classifier' },
    ],
    regression: [
      { id: 'random_forest_regressor', label: 'Random Forest Regressor' },
      { id: 'linear_regression', label: 'Linear Regression' },
      { id: 'decision_tree_regressor', label: 'Decision Tree Regressor' },
      { id: 'ridge_regression', label: 'Ridge Regression' },
      { id: 'lasso_regression', label: 'Lasso Regression' },
      { id: 'knn_regressor', label: 'K-Nearest Neighbors (KNN)' },
      { id: 'support_vector_regressor', label: 'Support Vector Regressor (SVR)' },
      { id: 'xgboost_regressor', label: 'XGBoost Regressor' },
    ],
    clustering: [
      { id: 'kmeans', label: 'K-Means Clustering' },
    ],
  };

  const getAlgorithmLabel = (algoId) => {
    if (!algoId) return 'N/A';
    for (const pType of Object.keys(ALGORITHM_OPTIONS)) {
      const found = ALGORITHM_OPTIONS[pType].find((a) => a.id === algoId);
      if (found) return found.label;
    }
    return algoId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const [columnList, setColumnList] = useState([]);


  // Load Initial Data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      datasetService.getById(datasetId),
      projectService.getById(projectId),
      mlTrainingService.getExperimentsByDataset(datasetId).catch(() => []),
      datasetService.getColumns(datasetId).catch(() => null),
      datasetService.getProfile(datasetId).catch(() => null),
      datasetService.getEDA(datasetId).catch(() => null),
      datasetService.previewFeatureEngineering(datasetId).catch(() => null),
    ])
      .then(([ds, proj, expList, colRes, profRes, edaRes, feRes]) => {
        if (!isMounted) return;
        setDataset(ds);
        setProject(proj);
        setExperiments(expList || []);

        let extractedCols = [];

        // 1. Direct MongoDB version metadata & CSV header via Node API
        if (colRes?.columns && Array.isArray(colRes.columns) && colRes.columns.length > 0) {
          extractedCols = colRes.columns;
        }

        // 2. Direct CSV column inspection via Feature Engineering Preview
        if (extractedCols.length === 0 && feRes?.available_columns && Array.isArray(feRes.available_columns) && feRes.available_columns.length > 0) {
          extractedCols = feRes.available_columns;
        }

        // 3. Extract from Profile response
        if (extractedCols.length === 0 && profRes?.profile?.columns) {
          extractedCols = Object.keys(profRes.profile.columns);
        } else if (extractedCols.length === 0 && profRes?.profile?.variables) {
          extractedCols = Object.keys(profRes.profile.variables);
        }

        // 4. Extract from EDA response
        if (extractedCols.length === 0 && edaRes) {
          if (edaRes.outliers?.outlier_summary) {
            extractedCols = Object.keys(edaRes.outliers.outlier_summary);
          } else if (edaRes.distribution?.numerical) {
            extractedCols = Object.keys(edaRes.distribution.numerical);
          } else if (edaRes.dataset_summary?.features) {
            extractedCols = edaRes.dataset_summary.features;
          }
        }

        const uniqueCols = Array.from(new Set(extractedCols.filter(Boolean)));
        setColumnList(uniqueCols);


        if (proj?.problem_type) {
          const pType = proj.problem_type.toLowerCase();
          setProblemType(pType);
          if (ALGORITHM_OPTIONS[pType]) {
            setAlgorithm(ALGORITHM_OPTIONS[pType][0].id);
          }
        }

        // Keep target column unselected by default so user must explicitly select one
        setTargetColumn('');
      })
      .catch((err) => {
        console.error('Failed to load training dependencies:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [datasetId, projectId]);

  const allColumns = useMemo(() => {
    return getCleanOriginalColumns(columnList);
  }, [columnList]);

  const isDuplicateName = useMemo(() => {
    if (!experimentName || !experimentName.trim()) return false;
    const cleanInput = experimentName.trim().toLowerCase();
    return experiments.some((exp) => exp.experiment_name?.trim().toLowerCase() === cleanInput);
  }, [experimentName, experiments]);

  // Form Validation Check — All Fields Are Required
  const isFormValid = useMemo(() => {
    if (!experimentName || !experimentName.trim()) return false;
    return (
      experimentName.trim() !== '' &&
      !isDuplicateName &&
      targetColumn.trim() !== '' &&
      problemType.trim() !== '' &&
      algorithm.trim() !== '' &&
      testSize !== '' &&
      !Object.values(parameters).some(v => v === '' || v === null)
    );
  }, [experimentName, isDuplicateName, targetColumn, problemType, algorithm, testSize, parameters]);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeletingModel, setIsDeletingModel] = useState(false);

  // Handle Soft Delete Trained Model
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeletingModel(true);
    try {
      await mlTrainingService.deleteTrainedModel(deleteTarget._id);
      setExperiments((prev) => prev.filter((e) => e._id !== deleteTarget._id && e.trained_model?._id !== deleteTarget._id));
      if (currentResult?.experiment?._id === deleteTarget._id) {
        setCurrentResult(null);
      }
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || 'Failed to delete trained model.');
    } finally {
      setIsDeletingModel(false);
    }
  };

  // Handle Start Training Pipeline
  const handleStartTraining = async () => {
    if (!experimentName || !experimentName.trim()) {
      setTrainingError('Experiment Name is required. Please enter an experiment name.');
      alert('Experiment Name is required. Please enter an experiment name.');
      return;
    }

    if (!targetColumn && problemType !== 'clustering') {
      setTrainingError('Target Column is required. Please select a target column.');
      alert('Target Column is required. Please select a target column.');
      return;
    }

    if (!algorithm) {
      setTrainingError('Algorithm / Model selection is required. Please select an algorithm.');
      alert('Algorithm / Model selection is required.');
      return;
    }

    const hasEmptyParam = Object.entries(parameters).some(
      ([k, v]) => v === '' || v === null || v === undefined
    );
    if (hasEmptyParam) {
      setTrainingError('All hyperparameter configuration fields are required.');
      alert('All hyperparameter configuration fields are required. Please fill in all hyperparameter values.');
      return;
    }

    const expTitle = experimentName.trim();

    const duplicateExp = experiments.find(
      (exp) => exp.experiment_name?.trim().toLowerCase() === expTitle.toLowerCase()
    );
    if (duplicateExp) {
      setTrainingError(`An experiment named "${expTitle}" already exists in this project. Please choose a unique name.`);
      alert(`An experiment named "${expTitle}" already exists in this project. Please enter a unique experiment name.`);
      return;
    }

    setIsTraining(true);
    setTrainingError(null);
    setActiveStep(1); // 1: Preparing Dataset

    try {
      // Step Timeline Animation Simulation while API runs
      const stepTimer1 = setTimeout(() => setActiveStep(2), 700); // Training Model
      const stepTimer2 = setTimeout(() => setActiveStep(3), 1400); // Cross Validation
      const stepTimer3 = setTimeout(() => setActiveStep(4), 2100); // Evaluation
      const stepTimer4 = setTimeout(() => setActiveStep(5), 2800); // Saving Model

      const selectedVersionId = dataset?.latest_version?._id || dataset?.current_version_id || datasetId;

      const trainingPayload = {
        project_id: projectId,
        dataset_version_id: selectedVersionId,
        user_id: user?.id || user?._id,
        experiment_name: expTitle,
        algorithm,
        target_column: targetColumn,
        parameters: {
          test_size: Number(testSize),
          ...parameters,
        },
      };

      console.log("========== TRAIN REQUEST ==========");
      console.log(trainingPayload);
      console.log("Target Column:", targetColumn);
      console.log("Column List:", columnList);
      console.log("==================================");


      const result = await mlTrainingService.trainModel(trainingPayload);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);

      setActiveStep(6); // Completed!
      setCurrentResult(result);

      // Refresh Experiments History
      const updatedHistory = await mlTrainingService.getExperimentsByDataset(datasetId);
      setExperiments(updatedHistory);
    } catch (err) {
      console.error('Training Error:', err);
      setTrainingError(err?.response?.data?.message || err.message || 'Model training failed.');
      setActiveStep(0);
    } finally {
      setIsTraining(false);
    }
  };

  // Handle Export Training Report (PDF)
  const handleExportReport = async () => {
    if (!currentResult?.experiment?._id) return;
    setExportingPdf(true);
    try {
      await mlTrainingService.exportTrainingReport(
        currentResult.experiment._id,
        currentResult.experiment.experiment_name || 'model'
      );
    } catch (err) {
      console.error('Failed to export PDF report:', err);
      alert('Failed to generate PDF report.');
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="ds-train-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <RefreshCw className="spin-icon" size={32} style={{ color: '#6366f1' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading Training Workspace...</p>
      </div>
    );
  }

  const evalMetrics = currentResult?.experiment?.evaluation || currentResult?.training_result?.evaluation || {};
  const cvMetrics = currentResult?.experiment?.cross_validation || currentResult?.training_result?.cross_validation || {};

  return (
    <div className="ds-train-container">
      {/* ── Page Header ── */}
      <div className="ds-train-header">
        <div className="ds-train-title-group">
          <h1>Model Training & Evaluation</h1>
          <p className="ds-train-subtitle">
            Configure hyperparameters, train models via Django engine, view live cross-validation, and export PDF reports.
          </p>
        </div>
        <div className="ds-train-badges">
          <span className="ds-train-badge">{problemType}</span>
        </div>
      </div>

      {/* ── Configuration Panel ── */}
      <div className="ds-train-card">
        <h3 className="ds-train-card-title">
          <Cpu size={20} style={{ color: '#6366f1' }} /> Model Training Configuration
        </h3>

        <div className="ds-train-form-grid">
          <div className="ds-train-field">
            <label>
              Experiment Name <span style={{ color: '#ef4444' }}>*</span>:
            </label>
            <input
              type="text"
              className={`ds-train-input ${isDuplicateName || (!experimentName.trim() && trainingError) ? 'ds-train-input--error' : ''}`}
              placeholder="Enter experiment name..."
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
              disabled={isTraining}
            />
            {isDuplicateName && (
              <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={14} /> Experiment name already exists in this project
              </span>
            )}
          </div>

          <div className="ds-train-field">
            <label>
              Target Column <span style={{ color: '#ef4444' }}>*</span>:
            </label>
            <select
              className={`ds-train-select ${!targetColumn && problemType !== 'clustering' && trainingError ? 'ds-train-input--error' : ''}`}
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              disabled={isTraining}
            >
              <option value="">-- Select Target Column (Required) --</option>
              {allColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div className="ds-train-field">
            <label>
              Problem Type <span style={{ color: '#ef4444' }}>*</span>:
            </label>
            <div className="ds-train-readonly-field">
              <input
                type="text"
                className="ds-train-input ds-train-input--readonly"
                value={problemType ? problemType.charAt(0).toUpperCase() + problemType.slice(1).replace('_', ' ') : 'Classification'}
                readOnly
                disabled
                title="Problem type is defined in Project collection and auto-fetched."
              />
            </div>
          </div>

          <div className="ds-train-field">
            <label>
              Select Algorithm / Model <span style={{ color: '#ef4444' }}>*</span>:
            </label>
            <select
              className="ds-train-select"
              value={algorithm}
              onChange={(e) => handleAlgorithmChange(e.target.value)}
              disabled={isTraining}
            >
              {(ALGORITHM_OPTIONS[problemType] || ALGORITHM_OPTIONS.classification || []).map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ds-train-field">
            <label>
              Train / Test Split Ratio <span style={{ color: '#ef4444' }}>*</span>:
            </label>
            <select
              className="ds-train-select"
              value={testSize}
              onChange={(e) => setTestSize(parseFloat(e.target.value))}
              disabled={isTraining}
            >
              <option value={0.2}>80% Train / 20% Test</option>
              <option value={0.25}>75% Train / 25% Test</option>
              <option value={0.3}>70% Train / 30% Test</option>
            </select>
          </div>
        </div>

        {/* ── Dynamic Algorithm Hyperparameters Config ── */}
        <div style={{ marginTop: '20px', marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color, rgba(255,255,255,0.1))' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary, #94a3b8)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} style={{ color: '#818cf8' }} /> Hyperparameter Configuration <span style={{ color: '#ef4444' }}>*</span>
          </h4>
          <div className="ds-train-form-grid">
            {Object.keys(parameters).map((paramKey) => (
              <div className="ds-train-field" key={paramKey}>
                <label style={{ textTransform: 'capitalize' }}>
                  {paramKey.replace('_', ' ')} <span style={{ color: '#ef4444' }}>*</span>:
                </label>
                {paramKey === 'loss' ? (
                  <select
                    className="ds-train-select"
                    value={parameters[paramKey]}
                    onChange={(e) => setParameters({ ...parameters, [paramKey]: e.target.value })}
                    disabled={isTraining}
                  >
                    <option value="linear">linear</option>
                    <option value="square">square</option>
                    <option value="exponential">exponential</option>
                  </select>
                ) : paramKey === 'kernel' ? (
                  <select
                    className="ds-train-select"
                    value={parameters[paramKey]}
                    onChange={(e) => setParameters({ ...parameters, [paramKey]: e.target.value })}
                    disabled={isTraining}
                  >
                    <option value="rbf">rbf</option>
                    <option value="linear">linear</option>
                    <option value="poly">poly</option>
                  </select>
                ) : typeof DEFAULT_PARAMETERS[algorithm]?.[paramKey] === 'boolean' ? (
                  <select
                    className="ds-train-select"
                    value={String(parameters[paramKey])}
                    onChange={(e) => setParameters({ ...parameters, [paramKey]: e.target.value === 'true' })}
                    disabled={isTraining}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : (
                  <input
                    type={typeof DEFAULT_PARAMETERS[algorithm]?.[paramKey] === 'number' ? 'number' : 'text'}
                    step={paramKey === 'learning_rate' || paramKey === 'C' ? '0.05' : '1'}
                    className={`ds-train-input ${(parameters[paramKey] === '' || parameters[paramKey] === null || parameters[paramKey] === undefined) && trainingError ? 'ds-train-input--error' : ''}`}
                    value={parameters[paramKey] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const numVal = Number(val);
                      setParameters({
                        ...parameters,
                        [paramKey]: isNaN(numVal) || val === '' ? val : numVal,
                      });
                    }}
                    disabled={isTraining}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          className="ds-train-btn-primary"
          onClick={handleStartTraining}
          disabled={isTraining || !isFormValid}
        >
          {isTraining ? <RefreshCw className="spin-icon" size={18} /> : <Play size={18} />}
          <span>{isTraining ? 'Training in Progress...' : 'Start Training'}</span>
        </button>
      </div>

      {/* ── Error Banner ── */}
      {trainingError && (
        <div className="ds-train-card" style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
            <div>
              <h4 style={{ margin: 0, color: '#ef4444' }}>Training Failed</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{trainingError}</p>
            </div>
            <button className="ds-train-btn-secondary" style={{ marginLeft: 'auto' }} onClick={handleStartTraining}>
              Retry Training
            </button>
          </div>
        </div>
      )}

      {/* ── Live Training Progress Timeline ── */}
      {(isTraining || activeStep > 0) && (
        <div className="ds-train-card">
          <h3 className="ds-train-card-title">
            <Clock size={20} style={{ color: '#6366f1' }} /> Training Progress Timeline
          </h3>

          <div className="ds-train-timeline">
            {[
              { num: 1, label: 'Preparing Dataset' },
              { num: 2, label: 'Training Model' },
              { num: 3, label: 'Cross Validation' },
              { num: 4, label: 'Evaluation' },
              { num: 5, label: 'Saving Model' },
              { num: 6, label: 'Completed' },
            ].map((step) => {
              const isDone = activeStep > step.num || activeStep === 6;
              const isActive = activeStep === step.num && activeStep !== 6;

              return (
                <div
                  key={step.num}
                  className={`ds-train-timeline-step ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                >
                  <div className="ds-train-step-node">
                    {isDone ? <CheckCircle2 size={20} /> : step.num}
                  </div>
                  <span className="ds-train-step-label">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Training Results & Metrics View ── */}
      {currentResult && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Model Training Results</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="ds-train-btn-primary"
                onClick={handleExportReport}
                disabled={exportingPdf}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <FileText size={18} />
                <span>{exportingPdf ? 'Generating PDF...' : 'Export Training Report (PDF)'}</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards Grid */}
          <div className="ds-train-metrics-grid">
            <div className="ds-train-metric-card">
              <span className="ds-train-metric-val ds-train-metric-val--text">
                {getAlgorithmLabel(currentResult.experiment?.algorithm || algorithm)}
              </span>
              <span className="ds-train-metric-label">Selected Algorithm</span>
            </div>


            {problemType === 'classification' && (
              <>
                <div className="ds-train-metric-card">
                  <span className="ds-train-metric-val" style={{ color: '#10b981' }}>
                    {evalMetrics.accuracy !== undefined ? `${(evalMetrics.accuracy * 100).toFixed(2)}%` : 'N/A'}
                  </span>
                  <span className="ds-train-metric-label">Accuracy</span>
                </div>
                <div className="ds-train-metric-card">
                  <span className="ds-train-metric-val">
                    {evalMetrics.precision !== undefined ? `${(evalMetrics.precision * 100).toFixed(2)}%` : 'N/A'}
                  </span>
                  <span className="ds-train-metric-label">Precision</span>
                </div>
                <div className="ds-train-metric-card">
                  <span className="ds-train-metric-val">
                    {evalMetrics.recall !== undefined ? `${(evalMetrics.recall * 100).toFixed(2)}%` : 'N/A'}
                  </span>
                  <span className="ds-train-metric-label">Recall</span>
                </div>
                <div className="ds-train-metric-card">
                  <span className="ds-train-metric-val" style={{ color: '#6366f1' }}>
                    {evalMetrics.f1_score !== undefined ? `${(evalMetrics.f1_score * 100).toFixed(2)}%` : 'N/A'}
                  </span>
                  <span className="ds-train-metric-label">F1 Score</span>
                </div>
              </>
            )}

            {problemType === 'regression' && (
              <>
                <div className="ds-train-metric-card">
                  <span className="ds-train-metric-val" style={{ color: '#6366f1' }}>
                    {evalMetrics.r2_score !== undefined ? evalMetrics.r2_score.toFixed(4) : 'N/A'}
                  </span>
                  <span className="ds-train-metric-label">R² Score</span>
                </div>
                <div className="ds-train-metric-card">
                  <span className="ds-train-metric-val">
                    {evalMetrics.mae !== undefined ? evalMetrics.mae.toFixed(4) : 'N/A'}
                  </span>
                  <span className="ds-train-metric-label">MAE</span>
                </div>
                <div className="ds-train-metric-card">
                  <span className="ds-train-metric-val">
                    {evalMetrics.rmse !== undefined ? evalMetrics.rmse.toFixed(4) : 'N/A'}
                  </span>
                  <span className="ds-train-metric-label">RMSE</span>
                </div>
              </>
            )}

            {problemType === 'clustering' && (
              <>
                <div className="ds-train-metric-card">
                  <span className="ds-train-metric-val" style={{ color: '#10b981' }}>
                    {evalMetrics.silhouette_score !== undefined ? evalMetrics.silhouette_score.toFixed(4) : 'N/A'}
                  </span>
                  <span className="ds-train-metric-label">Silhouette Score</span>
                </div>
                <div className="ds-train-metric-card">
                  <span className="ds-train-metric-val">
                    {evalMetrics.davies_bouldin_score !== undefined ? evalMetrics.davies_bouldin_score.toFixed(4) : 'N/A'}
                  </span>
                  <span className="ds-train-metric-label">Davies-Bouldin</span>
                </div>
              </>
            )}

            <div className="ds-train-metric-card">
              <span className="ds-train-metric-val">
                {currentResult.experiment?.training_time ? `${currentResult.experiment.training_time.toFixed(2)}s` : '< 1s'}
              </span>
              <span className="ds-train-metric-label">Training Duration</span>
            </div>
          </div>

          {/* Cross Validation Results Card */}
          <div className="ds-train-card">
            <h3 className="ds-train-card-title">
              <Award size={20} style={{ color: '#6366f1' }} /> Cross Validation Results (5-Fold)
            </h3>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Average Score: </span>
                <strong style={{ fontSize: '18px', color: '#6366f1' }}>
                  {cvMetrics.mean_score !== undefined ? (cvMetrics.mean_score * (problemType === 'classification' ? 100 : 1)).toFixed(2) : 'N/A'}{problemType === 'classification' ? '%' : ''}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Standard Deviation: </span>
                <strong style={{ fontSize: '18px', color: '#10b981' }}>
                  ±{cvMetrics.std_score !== undefined ? cvMetrics.std_score.toFixed(4) : '0.000'}
                </strong>
              </div>
            </div>

            {/* Fold Scores Bar Chart SVG */}
            {cvMetrics.scores && cvMetrics.scores.length > 0 && (
              <svg viewBox="0 0 500 120" className="ds-train-svg-chart" style={{ height: '140px' }}>
                {cvMetrics.scores.map((score, i) => {
                  const barH = Math.max(10, Math.min(80, score * 80));
                  const x = 50 + i * 90;
                  const y = 90 - barH;
                  return (
                    <g key={i}>
                      <rect x={x} y={y} width="40" height={barH} fill="#6366f1" rx="4" />
                      <text x={x + 20} y={y - 6} textAnchor="middle" fill="#6366f1" fontSize="11" fontWeight="700">
                        {(score * (problemType === 'classification' ? 100 : 1)).toFixed(1)}{problemType === 'classification' ? '%' : ''}
                      </text>
                      <text x={x + 20} y={108} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">
                        Fold {i + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>


        </motion.div>
      )}

      {/* ── Experiment History Section ── */}
      <div className="ds-train-card" style={{ marginTop: '28px' }}>
        <h3 className="ds-train-card-title">
          <History size={20} style={{ color: '#6366f1' }} /> Experiment History ({experiments.length})
        </h3>

        {experiments.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', padding: '12px 0' }}>No previous training experiments found for this project.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ds-train-table">
              <thead>
                <tr>
                  <th>Experiment Name</th>
                  <th>Algorithm</th>
                  <th>Target Column</th>
                  <th>Score / Accuracy</th>
                  <th>Training Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {experiments.map((exp) => {
                  const score = exp.evaluation?.accuracy ?? exp.evaluation?.r2_score ?? exp.evaluation?.silhouette_score ?? null;
                  return (
                    <tr key={exp._id}>
                      <td style={{ fontWeight: 700 }}>{exp.experiment_name}</td>
                      <td>{exp.algorithm}</td>
                      <td>{exp.target_column || 'N/A'}</td>
                      <td style={{ color: '#10b981', fontWeight: 700 }}>
                        {score !== null ? `${(score * (exp.problem_type === 'classification' ? 100 : 1)).toFixed(2)}${exp.problem_type === 'classification' ? '%' : ''}` : 'N/A'}
                      </td>
                      <td>{new Date(exp.created_at).toLocaleString()}</td>
                      <td>
                        <span className={`ds-train-badge ${exp.status === 'completed' ? 'success' : ''}`}>
                          {exp.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            className="ds-train-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => setCurrentResult({ experiment: exp })}
                          >
                            View Details
                          </button>
                          <button
                            className="ds-train-btn-secondary"
                            style={{
                              padding: '6px 10px',
                              fontSize: '12px',
                              color: '#ef4444',
                              borderColor: 'rgba(239, 68, 68, 0.3)',
                              background: 'rgba(239, 68, 68, 0.05)',
                            }}
                            onClick={() => setDeleteTarget(exp)}
                            title="Delete Trained Model (Soft Delete)"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeletingModel}
        title="Delete Trained Model?"
        message={`Are you sure you want to delete "${deleteTarget?.experiment_name}"? This action cannot be undone and will remove all associated model data.`}
        confirmLabel="Delete Model"
      />
    </div>
  );
};

export default DatasetModelTraining;
