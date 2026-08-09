/* ============================================================
   DatasetCleaning — Phase 8 Dataset Cleaning Page
   ============================================================ */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Play,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Copy,
  Trash2,
  Filter,
  Layers,
  Table,
  Clock,
  Zap,
  Sliders,
  Check,
  ChevronDown,
} from 'lucide-react';
import datasetService from '../../services/datasetService';
import Button from '../../components/common/Button/Button';
import './DatasetCleaning.css';

const DatasetCleaning = () => {
  const { datasetId } = useParams();

  const [dataset, setDataset] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);
  const [status, setStatus] = useState('not_cleaned'); // 'not_cleaned' | 'processing' | 'cleaned' | 'failed'
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOptionsForm, setShowOptionsForm] = useState(true);

  // Form State for Cleaning Options
  const [cleaningOptions, setCleaningOptions] = useState({
    remove_empty_rows: true,
    duplicates: { method: 'keep' }, // 'keep' | 'remove'
    missing_values: { method: 'none', value: 0 }, // 'none' | 'remove_rows' | 'remove_columns' | 'mean' | 'median' | 'mode' | 'forward_fill' | 'backward_fill' | 'constant'
    outliers: { method: 'none' }, // 'none' | 'remove_iqr' | 'cap' | 'remove_zscore'
    remove_constant_columns: false,
  });

  // Cleaning Preview State
  const [previewData, setPreviewData] = useState({
    total_rows: 0,
    total_columns: 0,
    estimated_rows_to_remove: 0,
    estimated_columns_to_remove: 0,
    estimated_missing_to_fill: 0,
    duplicate_rows: 0,
    constant_columns: 0,
  });

  // Cleaning Result Summary State
  const [cleaningResult, setCleaningResult] = useState(null);

  // Load Initial Dataset Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const ds = await datasetService.getById(datasetId);
      setDataset(ds);

      const versions = await datasetService.getVersions(datasetId);
      const activeVersion = versions.find((v) => v.version_number === (ds?.current_version || 1)) || versions[0];
      setLatestVersion(activeVersion);

      if (activeVersion && activeVersion.cleaned_file_path) {
        setStatus('cleaned');
        setShowOptionsForm(false);
        if (activeVersion.cleaning_summary) {
          setCleaningResult(activeVersion.cleaning_summary);
        } else {
          setCleaningResult({
            rows_before: activeVersion.original_rows || 0,
            rows_after: activeVersion.cleaned_rows || 0,
            columns_before: activeVersion.original_columns || 0,
            columns_after: activeVersion.cleaned_columns || 0,
            missing_values_removed: 0,
            duplicate_rows_removed: 0,
            outliers_removed: 0,
            columns_removed: (activeVersion.original_columns || 0) - (activeVersion.cleaned_columns || 0),
            cleaning_duration: 'N/A',
          });
        }
      } else {
        setStatus('not_cleaned');
        setShowOptionsForm(true);
      }
    } catch (err) {
      console.error('Failed to load cleaning dataset data:', err);
      setError(err.message || 'Failed to load dataset details');
    } finally {
      setIsLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch Live Preview Estimate when Cleaning Options change
  const fetchPreview = useCallback(async () => {
    if (!datasetId || isProcessing) return;
    setIsPreviewLoading(true);

    try {
      const res = await datasetService.previewClean(
        datasetId,
        dataset?.current_version || 1,
        cleaningOptions
      );
      if (res) {
        setPreviewData(res);
      }
    } catch (err) {
      console.warn('Preview calculation notice:', err.message);
    } finally {
      setIsPreviewLoading(false);
    }
  }, [datasetId, dataset, cleaningOptions, isProcessing]);

  useEffect(() => {
    if (!isLoading && dataset) {
      fetchPreview();
    }
  }, [cleaningOptions, isLoading, dataset, fetchPreview]);

  // Handle Option Changes
  const handleDuplicateMethodChange = (method) => {
    setCleaningOptions((prev) => ({
      ...prev,
      duplicates: { method },
    }));
  };

  const handleMissingMethodChange = (e) => {
    const method = e.target.value;
    setCleaningOptions((prev) => ({
      ...prev,
      missing_values: { ...prev.missing_values, method },
    }));
  };

  const handleMissingConstantValueChange = (e) => {
    const value = e.target.value;
    setCleaningOptions((prev) => ({
      ...prev,
      missing_values: { ...prev.missing_values, value },
    }));
  };

  const handleOutlierMethodChange = (e) => {
    const method = e.target.value;
    setCleaningOptions((prev) => ({
      ...prev,
      outliers: { method },
    }));
  };

  const handleConstantColumnsToggle = () => {
    setCleaningOptions((prev) => ({
      ...prev,
      remove_constant_columns: !prev.remove_constant_columns,
    }));
  };

  const handleEmptyRowsToggle = () => {
    setCleaningOptions((prev) => ({
      ...prev,
      remove_empty_rows: !prev.remove_empty_rows,
    }));
  };

  // Execute Cleaning Handler
  const handleRunCleaning = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setStatus('processing');
    setError('');

    try {
      const res = await datasetService.clean(
        datasetId,
        dataset?.current_version || 1,
        cleaningOptions
      );

      if (res) {
        setLatestVersion(res.version);
        if (res.cleaning_summary) {
          setCleaningResult(res.cleaning_summary);
        } else {
          setCleaningResult({
            rows_before: res.version.original_rows,
            rows_after: res.version.cleaned_rows,
            columns_before: res.version.original_columns,
            columns_after: res.version.cleaned_columns,
            missing_values_removed: 0,
            duplicate_rows_removed: 0,
            outliers_removed: 0,
            columns_removed: (res.version.original_columns || 0) - (res.version.cleaned_columns || 0),
            cleaning_duration: '0.5s',
          });
        }
        setStatus('cleaned');
        setShowOptionsForm(false);
      }
    } catch (err) {
      console.error('Data cleaning error:', err);
      setError(err.message || 'Dataset cleaning failed. Please check option parameters.');
      setStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ds-clean-page">
        <div className="ds-clean-loading-box glass">
          <Loader2 size={36} className="ds-clean-spinner" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading Dataset Cleaning module...</p>
        </div>
      </div>
    );
  }

  const datasetName = dataset?.dataset_name || 'Dataset Cleaning';
  const currentVersion = dataset?.current_version || 1;
  const fileTypeStr = datasetService.getFileTypeLabel(latestVersion?.file_type || dataset?.file_type);

  return (
    <div className="ds-clean-page">
      {/* ── Dataset Header ── */}
      <motion.div
        className="ds-clean-header glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="ds-clean-header-left">
          <div className="ds-clean-header-icon">
            <Sparkles size={26} />
          </div>
          <div>
            <div className="ds-clean-title-row">
              <h1 className="ds-clean-title">{datasetName}</h1>
              <span className="ds-clean-ver-badge">v{currentVersion}</span>
              <span className={`ds-clean-status-badge ds-clean-status--${status}`}>
                {isProcessing && <Loader2 size={12} className="ds-clean-spinner" />}
                {status === 'cleaned' && <CheckCircle2 size={12} />}
                {status === 'failed' && <AlertCircle size={12} />}
                {status === 'not_cleaned' && 'Not Cleaned'}
                {status === 'processing' && 'Cleaning Dataset...'}
                {status === 'cleaned' && 'Cleaned'}
                {status === 'failed' && 'Failed'}
              </span>
            </div>

            <div className="ds-clean-meta-grid">
              <div className="ds-clean-meta-item">
                <span className="ds-clean-meta-label">File Type</span>
                <span className="ds-clean-meta-val">{fileTypeStr || 'CSV'}</span>
              </div>
              <div className="ds-clean-meta-item">
                <span className="ds-clean-meta-label">Total Rows</span>
                <span className="ds-clean-meta-val">
                  {status === 'cleaned'
                    ? (latestVersion?.cleaned_rows?.toLocaleString() ?? latestVersion?.original_rows?.toLocaleString() ?? 0)
                    : (latestVersion?.original_rows?.toLocaleString() ?? 0)}
                </span>
              </div>
              <div className="ds-clean-meta-item">
                <span className="ds-clean-meta-label">Total Columns</span>
                <span className="ds-clean-meta-val">
                  {status === 'cleaned'
                    ? (latestVersion?.cleaned_columns ?? latestVersion?.original_columns ?? 0)
                    : (latestVersion?.original_columns ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {status === 'cleaned' && !showOptionsForm && (
          <div>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<RefreshCw size={16} />}
              onClick={() => setShowOptionsForm(true)}
            >
              Re-Clean Dataset
            </Button>
          </div>
        )}
      </motion.div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="ds-clean-error glass">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={handleRunCleaning} className="ds-clean-error-retry">
            Retry
          </button>
        </div>
      )}

      {/* ── Processing State Animation ── */}
      {isProcessing && (
        <motion.div
          className="ds-clean-loading-box glass"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Loader2 size={48} className="ds-clean-spinner" />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Processing Dataset Cleaning...
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px' }}>
            Executing duplicate row removal, missing value imputation, and outlier transformation steps. The original uploaded file will not be modified.
          </p>
        </motion.div>
      )}

      {/* ── Mode 1: Latest Cleaning Results (Summary Cards) ── */}
      {status === 'cleaned' && cleaningResult && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
        >
          {/* Summary Cards Grid (9 Cards) */}
          <div>
            <div className="ds-clean-section-header">
              <h2 className="ds-clean-section-title">
                <CheckCircle2 size={18} style={{ color: '#10b981' }} /> Cleaning Summary Results
              </h2>
            </div>

            <div className="ds-clean-result-grid">
              {/* Rows Before */}
              <div className="ds-clean-stat-card glass">
                <div className="ds-clean-stat-icon" style={{ color: '#6366f1' }}>
                  <Layers size={20} />
                </div>
                <div className="ds-clean-stat-info">
                  <span className="ds-clean-stat-val">{cleaningResult.rows_before?.toLocaleString() ?? 0}</span>
                  <span className="ds-clean-stat-label">Rows Before</span>
                </div>
              </div>

              {/* Rows After */}
              <div className="ds-clean-stat-card glass">
                <div className="ds-clean-stat-icon" style={{ color: '#10b981' }}>
                  <Check size={20} />
                </div>
                <div className="ds-clean-stat-info">
                  <span className="ds-clean-stat-val">{cleaningResult.rows_after?.toLocaleString() ?? 0}</span>
                  <span className="ds-clean-stat-label">Rows After</span>
                </div>
              </div>

              {/* Columns Before */}
              <div className="ds-clean-stat-card glass">
                <div className="ds-clean-stat-icon" style={{ color: '#3b82f6' }}>
                  <Table size={20} />
                </div>
                <div className="ds-clean-stat-info">
                  <span className="ds-clean-stat-val">{cleaningResult.columns_before ?? 0}</span>
                  <span className="ds-clean-stat-label">Columns Before</span>
                </div>
              </div>

              {/* Columns After */}
              <div className="ds-clean-stat-card glass">
                <div className="ds-clean-stat-icon" style={{ color: '#8b5cf6' }}>
                  <Table size={20} />
                </div>
                <div className="ds-clean-stat-info">
                  <span className="ds-clean-stat-val">{cleaningResult.columns_after ?? 0}</span>
                  <span className="ds-clean-stat-label">Columns After</span>
                </div>
              </div>

              {/* Missing Values Removed */}
              <div className="ds-clean-stat-card glass">
                <div className="ds-clean-stat-icon" style={{ color: '#f59e0b' }}>
                  <Filter size={20} />
                </div>
                <div className="ds-clean-stat-info">
                  <span className="ds-clean-stat-val">{cleaningResult.missing_values_removed?.toLocaleString() ?? 0}</span>
                  <span className="ds-clean-stat-label">Missing Values Removed</span>
                </div>
              </div>

              {/* Duplicate Rows Removed */}
              <div className="ds-clean-stat-card glass">
                <div className="ds-clean-stat-icon" style={{ color: '#ec4899' }}>
                  <Copy size={20} />
                </div>
                <div className="ds-clean-stat-info">
                  <span className="ds-clean-stat-val">{cleaningResult.duplicate_rows_removed?.toLocaleString() ?? 0}</span>
                  <span className="ds-clean-stat-label">Duplicate Rows Removed</span>
                </div>
              </div>

              {/* Outliers Removed */}
              <div className="ds-clean-stat-card glass">
                <div className="ds-clean-stat-icon" style={{ color: '#ef4444' }}>
                  <Zap size={20} />
                </div>
                <div className="ds-clean-stat-info">
                  <span className="ds-clean-stat-val">{cleaningResult.outliers_removed?.toLocaleString() ?? 0}</span>
                  <span className="ds-clean-stat-label">Outliers Removed</span>
                </div>
              </div>

              {/* Columns Removed */}
              <div className="ds-clean-stat-card glass">
                <div className="ds-clean-stat-icon" style={{ color: '#64748b' }}>
                  <Trash2 size={20} />
                </div>
                <div className="ds-clean-stat-info">
                  <span className="ds-clean-stat-val">{cleaningResult.columns_removed ?? 0}</span>
                  <span className="ds-clean-stat-label">Columns Removed</span>
                </div>
              </div>

              {/* Cleaning Duration */}
              <div className="ds-clean-stat-card glass">
                <div className="ds-clean-stat-icon" style={{ color: '#14b8a6' }}>
                  <Clock size={20} />
                </div>
                <div className="ds-clean-stat-info">
                  <span className="ds-clean-stat-val">{cleaningResult.cleaning_duration ?? '0.4s'}</span>
                  <span className="ds-clean-stat-label">Cleaning Duration</span>
                </div>
              </div>
            </div>
          </div>



          {/* Re-clean banner toggle if form hidden */}
          {!showOptionsForm && (
            <div className="ds-clean-reclean-box glass">
              <div className="ds-clean-reclean-info">
                <Sliders size={20} style={{ color: '#6366f1' }} />
                <div>
                  <h3 className="ds-clean-reclean-title">Need to adjust cleaning criteria?</h3>
                  <p className="ds-clean-reclean-sub">
                    You can modify options (duplicate removal, missing value imputation, outlier clipping) and re-run cleaning at any time.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="md"
                leftIcon={<RefreshCw size={16} />}
                onClick={() => setShowOptionsForm(true)}
              >
                Update Cleaning Options
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Mode 2: Cleaning Options & Live Preview ── */}
      {(showOptionsForm || status === 'not_cleaned') && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="ds-clean-grid"
        >
          {/* Options Options Form */}
          <div className="ds-clean-options-card glass">
            <div className="ds-clean-section-header">
              <h2 className="ds-clean-section-title">
                <Sliders size={18} /> Manual Cleaning Options
              </h2>
            </div>

            {/* 1. Duplicate Handling */}
            <div className="ds-clean-option-group">
              <span className="ds-clean-group-label">
                <Copy size={16} /> Duplicate Row Handling
              </span>
              <p className="ds-clean-group-desc">
                Choose how identical duplicate rows across all features should be handled.
              </p>

              <div className="ds-clean-radio-grid">
                <button
                  type="button"
                  className={`ds-clean-radio-card ${cleaningOptions.duplicates.method === 'keep' ? 'ds-clean-radio-card--active' : ''}`}
                  onClick={() => handleDuplicateMethodChange('keep')}
                >
                  <div className="ds-clean-radio-circle" />
                  <span>Keep All Duplicates</span>
                </button>
                <button
                  type="button"
                  className={`ds-clean-radio-card ${cleaningOptions.duplicates.method === 'remove' ? 'ds-clean-radio-card--active' : ''}`}
                  onClick={() => handleDuplicateMethodChange('remove')}
                >
                  <div className="ds-clean-radio-circle" />
                  <span>Remove Duplicates</span>
                </button>
              </div>
            </div>

            {/* 2. Missing Value Handling */}
            <div className="ds-clean-option-group">
              <span className="ds-clean-group-label">
                <Filter size={16} /> Missing Value Handling
              </span>
              <p className="ds-clean-group-desc">
                Select strategy for null or empty values present in columns.
              </p>

              <select
                className="ds-clean-select"
                value={cleaningOptions.missing_values.method}
                onChange={handleMissingMethodChange}
              >
                <option value="none">Do nothing (Keep missing values)</option>
                <option value="remove_rows">Remove rows with missing values</option>
                <option value="remove_columns">Remove columns with missing values</option>
                <option value="mean">Impute with Mean (Numeric columns)</option>
                <option value="median">Impute with Median (Numeric columns)</option>
                <option value="mode">Impute with Mode (Most Frequent)</option>
                <option value="forward_fill">Forward Fill (ffill)</option>
                <option value="backward_fill">Backward Fill (bfill)</option>
              </select>
            </div>


            {/* 3. Outlier Handling */}
            <div className="ds-clean-option-group">
              <span className="ds-clean-group-label">
                <Zap size={16} /> Outlier Handling
              </span>
              <p className="ds-clean-group-desc">
                Detect and clean extreme statistical outliers in numerical features.
              </p>

              <select
                className="ds-clean-select"
                value={cleaningOptions.outliers.method}
                onChange={handleOutlierMethodChange}
              >
                <option value="none">Do nothing (Keep outliers)</option>
                <option value="remove_iqr">Remove outlier rows (IQR Method: 1.5 * IQR)</option>
              </select>

            </div>

            {/* 4. Constant Columns Removal */}
            <div className="ds-clean-option-group">
              <span className="ds-clean-group-label">
                <Trash2 size={16} /> Column Removal Rules
              </span>

              <label className="ds-clean-checkbox-label">
                <input
                  type="checkbox"
                  className="ds-clean-checkbox"
                  checked={cleaningOptions.remove_constant_columns}
                  onChange={handleConstantColumnsToggle}
                />
                <span>Remove Constant Columns (Remove columns where every row has the same value)</span>

              </label>

              <label className="ds-clean-checkbox-label" style={{ marginTop: '6px' }}>
                <input
                  type="checkbox"
                  className="ds-clean-checkbox"
                  checked={cleaningOptions.remove_empty_rows}
                  onChange={handleEmptyRowsToggle}
                />
                <span>Remove fully empty rows</span>
              </label>
            </div>
          </div>

          {/* Right Side: Cleaning Preview Panel & Action */}
          <div className="ds-clean-preview-card glass">
            <div className="ds-clean-preview-header">
              <h3 className="ds-clean-preview-title">
                <Sparkles size={16} style={{ color: '#6366f1' }} /> Cleaning Preview
              </h3>
              {isPreviewLoading && <Loader2 size={14} className="ds-clean-spinner" />}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Estimated transformations based on your selected cleaning options:
            </p>

            <div className="ds-clean-preview-list">
              <div className="ds-clean-preview-item">
                <span className="ds-clean-preview-item-label">Rows to Remove</span>
                <span className="ds-clean-preview-item-val ds-clean-preview-item-val--danger">
                  {previewData.estimated_rows_to_remove ?? 0}
                </span>
              </div>

              <div className="ds-clean-preview-item">
                <span className="ds-clean-preview-item-label">Columns to Remove</span>
                <span className="ds-clean-preview-item-val ds-clean-preview-item-val--warning">
                  {previewData.estimated_columns_to_remove ?? 0}
                </span>
              </div>

              <div className="ds-clean-preview-item">
                <span className="ds-clean-preview-item-label">Missing Values to Fill</span>
                <span className="ds-clean-preview-item-val ds-clean-preview-item-val--highlight">
                  {previewData.estimated_missing_to_fill ?? 0}
                </span>
              </div>

              <div className="ds-clean-preview-item">
                <span className="ds-clean-preview-item-label">Duplicate Rows Found</span>
                <span className="ds-clean-preview-item-val">
                  {previewData.duplicate_rows ?? 0}
                </span>
              </div>

              <div className="ds-clean-preview-item">
                <span className="ds-clean-preview-item-label">Constant Columns Found</span>
                <span className="ds-clean-preview-item-val">
                  {previewData.constant_columns ?? 0}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              leftIcon={isProcessing ? <Loader2 size={18} className="ds-clean-spinner" /> : <Play size={18} />}
              onClick={handleRunCleaning}
              disabled={isProcessing}
              fullWidth
            >
              {isProcessing ? 'Executing Cleaning...' : 'Run Cleaning'}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DatasetCleaning;
