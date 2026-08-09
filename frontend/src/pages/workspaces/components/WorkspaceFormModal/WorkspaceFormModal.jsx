/* ============================================================
   WorkspaceFormModal — Create & Edit workspace (shared modal)
   ============================================================ */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Folders } from 'lucide-react';
import Modal from '../../../../components/common/Modal/Modal';
import Input from '../../../../components/common/Input/Input';
import Button from '../../../../components/common/Button/Button';

const WorkspaceFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editWorkspace = null,   // if provided → edit mode
  existingNames = [],     // for duplicate validation
}) => {
  const isEdit = !!editWorkspace;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    mode: 'onBlur',
    defaultValues: { workspace_name: '', description: '' },
  });

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      reset(
        isEdit
          ? { workspace_name: editWorkspace.workspace_name, description: editWorkspace.description || '' }
          : { workspace_name: '', description: '' }
      );
    }
  }, [isOpen, isEdit, editWorkspace, reset]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Rename Workspace' : 'Create Workspace'}
      subtitle={isEdit ? 'Update the workspace name or description.' : 'Workspaces help you organise your ML projects.'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Workspace name"
            type="text"
            leftIcon={<Folders size={18} strokeWidth={1.5} />}
            error={errors.workspace_name?.message}
            {...register('workspace_name', {
              required: 'Workspace name is required',
              minLength: { value: 2, message: 'Must be at least 2 characters' },
              validate: (val) => {
                const trimmed = val.trim().toLowerCase();
                const names = existingNames
                  .filter((n) => n !== editWorkspace?.workspace_name)
                  .map((n) => n.toLowerCase());
                return !names.includes(trimmed) || 'A workspace with this name already exists';
              },
            })}
          />

          <Input
            label="Description (optional)"
            type="text"
            hint="What is this workspace for?"
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
            {isEdit ? 'Save Changes' : 'Create Workspace'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WorkspaceFormModal;
