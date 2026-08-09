/* ============================================================
   ExperimentCard — shows a recent project's status & problem type
   (Experiments live on training routes; this card shows projects
    with their status as a proxy for experiment activity)
   ============================================================ */

import { motion } from 'framer-motion';
import { FlaskConical, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ExperimentCard.css';

// Maps project status → badge color
const STATUS_COLOR = {
  'Draft':               'neutral',
  'Dataset Uploaded':    'primary',
  'Experiment Created':  'accent',
  'Training':            'warning',
  'Training Completed':  'success',
  'Model Compared':      'success',
  'Completed':           'success',
  'Model Deployed':      'success',
};

// Maps problem type → readable label
const PROBLEM_LABELS = {
  classification:    'Classification',
  regression:        'Regression',
  clustering:        'Clustering',
  forecasting:       'Forecasting',
  anomaly_detection: 'Anomaly Detection',
};

const ExperimentCard = ({ projects = [], isLoading = false }) => {
  const navigate = useNavigate();
  const skeletons = Array.from({ length: 3 });

  return (
    <div className="experiment-card glass">
      {/* Header */}
      <div className="experiment-card-header">
        <div className="experiment-card-header-left">
          <div className="experiment-card-icon">
            <FlaskConical size={16} strokeWidth={1.5} />
          </div>
          <h2 className="experiment-card-title">Recent Projects</h2>
        </div>
        {!isLoading && projects.length > 0 && (
          <button
            className="experiment-card-see-all"
            onClick={() => navigate('/workspaces')}
          >
            See all <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* List */}
      <div className="experiment-card-list">
        {isLoading
          ? skeletons.map((_, i) => (
              <div key={i} className="experiment-item experiment-item--skeleton">
                <div className="experiment-item-sk-left">
                  <div className="experiment-item-sk-name" />
                  <div className="experiment-item-sk-meta" />
                </div>
                <div className="experiment-item-sk-badge" />
              </div>
            ))
          : projects.length === 0
            ? (
              <div className="experiment-empty">
                <FlaskConical size={28} strokeWidth={1} />
                <p>No projects yet</p>
                <span>Create a workspace and start a project to see it here</span>
              </div>
            )
            : projects.map((project, i) => {
                const statusColor = STATUS_COLOR[project.status] || 'neutral';
                const problemLabel = PROBLEM_LABELS[project.problem_type] || project.problem_type;

                return (
                  <motion.div
                    key={project._id || i}
                    className="experiment-item"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    onClick={() =>
                      navigate(`/workspaces/${project.workspace_id}`)
                    }
                  >
                    {/* Left */}
                    <div className="experiment-item-left">
                      <div className="experiment-item-name-row">
                        <span className="experiment-item-name">
                          {project.project_name}
                        </span>
                      </div>
                      <div className="experiment-item-meta">
                        <span className="experiment-item-workspace">
                          {project.workspace_name}
                        </span>
                        <span className="experiment-item-dot">·</span>
                        <span className="experiment-item-type">
                          {problemLabel}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`experiment-item-badge experiment-item-badge--${statusColor}`}>
                      {project.status}
                    </span>
                  </motion.div>
                );
              })
        }
      </div>
    </div>
  );
};

export default ExperimentCard;
