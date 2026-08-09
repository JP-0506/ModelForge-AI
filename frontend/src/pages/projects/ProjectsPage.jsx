/* ============================================================
   ProjectsPage — list of projects in the active workspace
   ============================================================ */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FolderOpen, RefreshCw, AlertCircle } from 'lucide-react';
import useProjects from '../../hooks/useProjects';
import ProjectCard from './components/ProjectCard/ProjectCard';
import ProjectFormModal from './components/ProjectFormModal/ProjectFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import Button from '../../components/common/Button/Button';
import './ProjectsPage.css';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const ProjectsPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { projects, isLoading, error, refetch, create, update, remove } = useProjects(workspaceId);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget]           = useState(null);
  const [deleteTarget, setDeleteTarget]       = useState(null);
  const [formLoading, setFormLoading]         = useState(false);
  const [deleteLoading, setDeleteLoading]     = useState(false);

  /* ── Create ── */
  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      const created = await create({
        project_name: data.project_name.trim(),
        problem_type: data.problem_type,
        description:  data.description?.trim() || '',
      });
      setShowCreateModal(false);
      // Auto-navigate to the new project overview
      navigate(`/workspaces/${workspaceId}/projects/${created._id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setFormLoading(false);
    }
  };

  /* ── Edit ── */
  const handleEdit = async (data) => {
    if (!editTarget) return;
    setFormLoading(true);
    try {
      await update(editTarget._id, {
        project_name: data.project_name.trim(),
        problem_type: data.problem_type,
        description:  data.description?.trim() || '',
      });
      setEditTarget(null);
    } catch (err) {
      console.error('Failed to edit project:', err);
    } finally {
      setFormLoading(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await remove(deleteTarget._id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const existingNames = projects.map((p) => p.project_name);

  return (
    <div className="proj-page">
      {/* ── Page Header ── */}
      <motion.div
        className="proj-page-header"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className="proj-page-title">Projects</h1>
          <p className="proj-page-subtitle">
            {isLoading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''} in this workspace`}
          </p>
        </div>
        <div className="proj-page-actions">
          <button
            className="proj-refresh-btn"
            onClick={refetch}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
          </button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            New Project
          </Button>
        </div>
      </motion.div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="proj-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={refetch}>Retry</button>
        </div>
      )}

      {/* ── Loading Skeleton Grid ── */}
      {isLoading && (
        <div className="proj-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="proj-card-skeleton glass">
              <div className="proj-sk-icon" />
              <div className="proj-sk-body">
                <div className="proj-sk-title" />
                <div className="proj-sk-desc" />
                <div className="proj-sk-stat" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && !error && projects.length === 0 && (
        <motion.div
          className="proj-empty glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="proj-empty-icon">
            <FolderOpen size={36} strokeWidth={1} />
          </div>
          <h2 className="proj-empty-title">No projects yet</h2>
          <p className="proj-empty-sub">
            Create your first machine learning project to upload datasets and build models.
          </p>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Project
          </Button>
        </motion.div>
      )}

      {/* ── Projects Grid ── */}
      {!isLoading && projects.length > 0 && (
        <motion.div
          className="proj-grid"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {projects.map((proj, i) => (
            <ProjectCard
              key={proj._id}
              project={proj}
              workspaceId={workspaceId}
              index={i}
              onEdit={(p) => setEditTarget(p)}
              onDelete={(p) => setDeleteTarget(p)}
            />
          ))}
        </motion.div>
      )}

      {/* ── Create Modal ── */}
      <ProjectFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={formLoading}
        existingNames={existingNames}
      />

      {/* ── Edit Modal ── */}
      <ProjectFormModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        isLoading={formLoading}
        editProject={editTarget}
        existingNames={existingNames}
      />

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
        title="Delete project?"
        message={`Are you sure you want to delete "${deleteTarget?.project_name}"? This action cannot be undone.`}
        confirmLabel="Delete Project"
      />
    </div>
  );
};

export default ProjectsPage;
