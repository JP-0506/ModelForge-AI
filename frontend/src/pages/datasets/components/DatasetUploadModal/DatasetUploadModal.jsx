/* ============================================================
   DatasetUploadModal — Drag & drop file upload with progress
   ============================================================ */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Braces,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import Modal from '../../../../components/common/Modal/Modal';
import Input from '../../../../components/common/Input/Input';
import Button from '../../../../components/common/Button/Button';
import datasetService from '../../../../services/datasetService';
import './DatasetUploadModal.css';

const ACCEPTED_TYPES = {
  'text/csv':                                                           'csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel':                                          'xls',
  'application/json':                                                   'json',
};
const ACCEPTED_EXTS = ['.csv', '.xlsx', '.xls', '.json'];

const getFileIcon = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  if (ext === 'json') return <Braces size={20} strokeWidth={1.5} />;
  if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet size={20} strokeWidth={1.5} />;
  return <FileText size={20} strokeWidth={1.5} />;
};

const DatasetUploadModal = ({ isOpen, onClose, projectId, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onBlur' });

  const [selectedFile, setSelectedFile]     = useState(null);
  const [fileError, setFileError]           = useState('');
  const [isDragging, setIsDragging]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading]       = useState(false);
  const [uploadDone, setUploadDone]         = useState(false);
  const [serverError, setServerError]       = useState('');

  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return 'Please select a file';
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_EXTS.includes(ext)) {
      return `Unsupported file type. Accepted: ${ACCEPTED_EXTS.join(', ')}`;
    }
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      return 'File size must be under 100 MB';
    }
    return '';
  };

  const handleFileSelect = (file) => {
    const err = validateFile(file);
    setFileError(err);
    if (!err) setSelectedFile(file);
  };

  const handleDropZoneClick = () => fileInputRef.current?.click();

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleClose = () => {
    if (isUploading) return; // prevent close while uploading
    reset();
    setSelectedFile(null);
    setFileError('');
    setUploadProgress(0);
    setIsUploading(false);
    setUploadDone(false);
    setServerError('');
    onClose();
  };

  const onSubmit = async (data) => {
    if (!selectedFile) {
      setFileError('Please select a file to upload');
      return;
    }
    const fileErr = validateFile(selectedFile);
    if (fileErr) {
      setFileError(fileErr);
      return;
    }

    setServerError('');
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('dataset_name', data.dataset_name.trim());
    formData.append('project_id', projectId);
    formData.append('dataset', selectedFile);

    try {
      const created = await datasetService.upload(formData, (pct) => {
        setUploadProgress(pct);
      });
      setUploadDone(true);
      setUploadProgress(100);

      // Give a brief moment to show 100% before closing
      setTimeout(() => {
        handleClose();
        onSuccess(created);
      }, 600);
    } catch (err) {
      setServerError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Dataset"
      subtitle="Upload a CSV, Excel, or JSON file to get started"
      size="md"
      hideClose={isUploading}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="ds-upload-form">

        {/* Dataset Name */}
        <Input
          label="Dataset Name"
          type="text"
          placeholder="e.g. Customer Churn v1"
          error={errors.dataset_name?.message}
          disabled={isUploading}
          {...register('dataset_name', {
            required: 'Dataset name is required',
            minLength: { value: 2, message: 'Must be at least 2 characters' },
          })}
        />

        {/* Drag & Drop Zone */}
        <div className="ds-upload-group">
          <label className="ds-upload-label">Upload File <span className="ds-req">*</span></label>

          <div
            className={`ds-dropzone ${isDragging ? 'ds-dropzone--active' : ''} ${selectedFile ? 'ds-dropzone--has-file' : ''} ${isUploading ? 'ds-dropzone--disabled' : ''}`}
            onClick={!isUploading ? handleDropZoneClick : undefined}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={!isUploading ? handleDrop : undefined}
            role="button"
            tabIndex={isUploading ? -1 : 0}
            onKeyDown={(e) => e.key === 'Enter' && !isUploading && handleDropZoneClick()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTS.join(',')}
              onChange={handleFileInputChange}
              disabled={isUploading}
              style={{ display: 'none' }}
            />

            <AnimatePresence mode="wait">
              {selectedFile ? (
                <motion.div
                  key="file-selected"
                  className="ds-dropzone-file"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="ds-dropzone-file-icon">
                    {getFileIcon(selectedFile.name)}
                  </div>
                  <div className="ds-dropzone-file-info">
                    <span className="ds-dropzone-file-name">{selectedFile.name}</span>
                    <span className="ds-dropzone-file-size">
                      {datasetService.formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      className="ds-dropzone-clear"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFileError(''); }}
                      aria-label="Remove file"
                    >
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="file-empty"
                  className="ds-dropzone-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="ds-dropzone-icon">
                    <UploadCloud size={32} strokeWidth={1.5} />
                  </div>
                  <p className="ds-dropzone-text">
                    <strong>Drag & drop</strong> your file here
                  </p>
                  <p className="ds-dropzone-hint">or click to browse</p>
                  <p className="ds-dropzone-formats">Accepts: CSV, XLSX, XLS, JSON · Max 100 MB</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {fileError && <p className="ds-upload-error">{fileError}</p>}
        </div>

        {/* Upload Progress */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              className="ds-upload-progress"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="ds-upload-progress-header">
                {uploadDone ? (
                  <span className="ds-upload-progress-done">
                    <CheckCircle2 size={15} /> Upload complete!
                  </span>
                ) : (
                  <span className="ds-upload-progress-label">
                    <Loader2 size={14} className="ds-spin" /> Uploading... {uploadProgress}%
                  </span>
                )}
              </div>
              <div className="ds-upload-progress-bar">
                <motion.div
                  className="ds-upload-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Server Error */}
        {serverError && (
          <p className="ds-upload-server-error">{serverError}</p>
        )}

        {/* Actions */}
        <div className="ds-upload-actions">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={isUploading
              ? <Loader2 size={16} className="ds-spin" />
              : <UploadCloud size={16} />
            }
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Dataset'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DatasetUploadModal;
