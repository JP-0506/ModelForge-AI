/* ============================================================
   DatasetSettings — Edit Dataset Name + Read-only metadata + Delete
   ============================================================ */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  Trash2,
  AlertTriangle,
  FileText,
  Lock,
  CheckCircle2,
  Info,
} from 'lucide-react';
import datasetService from '../../services/datasetService';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import './DatasetSettings.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const DatasetSettings = () => {
  const { workspaceId, projectId, datasetId } = useParams();
  const navigate = useNavigate();

  const [dataset, setDataset]         = useState(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [isSaving, setIsSaving]       = useState(false);
  const [isDeleting, setIsDeleting]   = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError]             = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onBlur' });

  useEffect(() => {
    let isMounted = true;
    datasetService
      .getById(datasetId)
      .then((ds) => {
        if (isMounted && ds) {
          setDataset(ds);
          reset({ dataset_name: ds.dataset_name });
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load dataset settings');
          setIsLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [datasetId, reset]);

  const handleSave = async (data) => {
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);
    try {
      const updated = await datasetService.update(datasetId, {
        dataset_name: data.dataset_name.trim(),
      });
      setDataset((prev) => ({ ...prev, ...updated }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update dataset name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await datasetService.delete(datasetId);
      setShowDeleteConfirm(false);
      navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets`, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete dataset');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ds-settings-loading">
        <p>Loading dataset settings...</p>
      </div>
    );
  }

  const latestVer = dataset?.latest_version || {};
  const fileName  = dataset?.original_file_name || latestVer.original_file_name || '—';
  const fileType  = dataset?.file_type || latestVer.file_type || '—';
  const fileSize  = dataset?.file_size ?? latestVer.file_size ?? 0;
  const filePath  = latestVer.original_file_path || latestVer.stored_file_name || '—';

  return (
    <div className="ds-settings">
      {/* ── Header ── */}
      <div className="ds-settings-header">
        <div className="ds-settings-header-icon">
          <Settings size={22} strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="ds-settings-title">Dataset Settings</h1>
          <p className="ds-settings-subtitle">
            Manage dataset name and view non-editable metadata.
          </p>
        </div>
      </div>

      {error && (
        <div className="ds-settings-error">
          <span>{error}</span>
        </div>
      )}

      {/* ── Editable Settings Form ── */}
      <motion.div
        className="ds-settings-card glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="ds-settings-card-header">
          <h2 className="ds-settings-card-title">General Information</h2>
          <p className="ds-settings-card-subtitle">
            Update the display name for this dataset.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleSave)} noValidate className="ds-settings-form">
          <Input
            label="Dataset Name"
            type="text"
            leftIcon={<FileText size={18} strokeWidth={1.5} />}
            error={errors.dataset_name?.message}
            {...register('dataset_name', {
              required: 'Dataset name is required',
              minLength: { value: 2, message: 'Must be at least 2 characters' },
            })}
          />

          <div className="ds-settings-actions">
            {saveSuccess && (
              <span className="ds-settings-success">
                <CheckCircle2 size={16} /> Changes saved!
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets/${datasetId}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save size={16} />}
              isLoading={isSaving}
            >
              Save
            </Button>
          </div>
        </form>
      </motion.div>

      {/* ── Read-Only Metadata ── */}
      <motion.div
        className="ds-settings-card glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <div className="ds-settings-card-header">
          <div className="ds-readonly-title-row">
            <h2 className="ds-settings-card-title">Dataset Properties</h2>
            <span className="ds-readonly-badge">
              <Lock size={12} /> Read-only
            </span>
          </div>
          <p className="ds-settings-card-subtitle">
            System metadata and upload history cannot be edited.
          </p>
        </div>

        <div className="ds-readonly-grid">
          <div className="ds-readonly-item">
            <span className="ds-readonly-label">Uploaded File</span>
            <span className="ds-readonly-val font-mono">{fileName}</span>
          </div>

          <div className="ds-readonly-item">
            <span className="ds-readonly-label">File Type</span>
            <span className="ds-readonly-val">{fileType.toUpperCase()}</span>
          </div>

          <div className="ds-readonly-item">
            <span className="ds-readonly-label">File Size</span>
            <span className="ds-readonly-val">{datasetService.formatFileSize(fileSize)}</span>
          </div>

          <div className="ds-readonly-item">
            <span className="ds-readonly-label">Upload Date</span>
            <span className="ds-readonly-val">{formatDate(dataset?.created_at || latestVer.uploaded_at)}</span>
          </div>

          <div className="ds-readonly-item">
            <span className="ds-readonly-label">Dataset ID</span>
            <span className="ds-readonly-val font-mono">{dataset?._id}</span>
          </div>

          <div className="ds-readonly-item">
            <span className="ds-readonly-label">Project ID</span>
            <span className="ds-readonly-val font-mono">{dataset?.project_id}</span>
          </div>

          <div className="ds-readonly-item full-width">
            <span className="ds-readonly-label">Original File Path</span>
            <span className="ds-readonly-val font-mono">{filePath}</span>
          </div>

          <div className="ds-readonly-item full-width">
            <span className="ds-readonly-label">Current Version</span>
            <span className="ds-readonly-val">v{dataset?.current_version || 1}</span>
          </div>
        </div>
      </motion.div>

      {/* ── Danger Zone ── */}
      <motion.div
        className="ds-settings-danger-card glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <div className="ds-settings-danger-header">
          <div className="ds-settings-danger-icon">
            <AlertTriangle size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="ds-settings-danger-title">Danger Zone</h2>
            <p className="ds-settings-danger-subtitle">
              Irreversible actions for this dataset.
            </p>
          </div>
        </div>

        <div className="ds-settings-danger-content">
          <div className="ds-settings-danger-text">
            <span className="ds-settings-danger-label">Delete this dataset</span>
            <p className="ds-settings-danger-desc">
              Once deleted, all versions, profiling results, and feature metadata in this dataset will be permanently removed. This action cannot be undone.
            </p>
          </div>
          <Button
            variant="danger"
            size="md"
            leftIcon={<Trash2 size={16} />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Dataset
          </Button>
        </div>
      </motion.div>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete dataset?"
        message={`Are you sure you want to delete "${dataset?.dataset_name}"? This action cannot be undone.`}
        confirmLabel="Delete Dataset"
      />
    </div>
  );
};

export default DatasetSettings;
