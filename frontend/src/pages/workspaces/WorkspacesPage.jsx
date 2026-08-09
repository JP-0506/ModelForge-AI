/* ============================================================
   WorkspacesPage — list of all workspaces
   ============================================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Folders, RefreshCw, AlertCircle } from 'lucide-react';
import useWorkspaces from '../../hooks/useWorkspaces';
import WorkspaceCard from './components/WorkspaceCard/WorkspaceCard';
import WorkspaceFormModal from './components/WorkspaceFormModal/WorkspaceFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import Button from '../../components/common/Button/Button';
import './WorkspacesPage.css';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const WorkspacesPage = () => {
  const navigate = useNavigate();
  const { workspaces, isLoading, error, refetch, create, update, remove } = useWorkspaces();

  // Modal states
  const [showCreateModal, setShowCreateModal]   = useState(false);
  const [editTarget, setEditTarget]             = useState(null);
  const [deleteTarget, setDeleteTarget]         = useState(null);
  const [formLoading, setFormLoading]           = useState(false);
  const [deleteLoading, setDeleteLoading]       = useState(false);
  const [formError, setFormError]               = useState('');

  /* ── Create ── */
  const handleCreate = async (data) => {
    setFormLoading(true);
    setFormError('');
    try {
      const created = await create({
        workspace_name: data.workspace_name.trim(),
        description:    data.description?.trim() || '',
      });
      setShowCreateModal(false);
      // Auto-navigate to the new workspace
      navigate(`/workspaces/${created._id}`);
    } catch (err) {
      setFormError(err.message || 'Failed to create workspace');
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
        workspace_name: data.workspace_name.trim(),
        description:    data.description?.trim() || '',
      });
      setEditTarget(null);
    } catch (err) {
      console.error(err);
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
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const existingNames = workspaces.map((w) => w.workspace_name);

  return (
    <div className="ws-page">
      {/* ── Page Header ── */}
      <motion.div
        className="ws-page-header"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className="ws-page-title">Workspaces</h1>
          <p className="ws-page-subtitle">
            {isLoading ? 'Loading…' : `${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="ws-page-actions">
          <button
            className="ws-refresh-btn"
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
            New Workspace
          </Button>
        </div>
      </motion.div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="ws-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={refetch}>Retry</button>
        </div>
      )}

      {/* ── Loading Skeleton Grid ── */}
      {isLoading && (
        <div className="ws-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ws-card-skeleton glass">
              <div className="ws-sk-icon" />
              <div className="ws-sk-body">
                <div className="ws-sk-title" />
                <div className="ws-sk-desc" />
                <div className="ws-sk-stat" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && !error && workspaces.length === 0 && (
        <motion.div
          className="ws-empty glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="ws-empty-icon">
            <Folders size={36} strokeWidth={1} />
          </div>
          <h2 className="ws-empty-title">No workspaces yet</h2>
          <p className="ws-empty-sub">
            Create your first workspace to start organising your ML projects.
          </p>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Workspace
          </Button>
        </motion.div>
      )}

      {/* ── Workspace Grid ── */}
      {!isLoading && workspaces.length > 0 && (
        <motion.div
          className="ws-grid"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {workspaces.map((ws, i) => (
            <WorkspaceCard
              key={ws._id}
              workspace={ws}
              projectCount={0}      // enriched lazily per card if needed
              index={i}
              onEdit={(w) => setEditTarget(w)}
              onDelete={(w) => setDeleteTarget(w)}
            />
          ))}
        </motion.div>
      )}

      {/* ── Create Modal ── */}
      <WorkspaceFormModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setFormError(''); }}
        onSubmit={handleCreate}
        isLoading={formLoading}
        existingNames={existingNames}
      />

      {/* ── Edit Modal ── */}
      <WorkspaceFormModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        isLoading={formLoading}
        editWorkspace={editTarget}
        existingNames={existingNames}
      />

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
        title="Delete workspace?"
        message={`"${deleteTarget?.workspace_name}" and all its data will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete Workspace"
      />
    </div>
  );
};

export default WorkspacesPage;
