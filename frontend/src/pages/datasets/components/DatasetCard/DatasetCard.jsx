/* ============================================================
   DatasetCard — Card displaying a dataset in the grid
   ============================================================ */

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  FileSpreadsheet,
  Braces,
  Calendar,
  Clock,
  HardDrive,
} from 'lucide-react';
import datasetService from '../../../../services/datasetService';
import './DatasetCard.css';

const FILE_ICONS = {
  csv:  <FileText size={22} strokeWidth={1.5} />,
  xlsx: <FileSpreadsheet size={22} strokeWidth={1.5} />,
  xls:  <FileSpreadsheet size={22} strokeWidth={1.5} />,
  json: <Braces size={22} strokeWidth={1.5} />,
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const DatasetCard = ({ dataset, onUpdate, onDelete }) => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const rawFileType = dataset.file_type || dataset.latest_version?.file_type || '';
  const rawFileName = dataset.original_file_name || dataset.latest_version?.original_file_name || '';

  const fileType    = datasetService.parseFileType(rawFileType, rawFileName);
  const fileName    = rawFileName || '—';
  const fileSize    = dataset.file_size ?? dataset.latest_version?.file_size ?? 0;
  const uploadedAt  = dataset.created_at || dataset.latest_version?.uploaded_at;
  const updatedAt   = dataset.updated_at;

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleCardClick = () => {
    navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets/${dataset._id}`);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onUpdate(dataset);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(dataset);
  };

  const Icon = FILE_ICONS[fileType] || <FileText size={22} strokeWidth={1.5} />;

  return (
    <motion.div
      className="ds-card glass"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      {/* Top row — icon, type badge, menu */}
      <div className="ds-card-top">
        <div className={`ds-card-icon-wrap ds-type--${fileType || 'default'}`}>
          {Icon}
        </div>

        <div className="ds-card-top-right">
          <span className={`ds-card-type-badge ds-type--${fileType || 'default'}`}>
            {fileType ? fileType.toUpperCase() : 'FILE'}
          </span>

          {/* 3-dot menu */}
          <div className="ds-card-menu-wrap" ref={menuRef}>
            <button
              className="ds-card-menu-btn"
              onClick={handleMenuToggle}
              aria-label="Dataset options"
              title="Options"
            >
              <MoreHorizontal size={16} strokeWidth={1.5} />
            </button>

            {menuOpen && (
              <motion.div
                className="ds-card-menu glass"
                initial={{ opacity: 0, scale: 0.92, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="ds-card-menu-item" onClick={handleRename}>
                  <Pencil size={14} strokeWidth={1.5} />
                  <span>Rename</span>
                </button>
                <div className="ds-card-menu-divider" />
                <button className="ds-card-menu-item ds-card-menu-item--danger" onClick={handleDelete}>
                  <Trash2 size={14} strokeWidth={1.5} />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Dataset name */}
      <h3 className="ds-card-name">{dataset.dataset_name || 'Untitled Dataset'}</h3>

      {/* Original filename */}
      <p className="ds-card-filename" title={fileName}>{fileName}</p>

      {/* File size */}
      <div className="ds-card-size">
        <HardDrive size={12} strokeWidth={1.5} />
        <span>{datasetService.formatFileSize(fileSize)}</span>
      </div>

      {/* Dates */}
      <div className="ds-card-dates">
        <span className="ds-card-date">
          <Calendar size={12} strokeWidth={1.5} />
          {formatDate(uploadedAt)}
        </span>
        <span className="ds-card-date">
          <Clock size={12} strokeWidth={1.5} />
          {formatDate(updatedAt)}
        </span>
      </div>
    </motion.div>
  );
};

export default DatasetCard;
