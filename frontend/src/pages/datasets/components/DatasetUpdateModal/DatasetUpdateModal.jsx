/* ============================================================
   DatasetUpdateModal — Rename a dataset (update name only)
   ============================================================ */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, FileText } from 'lucide-react';
import Modal from '../../../../components/common/Modal/Modal';
import Input from '../../../../components/common/Input/Input';
import Button from '../../../../components/common/Button/Button';

const DatasetUpdateModal = ({ isOpen, onClose, dataset, onSave, isSaving }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onBlur' });

  // Pre-fill when dataset changes
  useEffect(() => {
    if (dataset) {
      reset({ dataset_name: dataset.dataset_name || '' });
    }
  }, [dataset, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data) => {
    onSave({ dataset_name: data.dataset_name.trim() });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rename Dataset"
      subtitle="Update the display name for this dataset"
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Input
          label="Dataset Name"
          type="text"
          leftIcon={<FileText size={18} strokeWidth={1.5} />}
          error={errors.dataset_name?.message}
          disabled={isSaving}
          {...register('dataset_name', {
            required: 'Dataset name is required',
            minLength: { value: 2, message: 'Must be at least 2 characters' },
          })}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <Button type="button" variant="ghost" size="md" onClick={handleClose} disabled={isSaving}>
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
    </Modal>
  );
};

export default DatasetUpdateModal;
