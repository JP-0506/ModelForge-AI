/* ============================================================
   ProjectSettings — Rename, edit problem type, and delete project
   ============================================================ */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Settings, Save, Trash2, AlertTriangle, FolderOpen, CheckCircle2 } from 'lucide-react';
import projectService from '../../services/projectService';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import './ProjectSettings.css';

const PROBLEM_TYPES = [
  { value: 'classification', label: 'Classification (Categorize into classes)' },
  { value: 'regression',     label: 'Regression (Predict numeric values)' },
  { value: 'clustering',     label: 'Clustering (Group similar data points)' },
];

const ProjectSettings = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject]             = useState(null);
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
    projectService
      .getById(projectId)
      .then((proj) => {
        if (isMounted && proj) {
          setProject(proj);
          reset({
            project_name: proj.project_name,
            problem_type: proj.problem_type || 'regression',
            description: proj.description || '',
          });
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load project settings');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [projectId, reset]);

  const handleSave = async (data) => {
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);
    try {
      const updated = await projectService.update(projectId, {
        project_name: data.project_name.trim(),
        problem_type: data.problem_type,
        description: data.description?.trim() || '',
      });
      setProject(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await projectService.delete(projectId);
      setShowDeleteConfirm(false);
      navigate(`/workspaces/${workspaceId}/projects`, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete project');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="proj-settings-loading">
        <p>Loading project settings...</p>
      </div>
    );
  }

  return (
    <div className="proj-settings">
      {/* Header */}
      <div className="proj-settings-header">
        <div className="proj-settings-header-icon">
          <Settings size={22} strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="proj-settings-title">Project Settings</h1>
          <p className="proj-settings-subtitle">
            Manage project details, problem type, or delete this project.
          </p>
        </div>
      </div>

      {error && (
        <div className="proj-settings-error">
          <span>{error}</span>
        </div>
      )}

      {/* General Settings */}
      <motion.div
        className="proj-settings-card glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="proj-settings-card-header">
          <h2 className="proj-settings-card-title">General Information</h2>
          <p className="proj-settings-card-subtitle">
            Update project name, problem type, and description.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleSave)} noValidate className="proj-settings-form">
          <Input
            label="Project Name"
            type="text"
            leftIcon={<FolderOpen size={18} strokeWidth={1.5} />}
            error={errors.project_name?.message}
            {...register('project_name', {
              required: 'Project name is required',
              minLength: { value: 2, message: 'Must be at least 2 characters' },
            })}
          />

          <div className="proj-settings-group">
            <label className="proj-settings-label">
              Problem Type <span className="proj-settings-req">*</span>
            </label>
            <select
              className="proj-settings-select"
              {...register('problem_type', { required: 'Problem type is required' })}
            >
              {PROBLEM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Description (optional)"
            type="text"
            hint="Brief goal or summary of this project"
            error={errors.description?.message}
            {...register('description', {
              maxLength: { value: 200, message: 'Max 200 characters' },
            })}
          />

          <div className="proj-settings-actions">
            {saveSuccess && (
              <span className="proj-settings-success">
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

      {/* Danger Zone */}
      <motion.div
        className="proj-settings-danger-card glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <div className="proj-settings-danger-header">
          <div className="proj-settings-danger-icon">
            <AlertTriangle size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="proj-settings-danger-title">Danger Zone</h2>
            <p className="proj-settings-danger-subtitle">
              Irreversible actions for this project.
            </p>
          </div>
        </div>

        <div className="proj-settings-danger-content">
          <div className="proj-settings-danger-text">
            <span className="proj-settings-danger-label">Delete this project</span>
            <p className="proj-settings-danger-desc">
              Once deleted, all datasets, trained models, and configurations in this project will be permanently removed. This action cannot be undone.
            </p>
          </div>
          <Button
            variant="danger"
            size="md"
            leftIcon={<Trash2 size={16} />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Project
          </Button>
        </div>
      </motion.div>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete project?"
        message={`Are you sure you want to delete "${project?.project_name}"? This action cannot be undone.`}
        confirmLabel="Delete Project"
      />
    </div>
  );
};

export default ProjectSettings;
