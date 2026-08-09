/* ============================================================
   ProjectSidebar (Level 3) — Sidebar for active project
   Options:
   - Overview
   - Datasets
   - Analytics
   - Project Settings
   ============================================================ */

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Database,
  Settings,
  ArrowLeft,
  FolderOpen,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import projectService from '../../../services/projectService';
import workspaceService from '../../../services/workspaceService';
import { setBreadcrumbCache } from '../../../hooks/useBreadcrumb';
import { storage } from '../../../utils/storage';
import './ProjectSidebar.css';

const ProjectSidebar = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [project, setProject]     = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [theme, setTheme]         = useState(storage.getTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    let isMounted = true;

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

    if (workspaceId) {
      workspaceService
        .getById(workspaceId)
        .then((ws) => {
          if (isMounted && ws) {
            setWorkspace(ws);
            setBreadcrumbCache(workspaceId, ws.workspace_name);
          }
        })
        .catch((err) => console.error('Failed to load workspace in sidebar:', err));
    }

    return () => {
      isMounted = false;
    };
  }, [workspaceId, projectId]);

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

  const baseUrl = `/workspaces/${workspaceId}/projects/${projectId}`;

  const navItems = [
    { to: baseUrl, icon: Home, label: 'Overview', end: true },
    { to: `${baseUrl}/datasets`, icon: Database, label: 'Datasets' },
    { to: `${baseUrl}/settings`, icon: Settings, label: 'Project Settings' },
  ];

  return (
    <motion.aside
      className="proj-sidebar"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* ── Back to Workspace Header ── */}
      <button className="proj-sidebar-back" onClick={() => navigate(`/workspaces/${workspaceId}`)}>
        <ArrowLeft size={14} strokeWidth={2} />
        <span>{workspace ? workspace.workspace_name : 'Workspace'}</span>
      </button>

      {/* ── Project Branding Card ── */}
      <div className="proj-sidebar-header">
        <div className="proj-sidebar-icon">
          <FolderOpen size={18} strokeWidth={1.5} />
        </div>
        <div className="proj-sidebar-title-box">
          <span className="proj-sidebar-badge">Project</span>
          <h2 className="proj-sidebar-name">
            {project ? project.project_name : 'Loading...'}
          </h2>
        </div>
      </div>

      <div className="proj-sidebar-divider" />

      {/* ── Navigation Items ── */}
      <nav className="proj-sidebar-nav">
        <ul className="proj-sidebar-nav-list">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <li key={to} className="proj-sidebar-nav-item">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `proj-sidebar-nav-link ${isActive ? 'proj-sidebar-nav-link--active' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="proj-sidebar-active-pill"
                        className="proj-sidebar-active-bg"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="proj-sidebar-nav-icon">
                      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                    </span>
                    <span className="proj-sidebar-nav-label">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Bottom Section ── */}
      <div className="proj-sidebar-bottom">
        {/* Theme Toggle */}
        <button className="proj-sidebar-theme-toggle" onClick={toggleTheme} title="Toggle theme">
          <AnimatePresence mode="wait">
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </motion.span>
          </AnimatePresence>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="proj-sidebar-divider" />

        {/* User profile */}
        <div className="proj-sidebar-user">
          <div className="proj-sidebar-user-avatar">{userInitials}</div>
          <div className="proj-sidebar-user-info">
            <span className="proj-sidebar-user-name">{displayName}</span>
            <span className="proj-sidebar-user-email">{user?.email ?? ''}</span>
          </div>
          <button className="proj-sidebar-logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default ProjectSidebar;
