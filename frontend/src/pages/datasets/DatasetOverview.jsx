/* ============================================================
   DatasetOverview — Active Dataset Overview Page
   Displays metadata, file stats, processing status & version history
   ============================================================ */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Calendar,
  HardDrive,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Braces,
  Settings,
  ArrowRight,
  Database,
  BarChart2,
} from 'lucide-react';
import datasetService from '../../services/datasetService';
import Button from '../../components/common/Button/Button';
import './DatasetOverview.css';

const FILE_ICONS = {
  csv:  <FileText size={28} strokeWidth={1.5} />,
  xlsx: <FileSpreadsheet size={28} strokeWidth={1.5} />,
  xls:  <FileSpreadsheet size={28} strokeWidth={1.5} />,
  json: <Braces size={28} strokeWidth={1.5} />,
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const DatasetOverview = () => {
  const { workspaceId, projectId, datasetId } = useParams();
  const navigate = useNavigate();

  const [dataset, setDataset]   = useState(null);
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      datasetService.getById(datasetId),
      datasetService.getVersions(datasetId).catch(() => []),
    ])
      .then(([ds, vers]) => {
        if (isMounted) {
          setDataset(ds);
          setVersions(vers || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load dataset');
          setIsLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [datasetId]);

  if (isLoading) {
    return (
      <div className="ds-overview-loading">
        <p>Loading dataset overview...</p>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="ds-overview-error glass">
        <AlertCircle size={24} className="ds-overview-err-icon" />
        <p>{error || 'Dataset not found'}</p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets`)}
        >
          Back to Datasets
        </Button>
      </div>
    );
  }

  // Version or fallback stats
  const latestVer = dataset.latest_version || (versions.length > 0 ? versions[0] : null) || {};
  const fileType  = (dataset.file_type || latestVer.file_type || '').toLowerCase().replace('.', '');
  const fileName  = dataset.original_file_name || latestVer.original_file_name || '—';
  const fileSize  = dataset.file_size ?? latestVer.file_size ?? 0;
  const status    = latestVer.processing_status || 'uploaded';
  const Icon      = FILE_ICONS[fileType] || <FileText size={28} strokeWidth={1.5} />;

  const baseUrl = `/workspaces/${workspaceId}/projects/${projectId}/datasets/${datasetId}`;

  return (
    <div className="ds-overview">
      {/* ── Header ── */}
      <motion.div
        className="ds-overview-header glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="ds-overview-header-left">
          <div className={`ds-overview-icon-badge ds-type--${fileType || 'default'}`}>
            {Icon}
          </div>
          <div className="ds-overview-header-info">
            <div className="ds-overview-title-row">
              <h1 className="ds-overview-title">{dataset.dataset_name}</h1>
              <span className={`ds-overview-type-tag ds-type--${fileType || 'default'}`}>
                {fileType ? fileType.toUpperCase() : 'FILE'}
              </span>
              <span className="ds-overview-ver-tag">
                v{dataset.current_version || 1}
              </span>
            </div>
            <p className="ds-overview-filename" title={fileName}>
              Original file: {fileName}
            </p>
            <div className="ds-overview-dates">
              <span>
                <Calendar size={12} /> Uploaded {formatDate(dataset.created_at || latestVer.uploaded_at)}
              </span>
              <span>
                <Clock size={12} /> Updated {formatDate(dataset.updated_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="ds-overview-header-actions">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Settings size={16} />}
            onClick={() => navigate(`${baseUrl}/settings`)}
          >
            Settings
          </Button>
          <Button
            variant="primary"
            size="md"
            rightIcon={<ArrowRight size={16} />}
            onClick={() => navigate(`${baseUrl}/validation`)}
          >
            Start Validation
          </Button>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="ds-overview-stats">
        <motion.div
          className="ds-stat-card glass"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div className="ds-stat-icon ds-stat-icon--size">
            <HardDrive size={20} />
          </div>
          <div className="ds-stat-text">
            <span className="ds-stat-val">{datasetService.formatFileSize(fileSize)}</span>
            <span className="ds-stat-lbl">FILE SIZE</span>
          </div>
        </motion.div>

        <motion.div
          className="ds-stat-card glass"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="ds-stat-icon ds-stat-icon--rows">
            <Database size={20} />
          </div>
          <div className="ds-stat-text">
            <span className="ds-stat-val">{latestVer.original_rows ?? '—'}</span>
            <span className="ds-stat-lbl">ROWS</span>
          </div>
        </motion.div>

        <motion.div
          className="ds-stat-card glass"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="ds-stat-icon ds-stat-icon--cols">
            <BarChart2 size={20} />
          </div>
          <div className="ds-stat-text">
            <span className="ds-stat-val">{latestVer.original_columns ?? '—'}</span>
            <span className="ds-stat-lbl">COLUMNS</span>
          </div>
        </motion.div>

        <motion.div
          className="ds-stat-card glass"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="ds-stat-icon ds-stat-icon--ver">
            <Layers size={20} />
          </div>
          <div className="ds-stat-text">
            <span className="ds-stat-val">{versions.length || 1}</span>
            <span className="ds-stat-lbl">VERSIONS</span>
          </div>
        </motion.div>
      </div>

      {/* ── Status Tracker ── */}
      <motion.div
        className="ds-overview-status-card glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <h2 className="ds-overview-section-title">ML Pipeline Status</h2>
        <div className="ds-status-steps">
          {(() => {
            const steps = [
              { key: 'uploaded', label: 'Uploaded' },
              { key: 'profiled', label: 'Profiled' },
              { key: 'cleaned', label: 'Cleaned' },
              { key: 'feature_engineered', label: 'Feature Engineered' },
              { key: 'ready_for_training', label: 'Ready for Training' },
              { key: 'trained', label: 'Trained' },
            ];
            const currentStepIdx = steps.findIndex((s) => s.key === status);
            return steps.map((st, i) => {
              const isDone = currentStepIdx >= 0 ? i <= currentStepIdx : i === 0;
              return (
                <div key={st.key} className={`ds-status-step ${isDone ? 'ds-status-step--done' : ''}`}>
                  <div className="ds-status-dot">
                    {isDone ? <CheckCircle2 size={16} /> : <span>{i + 1}</span>}
                  </div>
                  <span className="ds-status-label">{st.label}</span>
                </div>
              );
            });
          })()}
        </div>
      </motion.div>

      {/* ── Version History ── */}
      {versions.length > 0 && (
        <motion.div
          className="ds-overview-vers-card glass"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="ds-overview-vers-header">
            <h2 className="ds-overview-section-title">Version History</h2>
            <span className="ds-overview-ver-count">{versions.length} version{versions.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="ds-overview-vers-list">
            {versions.map((ver) => (
              <div key={ver._id || ver.version_number} className="ds-overview-ver-item">
                <div className="ds-overview-ver-left">
                  <span className="ds-ver-badge">v{ver.version_number}</span>
                  <div className="ds-ver-meta">
                    <span className="ds-ver-file">{ver.original_file_name}</span>
                    <span className="ds-ver-date">{formatDate(ver.uploaded_at)}</span>
                  </div>
                </div>
                <div className="ds-overview-ver-right">
                  <span className="ds-ver-size">{datasetService.formatFileSize(ver.file_size)}</span>
                  <span className="ds-ver-status">{ver.processing_status || 'uploaded'}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DatasetOverview;
