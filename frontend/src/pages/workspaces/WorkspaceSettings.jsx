/* ============================================================
   WorkspaceSettings — Rename and Delete workspace
   ============================================================ */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Settings, Save, Trash2, AlertTriangle, Folders, CheckCircle2 } from 'lucide-react';
import workspaceService from '../../services/workspaceService';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import './WorkspaceSettings.css';

const WorkspaceSettings = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace]         = useState(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [isSaving, setIsSaving]           = useState(false);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess]     = useState(false);
  const [error, setError]                 = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    mode: 'onBlur',
  });

  useEffect(() => {
    let isMounted = true;
    workspaceService
      .getById(workspaceId)
      .then((ws) => {
        if (isMounted) {
          setWorkspace(ws);
          reset({
            workspace_name: ws.workspace_name,
            description: ws.description || '',
          });
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load workspace settings');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [workspaceId, reset]);

  const handleSave = async (data) => {
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);
    try {
      const updated = await workspaceService.update(workspaceId, {
        workspace_name: data.workspace_name.trim(),
        description: data.description?.trim() || '',
      });
      setWorkspace(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update workspace');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await workspaceService.delete(workspaceId);
      setShowDeleteConfirm(false);
      navigate('/workspaces', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete workspace');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ws-settings-loading">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="ws-settings">
      {/* ── Page Header ── */}
      <div className="ws-settings-header">
        <div className="ws-settings-header-icon">
          <Settings size={22} strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="ws-settings-title">Workspace Settings</h1>
          <p className="ws-settings-subtitle">
            Manage general settings, rename, or delete this workspace.
          </p>
        </div>
      </div>

      {error && (
        <div className="ws-settings-error">
          <span>{error}</span>
        </div>
      )}

      {/* ── General Settings Card ── */}
      <motion.div
        className="ws-settings-card glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="ws-settings-card-header">
          <h2 className="ws-settings-card-title">General Information</h2>
          <p className="ws-settings-card-subtitle">
            Update your workspace name and description.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleSave)} noValidate className="ws-settings-form">
          <Input
            label="Workspace name"
            type="text"
            leftIcon={<Folders size={18} strokeWidth={1.5} />}
            error={errors.workspace_name?.message}
            {...register('workspace_name', {
              required: 'Workspace name is required',
              minLength: { value: 2, message: 'Must be at least 2 characters' },
            })}
          />

          <Input
            label="Description (optional)"
            type="text"
            hint="Brief summary of what this workspace contains"
            error={errors.description?.message}
            {...register('description', {
              maxLength: { value: 200, message: 'Max 200 characters' },
            })}
          />

          <div className="ws-settings-actions">
            {saveSuccess && (
              <span className="ws-settings-success">
                <CheckCircle2 size={16} /> Changes saved successfully!
              </span>
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save size={16} />}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>

      {/* ── Danger Zone Card ── */}
      <motion.div
        className="ws-settings-danger-card glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <div className="ws-settings-danger-header">
          <div className="ws-settings-danger-icon">
            <AlertTriangle size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="ws-settings-danger-title">Danger Zone</h2>
            <p className="ws-settings-danger-subtitle">
              Irreversible actions for this workspace.
            </p>
          </div>
        </div>

        <div className="ws-settings-danger-content">
          <div className="ws-settings-danger-text">
            <span className="ws-settings-danger-label">Delete this workspace</span>
            <p className="ws-settings-danger-desc">
              Once deleted, all projects and datasets within this workspace will be permanently removed. This action cannot be undone.
            </p>
          </div>
          <Button
            variant="danger"
            size="md"
            leftIcon={<Trash2 size={16} />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Workspace
          </Button>
        </div>
      </motion.div>

      {/* ── Delete Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete workspace?"
        message={`Are you sure you want to delete "${workspace?.workspace_name}"? This action cannot be undone.`}
        confirmLabel="Delete Workspace"
      />
    </div>
  );
};

export default WorkspaceSettings;
