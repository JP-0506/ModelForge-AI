/* ============================================================
   DatasetSidebar (Level 4) — Sidebar for active dataset
   ML Pipeline navigation: Overview → Validation → Profiling →
   Feature Engineering → EDA → Train Model → Compare Models →
   Deployment → Prediction → Dataset Settings
   ============================================================ */

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  CheckSquare,
  BarChart3,
  Wrench,
  TrendingUp,
  Cpu,
  Scale,
  Rocket,
  Sparkles,
  Settings,
  ArrowLeft,
  FileText,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import datasetService from '../../../services/datasetService';
import projectService from '../../../services/projectService';
import { setBreadcrumbCache } from '../../../hooks/useBreadcrumb';
import { storage } from '../../../utils/storage';
import './DatasetSidebar.css';

const DatasetSidebar = () => {
  const { workspaceId, projectId, datasetId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [dataset, setDataset]   = useState(null);
  const [project, setProject]   = useState(null);
  const [theme, setTheme]       = useState(storage.getTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    let isMounted = true;

    if (datasetId) {
      datasetService
        .getById(datasetId)
        .then((ds) => {
          if (isMounted && ds) {
            setDataset(ds);
            setBreadcrumbCache(datasetId, ds.dataset_name);
          }
        })
        .catch((err) => console.error('Failed to load dataset in sidebar:', err));
    }

    if (projectId) {
      projectService
        .getById(projectId)
        .then((proj) => {
          if (isMounted && proj) {
            setProject(proj);
            setBreadcrumbCache(projectId, proj.project_name);
          }
        })
        .catch((err) => console.error('Failed to load project in sidebar:', err));
    }

    return () => { isMounted = false; };
  }, [datasetId, projectId]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const userInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const baseUrl = `/workspaces/${workspaceId}/projects/${projectId}/datasets/${datasetId}`;

  const navItems = [
    { to: baseUrl,                            icon: Home,        label: 'Overview',             end: true  },
    { to: `${baseUrl}/validation`,            icon: CheckSquare, label: 'Validation'                      },
    { to: `${baseUrl}/profiling`,             icon: BarChart3,   label: 'Profiling'                        },
    { to: `${baseUrl}/cleaning`,              icon: Sparkles,    label: 'Cleaning'                         },
    { to: `${baseUrl}/feature-engineering`,   icon: Wrench,      label: 'Feature Engineering'              },
    { to: `${baseUrl}/eda`,                   icon: TrendingUp,  label: 'EDA'                              },
    { to: `${baseUrl}/train`,                 icon: Cpu,         label: 'Train Model'                      },
    { to: `${baseUrl}/compare`,               icon: Scale,       label: 'Compare Models'                   },
    { to: `${baseUrl}/deployment`,            icon: Rocket,      label: 'Deployment'                       },
    { to: `${baseUrl}/prediction`,            icon: Sparkles,    label: 'Prediction'                       },
    { to: `${baseUrl}/settings`,              icon: Settings,    label: 'Dataset Settings'                 },
  ];


  const datasetName = dataset?.dataset_name || 'Loading...';
  const fullDatasetName = dataset?.dataset_name || '';

  return (
    <motion.aside
      className="ds-sidebar"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* ── Back to Project ── */}
      <button
        className="ds-sidebar-back"
        onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets`)}
      >
        <ArrowLeft size={14} strokeWidth={2} />
        <span>{project ? project.project_name : 'Project'}</span>
      </button>

      {/* ── Dataset Header ── */}
      <div className="ds-sidebar-header">
        <div className="ds-sidebar-icon">
          <FileText size={17} strokeWidth={1.5} />
        </div>
        <div className="ds-sidebar-title-box">
          <span className="ds-sidebar-badge">DATASET</span>
          <h2
            className="ds-sidebar-name"
            title={fullDatasetName}
          >
            {datasetName}
          </h2>
        </div>
      </div>

      <div className="ds-sidebar-divider" />

      {/* ── Navigation ── */}
      <nav className="ds-sidebar-nav">
        <ul className="ds-sidebar-nav-list">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <li key={to} className="ds-sidebar-nav-item">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `ds-sidebar-nav-link ${isActive ? 'ds-sidebar-nav-link--active' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="ds-sidebar-active-pill"
                        className="ds-sidebar-active-bg"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="ds-sidebar-nav-icon">
                      <Icon size={17} strokeWidth={isActive ? 2 : 1.5} />
                    </span>
                    <span className="ds-sidebar-nav-label">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Bottom Section ── */}
      <div className="ds-sidebar-bottom">
        <button className="ds-sidebar-theme-toggle" onClick={toggleTheme} title="Toggle theme">
          <AnimatePresence mode="wait">
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark'
                ? <Sun size={16} strokeWidth={1.5} />
                : <Moon size={16} strokeWidth={1.5} />
              }
            </motion.span>
          </AnimatePresence>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="ds-sidebar-divider" />

        <div className="ds-sidebar-user">
          <div className="ds-sidebar-user-avatar">{userInitials}</div>
          <div className="ds-sidebar-user-info">
            <span className="ds-sidebar-user-name">{displayName}</span>
            <span className="ds-sidebar-user-email">{user?.email ?? ''}</span>
          </div>
          <button className="ds-sidebar-logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default DatasetSidebar;
