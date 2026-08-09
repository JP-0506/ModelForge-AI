/* ============================================================
   DatasetFeatureEngineering — Phase 9 Feature Engineering Page
   ============================================================ */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wand2,
  Play,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  Layers,
  Table,
  Clock,
  ArrowRight,
  Code2,
  Check,
  ChevronRight,
} from 'lucide-react';
import datasetService from '../../services/datasetService';
import './DatasetFeatureEngineering.css';

export default function DatasetFeatureEngineering() {
  const { workspaceId, projectId, datasetId } = useParams();
  const navigate = useNavigate();

  // State
  const [dataset, setDataset] = useState(null);
  const [datasetVersion, setDatasetVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showOptionsForm, setShowOptionsForm] = useState(true);

  // Config options
  const [encodingMethod, setEncodingMethod] = useState('none');

  // Preview & Results
  const [preview, setPreview] = useState(null);
  const [engineeringResult, setEngineeringResult] = useState(null);
  const [availableCols, setAvailableCols] = useState([]);

  // Fetch dataset info & version
  const fetchDatasetDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dsData = await datasetService.getById(datasetId);
      setDataset(dsData);

      if (dsData?.latest_version) {
        setDatasetVersion(dsData.latest_version);
        if (dsData.latest_version.feature_engineering_summary) {
          setEngineeringResult(dsData.latest_version.feature_engineering_summary);
          setShowOptionsForm(false);
        }
      }
    } catch (err) {
      console.error('Failed to load dataset details:', err);
      setError(err.message || 'Failed to fetch dataset details');
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    fetchDatasetDetails();
  }, [fetchDatasetDetails]);

  // Prerequisites check
  const hasValidation = Boolean(datasetVersion?.original_file_path);
  const hasProfiling = Boolean(datasetVersion?.profiling_path);
  const hasCleaning = Boolean(datasetVersion?.cleaned_file_path || datasetVersion?.processing_status === 'cleaned' || datasetVersion?.processing_status === 'feature_engineered');
  const allPrereqsMet = hasValidation && hasProfiling && hasCleaning;

  // Compute feature engineering options object
  const buildOptionsPayload = useCallback(() => {
    return {
      encoding: {
        method: encodingMethod,
      },
    };
  }, [encodingMethod]);

  // Fetch live preview estimates
  const updatePreview = useCallback(async () => {
    if (!allPrereqsMet || !datasetId) return;
    try {
      const options = buildOptionsPayload();
      const prevData = await datasetService.previewFeatureEngineering(
        datasetId,
        datasetVersion?.version_number || 1,
        options
      );
      setPreview(prevData);
      if (prevData?.available_columns?.length > 0) {
        setAvailableCols(prevData.available_columns);
      }
    } catch (err) {
      console.error('Preview error:', err);
    }
  }, [allPrereqsMet, datasetId, datasetVersion, buildOptionsPayload]);

  useEffect(() => {
    if (allPrereqsMet) {
      updatePreview();
    }
  }, [allPrereqsMet, updatePreview]);

  // Execute Feature Engineering
  const handleGenerateFeatures = async () => {
    if (!allPrereqsMet || processing) return;
    try {
      setProcessing(true);
      setError(null);
      const options = buildOptionsPayload();

      const res = await datasetService.featureEngineering(
        datasetId,
        datasetVersion?.version_number || 1,
        options
      );


      if (res?.feature_engineering_summary) {
        setEngineeringResult(res.feature_engineering_summary);
      }
      if (res?.version) {
        setDatasetVersion(res.version);
      }
      setShowOptionsForm(false);
    } catch (err) {
      console.error('Feature engineering failed:', err);
      setError(err.message || 'Feature engineering failed. Please retry.');
    } finally {
      setProcessing(false);
    }
  };


  const getStatusBadgeClass = () => {
    const status = datasetVersion?.processing_status || 'not_generated';
    return `ds-fe-status-badge ${status}`;
  };

  if (loading) {
    return (
      <div className="ds-fe-container">
        <div className="ds-fe-header glass">
          <div className="ds-fe-header-main">
            <div className="ds-fe-title-row">
              <h1 className="ds-fe-title">Feature Engineering</h1>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading dataset configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-fe-container">
      {/* ── Dataset Header ── */}
      <motion.div
        className="ds-fe-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="ds-fe-header-main">
          <div className="ds-fe-title-row">
            <h1 className="ds-fe-title">{dataset?.dataset_name || 'Dataset'}</h1>
            <span className="ds-fe-version-badge">
              v{datasetVersion?.version_number || 1}
            </span>
          </div>

          <div className="ds-fe-meta-pills">
            <div className="ds-fe-meta-pill">
              <Table size={14} />
              <span>{datasetVersion?.file_type?.toUpperCase() || 'CSV'}</span>
            </div>
            <div className="ds-fe-meta-pill">
              <Layers size={14} />
              <span>{datasetVersion?.total_rows ?? 0} Rows</span>
            </div>
            <div className="ds-fe-meta-pill">
              <Code2 size={14} />
              <span>{datasetVersion?.total_columns ?? 0} Columns</span>
            </div>
          </div>
        </div>
      </motion.div>



      {/* ── Prerequisite Warning Card (If Incomplete) ── */}
      {!allPrereqsMet && (
        <motion.div
          className="ds-fe-prereq-card"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="ds-fe-prereq-content">
            <AlertTriangle size={24} className="ds-fe-prereq-icon" />
            <div className="ds-fe-prereq-text">
              <h4>Prerequisites Incomplete</h4>
              <p>Complete Dataset Validation, Profiling, and Cleaning before performing Feature Engineering.</p>
            </div>
          </div>

          <div className="ds-fe-prereq-actions">
            {!hasValidation && (
              <button
                className="ds-fe-prereq-btn"
                onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets/${datasetId}/validation`)}
              >
                Go to Validation
              </button>
            )}
            {!hasProfiling && (
              <button
                className="ds-fe-prereq-btn"
                onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets/${datasetId}/profiling`)}
              >
                Go to Profiling
              </button>
            )}
            {!hasCleaning && (
              <button
                className="ds-fe-prereq-btn"
                onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets/${datasetId}/cleaning`)}
              >
                Go to Cleaning
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="ds-fe-prereq-card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div className="ds-fe-prereq-content">
            <AlertTriangle size={24} style={{ color: '#f87171' }} />
            <div className="ds-fe-prereq-text">
              <h4 style={{ color: '#fca5a5' }}>Execution Error</h4>
              <p style={{ color: '#f87171' }}>{error}</p>
            </div>
          </div>
          <button className="ds-fe-prereq-btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} onClick={handleGenerateFeatures}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* ── Main Feature Engineering Form & Preview ── */}
      {(showOptionsForm || !engineeringResult) && (
        <div className="ds-fe-content-grid">
          {/* Options Panel */}
          <div className="ds-fe-options-card glass">
            <h3 className="ds-fe-section-title">
              <Wand2 size={18} style={{ color: '#818cf8' }} />
              Configure Feature Operations
            </h3>

            {/* Categorical Encoding */}

            <div className="ds-fe-option-group">
              <span className="ds-fe-group-label">
                <Code2 size={16} /> Categorical Encoding
              </span>
              <select
                className="ds-fe-select"
                value={encodingMethod}
                onChange={(e) => setEncodingMethod(e.target.value)}
                disabled={!allPrereqsMet || processing}
              >
                <option value="none">None (Keep Categorical Columns As-Is)</option>
                <option value="label">Label Encoding (Assign integer codes to categories)</option>
                <option value="one_hot">One-Hot Encoding (Create binary indicator columns)</option>
                <option value="ordinal">Ordinal Encoding (Ordered category mapping)</option>
              </select>
            </div>

          </div>


          {/* Live Preview Panel */}
          <div className="ds-fe-preview-card glass">
            <h4 className="ds-fe-preview-title">
              <Sparkles size={16} style={{ color: '#818cf8' }} />
              Estimated Changes
            </h4>

            <div className="ds-fe-preview-list">
              <div className="ds-fe-preview-item">
                <span className="ds-fe-preview-label">Columns Before:</span>
                <span className="ds-fe-preview-val">{preview?.columns_before ?? datasetVersion?.total_columns ?? 0}</span>
              </div>

              <div className="ds-fe-preview-item">
                <span className="ds-fe-preview-label">Estimated Columns After:</span>
                <span className="ds-fe-preview-val" style={{ color: '#34d399' }}>
                  {preview?.columns_after ?? datasetVersion?.total_columns ?? 0}
                </span>
              </div>

              <div className="ds-fe-preview-item">
                <span className="ds-fe-preview-label">Encoding Method:</span>
                <span className="ds-fe-preview-val" style={{ textTransform: 'capitalize' }}>
                  {encodingMethod}
                </span>
              </div>
            </div>

            {/* Run Button */}
            <button
              className="ds-fe-run-btn"
              disabled={!allPrereqsMet || processing}
              onClick={handleGenerateFeatures}
            >
              {processing ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Transforming Dataset...</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>Generate Features</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Engineering Results ── */}
      {engineeringResult && (
        <div className="ds-fe-results-section">
          <div className="ds-fe-stats-grid">
            {/* Rows Before */}
            <div className="ds-fe-stat-card glass">
              <div className="ds-fe-stat-icon" style={{ color: '#94a3b8' }}>
                <Layers size={20} />
              </div>
              <div className="ds-fe-stat-info">
                <span className="ds-fe-stat-val">{engineeringResult.rows_before ?? datasetVersion?.total_rows}</span>
                <span className="ds-fe-stat-label">Rows Before</span>
              </div>
            </div>

            {/* Rows After */}
            <div className="ds-fe-stat-card glass">
              <div className="ds-fe-stat-icon" style={{ color: '#34d399' }}>
                <CheckCircle2 size={20} />
              </div>
              <div className="ds-fe-stat-info">
                <span className="ds-fe-stat-val">{engineeringResult.rows_after ?? datasetVersion?.total_rows}</span>
                <span className="ds-fe-stat-label">Rows After</span>
              </div>
            </div>

            {/* Columns Before */}
            <div className="ds-fe-stat-card glass">
              <div className="ds-fe-stat-icon" style={{ color: '#94a3b8' }}>
                <Table size={20} />
              </div>
              <div className="ds-fe-stat-info">
                <span className="ds-fe-stat-val">{engineeringResult.columns_before ?? datasetVersion?.total_columns}</span>
                <span className="ds-fe-stat-label">Columns Before</span>
              </div>
            </div>

            {/* Columns After */}
            <div className="ds-fe-stat-card glass">
              <div className="ds-fe-stat-icon" style={{ color: '#818cf8' }}>
                <Wand2 size={20} />
              </div>
              <div className="ds-fe-stat-info">
                <span className="ds-fe-stat-val">{engineeringResult.columns_after ?? datasetVersion?.total_columns}</span>
                <span className="ds-fe-stat-label">Columns After</span>
              </div>
            </div>

            {/* Encoded Columns */}
            <div className="ds-fe-stat-card glass">
              <div className="ds-fe-stat-icon" style={{ color: '#c084fc' }}>
                <Code2 size={20} />
              </div>
              <div className="ds-fe-stat-info">
                <span className="ds-fe-stat-val">{engineeringResult.encoded_columns ?? 0}</span>
                <span className="ds-fe-stat-label">Encoded Columns</span>
              </div>
            </div>

            {/* Execution Duration */}
            <div className="ds-fe-stat-card glass">
              <div className="ds-fe-stat-icon" style={{ color: '#14b8a6' }}>
                <Clock size={20} />
              </div>
              <div className="ds-fe-stat-info">
                <span className="ds-fe-stat-val">{engineeringResult.execution_duration ?? '0.5s'}</span>
                <span className="ds-fe-stat-label">Execution Duration</span>
              </div>
            </div>
          </div>

          {/* Toggle Re-engineer Options */}
          {!showOptionsForm && (
            <div className="ds-fe-reclean-box glass">
              <div>
                <h4 className="ds-fe-reclean-title">Feature Engineered Dataset Available</h4>
                <p className="ds-fe-reclean-desc">
                  The dataset has been feature engineered and saved to <code>feature_engineered.csv</code>.
                </p>
              </div>
              <button
                className="ds-fe-prereq-btn"
                onClick={() => setShowOptionsForm(true)}
              >
                <Wand2 size={14} /> Update Feature Engineering
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

