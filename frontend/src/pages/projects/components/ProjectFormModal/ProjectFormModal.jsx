/* ============================================================
   ProjectFormModal — Create & Edit Project Modal
   ============================================================ */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FolderOpen } from 'lucide-react';
import Modal from '../../../../components/common/Modal/Modal';
import Input from '../../../../components/common/Input/Input';
import Button from '../../../../components/common/Button/Button';
import './ProjectFormModal.css';

const PROBLEM_TYPES = [
  { value: 'classification', label: 'Classification (Categorize into classes)' },
  { value: 'regression',     label: 'Regression (Predict numeric values)' },
  { value: 'clustering',     label: 'Clustering (Group similar data points)' },
];

const ProjectFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editProject = null,     // if provided -> edit mode
  existingNames = [],     // for duplicate validation
}) => {
  const isEdit = !!editProject;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    mode: 'onBlur',
    defaultValues: { project_name: '', problem_type: 'regression', description: '' },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        isEdit
          ? {
              project_name: editProject.project_name,
              problem_type: editProject.problem_type || 'regression',
              description: editProject.description || '',
            }
          : { project_name: '', problem_type: 'regression', description: '' }
      );
    }
  }, [isOpen, isEdit, editProject, reset]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Project' : 'Create Project'}
      subtitle={isEdit ? 'Update project name, type, or description.' : 'Define your machine learning problem type and metadata.'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <div className="proj-form-body">
          {/* Project Name */}
          <Input
            label="Project Name"
            type="text"
            leftIcon={<FolderOpen size={18} strokeWidth={1.5} />}
            error={errors.project_name?.message}
            {...register('project_name', {
              required: 'Project name is required',
              minLength: { value: 2, message: 'Must be at least 2 characters' },
              validate: (val) => {
                const trimmed = val.trim().toLowerCase();
                const names = existingNames
                  .filter((n) => n !== editProject?.project_name)
                  .map((n) => n.toLowerCase());
                return !names.includes(trimmed) || 'A project with this name already exists in this workspace';
              },
            })}
          />

          {/* Problem Type Select */}
          <div className="proj-form-group">
            <label className="proj-form-label">
              Problem Type <span className="proj-form-req">*</span>
            </label>
            <select
              className={`proj-form-select ${errors.problem_type ? 'proj-form-select--error' : ''}`}
              {...register('problem_type', { required: 'Problem type is required' })}
            >
              {PROBLEM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.problem_type && (
              <span className="proj-form-error">{errors.problem_type.message}</span>
            )}
          </div>

          {/* Description */}
          <Input
            label="Description (optional)"
            type="text"
            hint="What is the goal of this project?"
            error={errors.description?.message}
            {...register('description', {
              maxLength: { value: 200, message: 'Max 200 characters' },
            })}
          />
        </div>

        <div className="modal-footer">
          <Button variant="ghost" size="md" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectFormModal;
