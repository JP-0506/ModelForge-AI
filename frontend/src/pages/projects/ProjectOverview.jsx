/* ============================================================
   ProjectOverview — Main overview page for a specific project
   ============================================================ */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  Database,
  FlaskConical,
  Rocket,
  Plus,
  Calendar,
  Tag,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import projectService from '../../services/projectService';
import StatCard from '../../components/cards/StatCard/StatCard';
import Button from '../../components/common/Button/Button';
import './ProjectOverview.css';

const formatCreatedDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const ProjectOverview = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject]   = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getWithStats(projectId);
      setProject(data.project);
      setDatasets(data.datasets || []);
    } catch (err) {
      setError(err.message || 'Failed to load project overview');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div className="proj-overview">
      {/* Header */}
      <motion.div
        className="proj-overview-header glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="proj-overview-header-main">
          <div className="proj-overview-badge-icon">
            <FolderOpen size={24} strokeWidth={1.5} />
          </div>
          <div className="proj-overview-header-text">
            <div className="proj-overview-title-row">
              <h1 className="proj-overview-title">
                {isLoading ? 'Loading project...' : project?.project_name}
              </h1>
              {project?.problem_type && (
                <span className="proj-overview-type-tag">
                  <Tag size={12} strokeWidth={2} />
                  {project.problem_type}
                </span>
              )}
            </div>
            <p className="proj-overview-desc">
              {project?.description || 'Build, clean, profile, and train machine learning models for this project.'}
            </p>
            {project?.created_at && (
              <span className="proj-overview-date">
                <Calendar size={13} strokeWidth={1.5} />
                Created {formatCreatedDate(project.created_at)}
              </span>
            )}
          </div>
        </div>

        <div className="proj-overview-header-actions">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets`)}
          >
            Upload Dataset
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="proj-overview-stats">
        <StatCard
          icon={Database}
          label="Datasets"
          value={datasets.length}
          color="primary"
          isLoading={isLoading}
          onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets`)}
        />
        <StatCard
          icon={FlaskConical}
          label="Experiments"
          value={0}
          subLabel="models trained"
          color="accent"
          isLoading={isLoading}
        />
        <StatCard
          icon={Sparkles}
          label="Best Score"
          value="—"
          subLabel="accuracy"
          color="success"
          isLoading={isLoading}
        />
        <StatCard
          icon={Rocket}
          label="Status"
          value={project?.status || 'Draft'}
          color="warning"
          isLoading={isLoading}
        />
      </div>

      {/* Empty State when zero datasets */}
      {!isLoading && datasets.length === 0 && (
        <motion.div
          className="proj-overview-empty glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="proj-overview-empty-icon">
            <Database size={32} strokeWidth={1.5} />
          </div>
          <h2 className="proj-overview-empty-title">
            Upload your first dataset
          </h2>
          <p className="proj-overview-empty-subtitle">
            Upload CSV, Excel, or JSON data to get started with dataset validation, profiling, cleaning, EDA graphs, and training.
          </p>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Plus size={18} />}
            onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets`)}
          >
            Upload Dataset
          </Button>
        </motion.div>
      )}

      {/* Datasets Preview List */}
      {!isLoading && datasets.length > 0 && (
        <div className="proj-overview-datasets glass">
          <div className="proj-overview-ds-header">
            <h2 className="proj-overview-ds-title">Datasets</h2>
            <button
              className="proj-overview-link-btn"
              onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets`)}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          <div className="proj-overview-ds-list">
            {datasets.map((ds) => (
              <div key={ds._id} className="proj-overview-ds-item">
                <div className="proj-overview-ds-info">
                  <span className="proj-overview-ds-name">{ds.dataset_name}</span>
                  <span className="proj-overview-ds-ver">v{ds.current_version || 1}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/datasets/${ds._id}`)}
                >
                  Manage
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectOverview;
