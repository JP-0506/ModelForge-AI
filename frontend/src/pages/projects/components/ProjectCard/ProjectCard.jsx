/* ============================================================
   ProjectCard — card shown in the projects list grid
   ============================================================ */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, Calendar, Clock, MoreHorizontal, Pencil, Trash2, Database, Tag } from 'lucide-react';
import './ProjectCard.css';

const PROBLEM_TYPE_LABELS = {
  regression:        { label: 'Regression', color: 'primary' },
  classification:    { label: 'Classification', color: 'accent' },
  clustering:        { label: 'Clustering', color: 'success' },
  anomaly_detection: { label: 'Anomaly Detection', color: 'warning' },
  time_series:       { label: 'Time Series', color: 'info' },
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ProjectCard = ({ project, workspaceId, onEdit, onDelete, index = 0 }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const datasetCount = project.datasetCount ?? 0;
  const problemMeta = PROBLEM_TYPE_LABELS[project.problem_type] || {
    label: project.problem_type,
    color: 'neutral',
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleCardClick = (e) => {
    if (menuRef.current?.contains(e.target)) return;
    navigate(`/workspaces/${workspaceId}/projects/${project._id}`);
  };

  return (
    <motion.div
      className="proj-card glass hover-lift"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="proj-card-header">
        <div className="proj-card-icon">
          <FolderOpen size={20} strokeWidth={1.5} />
        </div>

        {/* 3-dot menu */}
        <div className="proj-card-menu" ref={menuRef}>
          <button
            className="proj-card-menu-btn"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
            aria-label="Project options"
          >
            <MoreHorizontal size={16} strokeWidth={2} />
          </button>

          {menuOpen && (
            <motion.div
              className="proj-card-dropdown glass"
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <button
                className="proj-card-dropdown-item"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(project); }}
              >
                <Pencil size={14} strokeWidth={1.5} />
                Rename
              </button>
              <button
                className="proj-card-dropdown-item proj-card-dropdown-item--danger"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(project); }}
              >
                <Trash2 size={14} strokeWidth={1.5} />
                Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Name & Description */}
      <div className="proj-card-body">
        <div className="proj-card-title-row">
          <h3 className="proj-card-name">{project.project_name}</h3>
        </div>
        {project.description && (
          <p className="proj-card-desc">{project.description}</p>
        )}
      </div>

      {/* Badges / Stats */}
      <div className="proj-card-stats">
        <span className={`proj-card-type-badge proj-card-type-badge--${problemMeta.color}`}>
          <Tag size={11} strokeWidth={2} />
          {problemMeta.label}
        </span>

        <div className="proj-card-stat">
          <Database size={13} strokeWidth={1.5} />
          <span>{datasetCount} dataset{datasetCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Dates */}
      <div className="proj-card-dates">
        <span className="proj-card-date">
          <Calendar size={12} strokeWidth={1.5} />
          {formatDate(project.created_at)}
        </span>
        <span className="proj-card-date">
          <Clock size={12} strokeWidth={1.5} />
          {formatDate(project.updated_at)}
        </span>
      </div>

      {/* Hover accent */}
      <div className="proj-card-accent" />
    </motion.div>
  );
};

export default ProjectCard;
