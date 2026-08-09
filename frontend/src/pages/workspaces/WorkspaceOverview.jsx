/* ============================================================
   WorkspaceOverview — Dashboard view for a specific workspace
   ============================================================ */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Folders,
  FolderOpen,
  Database,
  FlaskConical,
  Rocket,
  Plus,
  Calendar,
  HardDrive,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import workspaceService from '../../services/workspaceService';
import { setBreadcrumbCache } from '../../hooks/useBreadcrumb';
import StatCard from '../../components/cards/StatCard/StatCard';
import ActivityCard from '../../components/cards/ActivityCard/ActivityCard';
import Button from '../../components/common/Button/Button';
import './WorkspaceOverview.css';

const formatCreatedDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'Just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const WorkspaceOverview = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects]   = useState([]);
  const [datasets, setDatasets]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await workspaceService.getWithStats(workspaceId);
      setWorkspace(data.workspace);
      if (data.workspace?.workspace_name) {
        setBreadcrumbCache(workspaceId, data.workspace.workspace_name);
      }
      setProjects(data.projects || []);
      setDatasets(data.datasets || []);
    } catch (err) {
      setError(err.message || 'Failed to load workspace overview');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const activityItems = projects.map((p) => ({
    _id: p._id,
    name: p.project_name,
    type: 'project',
    sub: `Problem: ${p.problem_type}`,
    created_at: p.created_at,
  })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  return (
    <div className="ws-overview">
      {/* ── 1. Workspace Header ── */}
      <motion.div
        className="ws-overview-header glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="ws-overview-header-main">
          <div className="ws-overview-badge-icon">
            <Folders size={24} strokeWidth={1.5} />
          </div>
          <div className="ws-overview-header-text">
            <h1 className="ws-overview-title">
              {isLoading ? 'Loading workspace...' : workspace?.workspace_name}
            </h1>
            <p className="ws-overview-desc">
              {workspace?.description || 'Organise and manage all your machine learning projects in one place.'}
            </p>
            {workspace?.created_at && (
              <span className="ws-overview-date">
                <Calendar size={13} strokeWidth={1.5} />
                Created {formatCreatedDate(workspace.created_at)}
              </span>
            )}
          </div>
        </div>

        <div className="ws-overview-header-actions">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate(`/workspaces/${workspaceId}/projects`)}
          >
            Create Project
          </Button>
        </div>
      </motion.div>

      {/* ── 2. Workspace Summary Cards ── */}
      <div className="ws-overview-stats">
        <StatCard
          icon={FolderOpen}
          label="Projects"
          value={projects.length}
          color="primary"
          isLoading={isLoading}
          onClick={() => navigate(`/workspaces/${workspaceId}/projects`)}
        />
        <StatCard
          icon={Database}
          label="Datasets"
          value={datasets.length}
          color="success"
          isLoading={isLoading}
        />
        <StatCard
          icon={FlaskConical}
          label="Experiments"
          value={0}
          subLabel="in training"
          color="accent"
          isLoading={isLoading}
        />
        <StatCard
          icon={Rocket}
          label="Deployments"
          value={0}
          subLabel="active APIs"
          color="warning"
          isLoading={isLoading}
        />
      </div>

      {/* ── Empty State if no projects ── */}
      {!isLoading && projects.length === 0 && (
        <motion.div
          className="ws-overview-empty glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="ws-overview-empty-icon">
            <Sparkles size={32} strokeWidth={1.5} />
          </div>
          <h2 className="ws-overview-empty-title">
            Welcome to {workspace?.workspace_name || 'your workspace'}
          </h2>
          <p className="ws-overview-empty-subtitle">
            You don't have any projects yet. Create your first project to get started with dataset uploads, feature engineering, and model training.
          </p>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Plus size={18} />}
            onClick={() => navigate(`/workspaces/${workspaceId}/projects`)}
          >
            Create Project
          </Button>
        </motion.div>
      )}

      {/* ── Content Grid if projects exist ── */}
      {(!isLoading && projects.length > 0) && (
        <div className="ws-overview-grid">
          {/* Left Column: Recent Projects */}
          <div className="ws-overview-col glass">
            <div className="ws-overview-col-header">
              <h2 className="ws-overview-col-title">Recent Projects</h2>
              <button
                className="ws-overview-link-btn"
                onClick={() => navigate(`/workspaces/${workspaceId}/projects`)}
              >
                View all <ArrowRight size={13} />
              </button>
            </div>

            <div className="ws-overview-project-list">
              {recentProjects.map((p) => (
                <div
                  key={p._id}
                  className="ws-overview-project-item"
                  onClick={() => navigate(`/workspaces/${workspaceId}/projects/${p._id}`)}
                >
                  <div className="ws-overview-project-info">
                    <span className="ws-overview-project-name">{p.project_name}</span>
                    <span className="ws-overview-project-type">{p.problem_type}</span>
                  </div>
                  <span className={`ws-overview-project-badge ws-overview-project-badge--${p.status === 'Completed' ? 'success' : 'primary'}`}>
                    {p.status || 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Activity & Storage Usage */}
          <div className="ws-overview-col-group">
            {/* Storage Usage Card */}
            <div className="ws-overview-storage glass">
              <div className="ws-overview-storage-header">
                <div className="ws-overview-storage-icon">
                  <HardDrive size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="ws-overview-storage-title">Storage Usage</h3>
                  <span className="ws-overview-storage-sub">Dataset & Model artifacts</span>
                </div>
              </div>

              <div className="ws-overview-storage-val">
                <span className="ws-overview-storage-used">0.4 GB</span>
                <span className="ws-overview-storage-total">/ 10 GB</span>
              </div>

              <div className="ws-overview-progress-track">
                <div className="ws-overview-progress-bar" style={{ width: '4%' }} />
              </div>
            </div>

            {/* Recent Activity */}
            <ActivityCard
              title="Recent Activity"
              items={activityItems}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceOverview;
