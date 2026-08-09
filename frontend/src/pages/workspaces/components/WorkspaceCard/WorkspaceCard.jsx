/* ============================================================
   WorkspaceCard — card shown in the workspace list grid
   ============================================================ */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Folders, Calendar, Clock, MoreHorizontal, Pencil, Trash2, FolderOpen, Database } from 'lucide-react';
import './WorkspaceCard.css';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const WorkspaceCard = ({ workspace, onEdit, onDelete, index = 0 }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const projectCount = workspace.projectCount ?? 0;
  const datasetCount = workspace.datasetCount ?? 0;

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

  const handleCardClick = (e) => {
    // Don't navigate if clicking the 3-dot menu
    if (menuRef.current?.contains(e.target)) return;
    navigate(`/workspaces/${workspace._id}`);
  };

  return (
    <motion.div
      className="ws-card glass hover-lift"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      onClick={handleCardClick}
    >
      {/* ── Header ── */}
      <div className="ws-card-header">
        <div className="ws-card-icon">
          <Folders size={20} strokeWidth={1.5} />
        </div>

        {/* 3-dot menu */}
        <div className="ws-card-menu" ref={menuRef}>
          <button
            className="ws-card-menu-btn"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
            aria-label="Workspace options"
          >
            <MoreHorizontal size={16} strokeWidth={2} />
          </button>

          {menuOpen && (
            <motion.div
              className="ws-card-dropdown glass"
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <button
                className="ws-card-dropdown-item"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(workspace); }}
              >
                <Pencil size={14} strokeWidth={1.5} />
                Rename
              </button>
              <button
                className="ws-card-dropdown-item ws-card-dropdown-item--danger"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(workspace); }}
              >
                <Trash2 size={14} strokeWidth={1.5} />
                Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Name & Description ── */}
      <div className="ws-card-body">
        <h3 className="ws-card-name">{workspace.workspace_name}</h3>
        {workspace.description && (
          <p className="ws-card-desc">{workspace.description}</p>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="ws-card-stats">
        <div className="ws-card-stat">
          <FolderOpen size={13} strokeWidth={1.5} />
          <span>{projectCount} project{projectCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="ws-card-stat ws-card-stat--success">
          <Database size={13} strokeWidth={1.5} />
          <span>{datasetCount} dataset{datasetCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Dates ── */}
      <div className="ws-card-dates">
        <span className="ws-card-date">
          <Calendar size={12} strokeWidth={1.5} />
          {formatDate(workspace.created_at)}
        </span>
        <span className="ws-card-date">
          <Clock size={12} strokeWidth={1.5} />
          {formatDate(workspace.updated_at)}
        </span>
      </div>

      {/* Hover accent */}
      <div className="ws-card-accent" />
    </motion.div>
  );
};

export default WorkspaceCard;
