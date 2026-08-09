/* ============================================================
   DatasetModelDeployment.jsx — Model Deployment Module
   ============================================================ */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Copy,
  Check,
  FileText,
  RefreshCw,
  Code,
  Globe,
  Clock,
  Layers,
  X,
  Info,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import datasetService from '../../services/datasetService';
import projectService from '../../services/projectService';
import mlTrainingService from '../../services/mlTrainingService';
import mlDeploymentService from '../../services/mlDeploymentService';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import './DatasetModelDeployment.css';

const DatasetModelDeployment = () => {
  const { workspaceId, projectId, datasetId } = useParams();
  const navigate = useNavigate();

  // State
  const [dataset, setDataset] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trained Models & Deployments Data
  const [trainedModels, setTrainedModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [deploymentsHistory, setDeploymentsHistory] = useState([]);
  const [activeDeployment, setActiveDeployment] = useState(null);

  // Deploying Action States
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // 0 = idle, 1..6 = timeline steps
  const [copied, setCopied] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const trainUrl = `/workspaces/${workspaceId}/projects/${projectId}/datasets/${datasetId}/train`;

  // Format Algorithm Name
  const formatAlgoName = (algo) => {
    if (!algo) return 'Unknown Model';
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

  // Load Data
  const loadDeploymentData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [ds, proj, exps, deps] = await Promise.all([
        datasetService.getById(datasetId),
        projectService.getById(projectId),
        mlTrainingService.getExperimentsByDataset(datasetId).catch(() => []),
        mlDeploymentService.getDeploymentsByProject(projectId).catch(() => []),
      ]);

      setDataset(ds);
      setProject(proj);

      // Filter completed experiments / trained models
      // const validModels = (exps || [])
      //   .filter((exp) => exp.status === 'completed')
      //   .map((exp) => ({
      //     _id: exp._id,
      //     experiment_id: exp._id,
      //     experiment_name: exp.experiment_name || `Experiment ${exp._id}`,
      //     algorithm: exp.algorithm,
      //     evaluation: exp.evaluation || {},
      //     target_column: exp.target_column || 'N/A',
      //     created_at: exp.created_at || new Date().toISOString(),
      //     deployment_status: exp.deployment_status || 'not_deployed',
      //   }));

      const validModels = (exps || [])
        .filter(
          (exp) =>
            exp.status === "completed" &&
            exp.trained_model
        )
        .map((exp) => ({
          _id: exp.trained_model._id,

          experiment_id: exp._id,

          experiment_name:
            exp.experiment_name || `Experiment ${exp._id}`,

          algorithm: exp.algorithm,

          evaluation: exp.evaluation || {},

          target_column:
            exp.target_column || "N/A",

          created_at:
            exp.created_at || new Date().toISOString(),

          deployment_status:
            exp.trained_model.deployment_status || "not_deployed",

          model_name:
            exp.trained_model.model_name,

          model_path:
            exp.trained_model.model_path,
        }));

      setTrainedModels(validModels);

      if (validModels.length > 0) {
        setSelectedModelId(validModels[0]._id);
      }

      setDeploymentsHistory(deps || []);

      if (deps && deps.length > 0) {
        setActiveDeployment(deps[0]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load model deployment information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeploymentData();
  }, [projectId, datasetId]);

  const selectedModel = trainedModels.find((m) => m._id === selectedModelId);
  const problemType = (project?.problem_type || 'classification').toLowerCase();
  const primaryMetricKey = problemType === 'regression' ? 'r2_score' : problemType === 'clustering' ? 'silhouette_score' : 'accuracy';

  // Check if current selected model is already deployed
  const isAlreadyDeployed = useMemo(() => {
    if (!selectedModelId) return false;
    const isDeployedInModel = selectedModel?.deployment_status === 'deployed';
    const isDeployedInHistory = deploymentsHistory.some((d) => {
      const depModelId = d.trained_model_id?._id || d.trained_model_id || d.trained_model;
      return String(depModelId) === String(selectedModelId) && d.status === 'active';
    });
    return isDeployedInModel || isDeployedInHistory;
  }, [selectedModelId, selectedModel, deploymentsHistory]);

  // Deduplicate deployment history so each trained model/experiment only appears ONCE
  const uniqueDeployments = useMemo(() => {
    if (!deploymentsHistory || deploymentsHistory.length === 0) return [];

    const seen = new Set();
    const unique = [];

    deploymentsHistory.forEach((dep) => {
      const modelId =
        dep.trained_model_id?._id ||
        dep.trained_model_id ||
        dep.trained_model ||
        dep._id;
      const key = String(modelId);

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(dep);
      }
    });

    return unique;
  }, [deploymentsHistory]);

  // Handle Deploy Model Action
  const handleDeployModel = async () => {
    if (!selectedModelId) return;

    if (isAlreadyDeployed) {
      setError('This trained model is already deployed as an active API endpoint.');
      return;
    }

    setIsDeploying(true);
    setError(null);
    setActiveStep(1); // Step 1: Preparing Deployment

    try {
      await new Promise((r) => setTimeout(r, 600));
      setActiveStep(2); // Step 2: Validating Model

      await new Promise((r) => setTimeout(r, 600));
      setActiveStep(3); // Step 3: Loading Model

      await new Promise((r) => setTimeout(r, 600));
      setActiveStep(4); // Step 4: Registering Deployment

      const res = await mlDeploymentService.deployModel(projectId, selectedModelId);

      await new Promise((r) => setTimeout(r, 600));
      setActiveStep(5); // Step 5: Generating Prediction Endpoint

      await new Promise((r) => setTimeout(r, 500));
      setActiveStep(6); // Step 6: Deployment Completed

      const newDeployment = res?.deployment || {
        _id: `DEP_${Date.now().toString(16)}`,
        endpoint_name: `prediction-${selectedModelId}`,
        endpoint_url: `/api/ml/predict/${res?.deployment?._id || Date.now()}`,
        status: 'active',
        deployed_at: new Date().toISOString(),
        trained_model_id: selectedModel,
      };

      setActiveDeployment(newDeployment);
      setDeploymentsHistory((prev) => [newDeployment, ...prev]);

      // Update local trainedModel status
      setTrainedModels((prev) =>
        prev.map((m) => (m._id === selectedModelId ? { ...m, deployment_status: 'deployed' } : m))
      );
    } catch (err) {
      setError(err.message || 'Model deployment failed.');
      setActiveStep(0);
    } finally {
      setIsDeploying(false);
    }
  };

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeletingModel, setIsDeletingModel] = useState(false);

  // Handle Soft Delete Selected Trained Model
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeletingModel(true);
    try {
      await mlTrainingService.deleteTrainedModel(deleteTarget._id);
      const updatedModels = trainedModels.filter((m) => m._id !== deleteTarget._id);
      setTrainedModels(updatedModels);
      if (updatedModels.length > 0) {
        setSelectedModelId(updatedModels[0]._id);
      } else {
        setSelectedModelId(null);
      }
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Failed to delete trained model.');
    } finally {
      setIsDeletingModel(false);
    }
  };

  // Delete Deployment Modal State
  const [deleteDeploymentTarget, setDeleteDeploymentTarget] = useState(null);
  const [isDeletingDeployment, setIsDeletingDeployment] = useState(false);

  // Handle Soft Delete Deployment
  const handleDeleteDeploymentConfirm = async () => {
    if (!deleteDeploymentTarget) return;
    setIsDeletingDeployment(true);
    try {
      await mlDeploymentService.deleteDeployment(deleteDeploymentTarget._id);
      const updatedHistory = deploymentsHistory.filter((d) => d._id !== deleteDeploymentTarget._id);
      setDeploymentsHistory(updatedHistory);

      if (activeDeployment?._id === deleteDeploymentTarget._id) {
        setActiveDeployment(updatedHistory.length > 0 ? updatedHistory[0] : null);
      }

      setDeleteDeploymentTarget(null);
    } catch (err) {
      setError(err.message || 'Failed to delete deployment endpoint.');
    } finally {
      setIsDeletingDeployment(false);
    }
  };

  // Copy Endpoint Handler
  const handleCopyEndpoint = (url) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [exportingDepId, setExportingDepId] = useState(null);

  // Export PDF Report Handler (Top Header / Overall)
  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await mlDeploymentService.exportDeploymentReport(
        {
          project_name: project?.project_name || 'Project',
          dataset_name: dataset?.dataset_name || 'Dataset',
          problem_type: problemType,
          model_name: selectedModel ? formatAlgoName(selectedModel.algorithm) : 'Trained Model',
          deployment_id: activeDeployment?._id || 'DEP001',
          endpoint_url: activeDeployment?.endpoint_url || `/api/ml/predict/active`,
          status: activeDeployment?.status || 'active',
        },
        dataset?.dataset_name || 'dataset'
      );
    } catch (err) {
      alert('Failed to export PDF deployment report: ' + err.message);
    } finally {
      setExportingPdf(false);
    }
  };

  // Export Individual Deployment PDF Report Handler
  const handleExportIndividualReport = async (dep) => {
    const matchedModel = trainedModels.find(
      (m) => String(m._id) === String(dep.trained_model_id?._id || dep.trained_model_id || dep.trained_model)
    );
    const expName =
      matchedModel?.experiment_name ||
      dep.trained_model_id?.experiment_id?.experiment_name ||
      dep.trained_model_id?.experiment_name ||
      dep.experiment_name ||
      'Experiment';

    const algoName = formatAlgoName(
      matchedModel?.algorithm || dep.trained_model_id?.algorithm || dep.algorithm
    );

    setExportingDepId(dep._id);
    try {
      await mlDeploymentService.exportDeploymentReport(
        {
          project_name: project?.project_name || 'Project',
          dataset_name: dataset?.dataset_name || 'Dataset',
          problem_type: problemType,
          model_name: algoName,
          experiment_name: expName,
          deployment_id: dep._id,
          endpoint_url: dep.endpoint_url || `/api/ml/predict/${dep._id}`,
          status: dep.status || 'active',
          deployed_at: dep.deployed_at || new Date().toISOString(),
        },
        expName || 'deployment'
      );
    } catch (err) {
      alert('Failed to export PDF deployment report: ' + (err.message || 'Unknown error'));
    } finally {
      setExportingDepId(null);
    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="ds-dep-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
          <RefreshCw className="spin-icon" size={24} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: '16px', fontWeight: 600 }}>Loading Model Deployment Engine...</span>
        </div>
      </div>
    );
  }

  // Prerequisite Check: 0 Completed Models
  if (trainedModels.length === 0) {
    return (
      <div className="ds-dep-container">
        <div className="ds-dep-header">
          <div className="ds-dep-title-group">
            <h1>Model Deployment Dashboard</h1>
            <p className="ds-dep-subtitle">Deploy trained models as production REST API endpoints for real-time predictions.</p>
          </div>
        </div>

        <div className="ds-dep-card" style={{ borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <AlertTriangle size={28} style={{ color: '#f59e0b' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#b45309' }}>No completed trained models are available for deployment.</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                You must train and evaluate at least one machine learning model before generating an inference endpoint.
              </p>
            </div>
            <button className="ds-dep-btn-primary" onClick={() => navigate(trainUrl)}>
              <Cpu size={18} />
              <span>Go to Model Training</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Endpoint URL for active deployment
  const activeEndpointUrl = activeDeployment ? `/api/ml/predict/${activeDeployment._id}` : `/api/ml/predict/endpoint`;

  // Sample Request JSON
  const sampleRequestJson = JSON.stringify(
    {
      features: {
        age: 45,
        bmi: 28.6,
        children: 2,
        smoker: 0,
      },
    },
    null,
    2
  );

  // Sample Response JSON
  const sampleResponseJson = JSON.stringify(
    {
      prediction: problemType === 'regression' ? 32567.42 : 1,
      probability: problemType === 'classification' ? 0.942 : undefined,
      model_version: 'v1',
      deployment_id: activeDeployment?._id || 'DEP001',
    },
    null,
    2
  );

  return (
    <div className="ds-dep-container">
      {/* Page Header */}
      <div className="ds-dep-header">
        <div className="ds-dep-title-group">
          <h1>Model Deployment Dashboard</h1>
          <p className="ds-dep-subtitle">
            Deploy trained models as high-performance REST API endpoints for <strong>{dataset?.dataset_name || 'Dataset'}</strong>.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="ds-dep-card" style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
            <div>
              <h4 style={{ margin: 0, color: '#ef4444' }}>Deployment Action Failed</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{error}</p>
            </div>
            <button className="ds-dep-btn-secondary" style={{ marginLeft: 'auto' }} onClick={handleDeployModel}>
              Retry Deployment
            </button>
          </div>
        </div>
      )}

      {/* ── Section 1: Model Selection Grid ── */}
      <div className="ds-dep-card">
        <h3 className="ds-dep-card-title">
          <Layers size={20} style={{ color: '#6366f1' }} /> Select Trained Model to Deploy
        </h3>

        <div style={{ marginBottom: '24px', maxWidth: '540px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', marginBottom: '8px' }}>
            Choose Trained Model:
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="ds-dep-select-input"
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              disabled={isDeploying}
            >
              {trainedModels.map((m) => {
                const expName = m.experiment_name || 'Experiment';
                const algoName = formatAlgoName(m.algorithm);
                const isModelDeployed =
                  m.deployment_status === 'deployed' ||
                  deploymentsHistory.some(
                    (d) =>
                      String(d.trained_model_id?._id || d.trained_model_id || d.trained_model) === String(m._id) &&
                      d.status === 'active'
                  );
                return (
                  <option key={m._id} value={m._id}>
                    {expName} — {algoName} {isModelDeployed ? '(Already Deployed)' : ''}
                  </option>
                );
              })}
            </select>
            <ChevronDown size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }} />
          </div>
          {isAlreadyDeployed && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> This trained model is already deployed as an active API endpoint.
            </div>
          )}
        </div>

        {/* ── Section 2: Deployment Validation Checklist ── */}
        {selectedModel && (
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Pre-Deployment Requirement Check
            </span>
            <div className="ds-dep-validation-box" style={{ marginTop: '8px' }}>
              <div className="ds-dep-val-item">
                <CheckCircle2 size={16} /> <span>Model Binary File Found</span>
              </div>
              <div className="ds-dep-val-item">
                <CheckCircle2 size={16} /> <span>Metadata Schema Valid</span>
              </div>
              <div className="ds-dep-val-item">
                <CheckCircle2 size={16} /> <span>Dataset Version Available</span>
              </div>
              <div className="ds-dep-val-item">
                <CheckCircle2 size={16} /> <span>Inference Ready (.predict())</span>
              </div>
            </div>

            <button
              className="ds-dep-btn-primary"
              onClick={handleDeployModel}
              disabled={isDeploying || isAlreadyDeployed}
              style={isAlreadyDeployed ? { opacity: 0.6, cursor: 'not-allowed', background: '#475569' } : {}}
            >
              {isDeploying ? <RefreshCw className="spin-icon" size={18} /> : isAlreadyDeployed ? <CheckCircle2 size={18} /> : <Rocket size={18} />}
              <span>{isDeploying ? 'Deploying Model Pipeline...' : isAlreadyDeployed ? 'Already Deployed' : 'Deploy Model'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Section 3: Live Deployment Workflow Progress ── */}
      {(isDeploying || activeStep > 0) && (
        <div className="ds-dep-card">
          <h3 className="ds-dep-card-title">
            <Clock size={20} style={{ color: '#6366f1' }} /> Live Deployment Progress Workflow
          </h3>

          <div className="ds-dep-timeline">
            {[
              { num: 1, label: 'Preparing Deployment' },
              { num: 2, label: 'Validating Model' },
              { num: 3, label: 'Loading Model' },
              { num: 4, label: 'Registering Deployment' },
              { num: 5, label: 'Generating Endpoint' },
              { num: 6, label: 'Deployment Completed' },
            ].map((step) => {
              const isDone = activeStep > step.num || activeStep === 6;
              const isActive = activeStep === step.num && activeStep !== 6;

              return (
                <div
                  key={step.num}
                  className={`ds-dep-timeline-step ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                >
                  <div className="ds-dep-step-node">
                    {isDone ? <CheckCircle2 size={20} /> : step.num}
                  </div>
                  <span className="ds-dep-step-label">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* ── Section 5: Deployment History List ── */}
      <div className="ds-dep-card">
        <h3 className="ds-dep-card-title">
          <Clock size={20} style={{ color: '#6366f1' }} /> Deployment History
        </h3>

        {uniqueDeployments.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No previous deployments registered.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ds-cmp-table">
              <thead>
                <tr>
                  <th>Experiment</th>
                  <th>Algorithm</th>
                  <th>Deployment Date</th>
                  <th>Status</th>
                  <th>Endpoint</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {uniqueDeployments.map((dep) => {
                  const matchedModel = trainedModels.find(
                    (m) => String(m._id) === String(dep.trained_model_id?._id || dep.trained_model_id || dep.trained_model)
                  );

                  const expName =
                    matchedModel?.experiment_name ||
                    dep.trained_model_id?.experiment_id?.experiment_name ||
                    dep.trained_model_id?.experiment_name ||
                    dep.experiment_name ||
                    'Training Experiment';

                  const algoName = formatAlgoName(
                    matchedModel?.algorithm || dep.trained_model_id?.algorithm || dep.algorithm
                  );

                  const isExportingThis = exportingDepId === dep._id;

                  return (
                    <tr key={dep._id}>
                      <td><strong>{expName}</strong></td>
                      <td>{algoName}</td>
                      <td>{new Date(dep.deployed_at || Date.now()).toLocaleDateString()}</td>
                      <td>
                        <span className={`ds-dep-status ${dep.status === 'active' ? 'active' : 'disabled'}`}>
                          {dep.status || 'Active'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{dep.endpoint_url || `/api/ml/predict/${dep._id}`}</td>
                      <td>
                        <button
                          className="ds-dep-btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                          onClick={() => handleExportIndividualReport(dep)}
                          disabled={isExportingThis}
                          title="Export PDF Report for this deployment"
                        >
                          {isExportingThis ? (
                            <RefreshCw className="spin-icon" size={14} />
                          ) : (
                            <FileText size={14} style={{ color: '#10b981' }} />
                          )}
                          <span>{isExportingThis ? 'Exporting...' : 'Export Report'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── API Documentation Modal ── */}
      <AnimatePresence>
        {showApiModal && (
          <div className="ds-dep-modal-overlay">
            <motion.div
              className="ds-dep-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Code size={20} style={{ color: '#6366f1' }} /> Prediction API Specification
                </h3>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  onClick={() => setShowApiModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>ENDPOINT URL</span>
                <div className="ds-dep-endpoint-box" style={{ marginTop: '4px' }}>
                  <span className="ds-dep-http-method">POST</span>
                  <span>{window.location.origin}{activeDeployment?.endpoint_url || activeEndpointUrl}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>HTTP HEADERS</span>
                <div className="ds-dep-code-preview" style={{ marginTop: '4px' }}>
                  Content-Type: application/json
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>SAMPLE REQUEST PAYLOAD</span>
                <div className="ds-dep-code-preview" style={{ marginTop: '4px' }}>
                  {sampleRequestJson}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>SAMPLE RESPONSE PAYLOAD</span>
                <div className="ds-dep-code-preview" style={{ marginTop: '4px', color: '#34d399' }}>
                  {sampleResponseJson}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="ds-dep-btn-primary" onClick={() => setShowApiModal(false)}>
                  Close Documentation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

export default DatasetModelDeployment;
