/* ============================================================
   Dashboard Page — Phase 2
   Live stats from Node.js backend via useDashboard hook
   ============================================================ */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Folders, FolderOpen, Database, FlaskConical,
  RefreshCw, AlertCircle, Plus,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useDashboard from '../../hooks/useDashboard';
import Button from '../../components/common/Button/Button';
import StatCard from '../../components/cards/StatCard/StatCard';
import ActivityCard from '../../components/cards/ActivityCard/ActivityCard';
import ExperimentCard from '../../components/cards/ExperimentCard/ExperimentCard';
import './Dashboard.css';

/* ── Animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

/* ── Greeting helper ── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, isLoading, error, refetch } = useDashboard();
  const navigate = useNavigate();

  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  /* ── Build activity feed from workspaces + projects ── */
  const activityItems = [
    ...stats.recentWorkspaces.map((ws) => ({
      _id:        ws._id,
      name:       ws.workspace_name,
      type:       'workspace',
      created_at: ws.created_at,
    })),
    ...stats.recentProjects.map((p) => ({
      _id:        p._id,
      name:       p.project_name,
      type:       'project',
      sub:        p.workspace_name,
      created_at: p.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
   .slice(0, 8);

  /* ── Stat cards definition ── */
  const statCards = [
    {
      icon:     Folders,
      label:    'Workspaces',
      value:    stats.workspaceCount,
      color:    'primary',
      delay:    0,
      onClick:  () => navigate('/workspaces'),
    },
    {
      icon:     FolderOpen,
      label:    'Projects',
      value:    stats.projectCount,
      color:    'accent',
      delay:    0.08,
      onClick:  () => navigate('/workspaces'),
    },
    {
      icon:     Database,
      label:    'Datasets',
      value:    stats.datasetCount,
      color:    'success',
      delay:    0.16,
    },
    {
      icon:     FlaskConical,
      label:    'Experiments',
      value:    '—',
      subLabel: 'training phase',
      color:    'warning',
      delay:    0.24,
    },
  ];

  return (
    <div className="dashboard-page">

      {/* ── Welcome Header ── */}
      <motion.div
        className="dashboard-welcome"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="dashboard-welcome-text">
          <p className="dashboard-greeting">👋 {getGreeting()}</p>
          <h1 className="dashboard-title">{firstName},</h1>
          <p className="dashboard-subtitle">
            Here's an overview of your ModelForge AI workspace.
          </p>
        </div>

        {/* Quick Action */}
        <div className="dashboard-welcome-actions">
          <button
            className="dashboard-refresh-btn"
            onClick={refetch}
            disabled={isLoading}
            title="Refresh"
            aria-label="Refresh dashboard"
          >
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
          </button>
        </div>
      </motion.div>

      {/* ── Error Banner ── */}
      {error && (
        <motion.div
          className="dashboard-error"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={refetch}>Retry</button>
        </motion.div>
      )}

      {/* ── Stat Cards ── */}
      <motion.div
        className="dashboard-stats-grid"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {statCards.map(({ icon, label, value, subLabel, color, delay, onClick }) => (
          <StatCard
            key={label}
            icon={icon}
            label={label}
            value={value}
            subLabel={subLabel}
            color={color}
            delay={delay}
            isLoading={isLoading}
            onClick={onClick}
          />
        ))}
      </motion.div>

      {/* ── Main Content: Activity + Projects ── */}
      <motion.div
        className="dashboard-content-grid"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Recent Activity */}
        <motion.div variants={fadeUp}>
          <ActivityCard
            title="Recent Activity"
            items={activityItems}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Recent Projects / Experiments */}
        <motion.div variants={fadeUp}>
          <ExperimentCard
            projects={stats.recentProjects}
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>

      {/* ── Quick Start (only when zero workspaces) ── */}
      {!isLoading && stats.workspaceCount === 0 && (
        <motion.div
          className="dashboard-quickstart glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="dashboard-quickstart-header">
            <h2 className="dashboard-quickstart-title">🚀 Get Started</h2>
            <p className="dashboard-quickstart-subtitle">
              Follow these steps to build your first ML model
            </p>
          </div>
          <div className="dashboard-quickstart-steps">
            {[
              { num: '1', title: 'Create a Workspace',  desc: 'Organise your ML projects in a workspace.' },
              { num: '2', title: 'Add a Project',        desc: 'Define the problem type — classification, regression, etc.' },
              { num: '3', title: 'Upload a Dataset',     desc: 'Upload CSV, Excel or JSON files.' },
              { num: '4', title: 'Train your Model',     desc: 'Pick an algorithm, tune, deploy.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="dashboard-quickstart-step">
                <div className="dashboard-quickstart-step-num">{num}</div>
                <div className="dashboard-quickstart-step-info">
                  <span className="dashboard-quickstart-step-title">{title}</span>
                  <span className="dashboard-quickstart-step-desc">{desc}</span>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/workspaces')}
          >
            Create First Workspace
          </Button>
        </motion.div>
      )}

    </div>
  );
};

export default Dashboard;
