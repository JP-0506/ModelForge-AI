/* ============================================================
   Workspace Sidebar (Level 2) — Context-aware sidebar for active workspace
   Options:
   - Overview
   - Projects
   - Analytics
   - Workspace Settings
   ============================================================ */

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  FolderOpen,
  Settings,
  ArrowLeft,
  Folders,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import workspaceService from '../../../services/workspaceService';
import { storage } from '../../../utils/storage';
import './WorkspaceSidebar.css';

const WorkspaceSidebar = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [theme, setTheme] = useState(storage.getTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    let isMounted = true;
    if (workspaceId) {
      workspaceService
        .getById(workspaceId)
        .then((ws) => {
          if (isMounted) setWorkspace(ws);
        })
        .catch((err) => {
          console.error('Failed to load workspace in sidebar:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [workspaceId]);

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

  const navItems = [
    { to: `/workspaces/${workspaceId}`, icon: Home, label: 'Overview', end: true },
    { to: `/workspaces/${workspaceId}/projects`, icon: FolderOpen, label: 'Projects' },
    { to: `/workspaces/${workspaceId}/settings`, icon: Settings, label: 'Workspace Settings' },
  ];

  return (
    <motion.aside
      className="ws-sidebar"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* ── Back to Workspaces Header ── */}
      <button className="ws-sidebar-back" onClick={() => navigate('/workspaces')}>
        <ArrowLeft size={14} strokeWidth={2} />
        <span>All Workspaces</span>
      </button>

      {/* ── Workspace Branding Card ── */}
      <div className="ws-sidebar-header">
        <div className="ws-sidebar-icon">
          <Folders size={18} strokeWidth={1.5} />
        </div>
        <div className="ws-sidebar-title-box">
          <span className="ws-sidebar-badge">Workspace</span>
          <h2 className="ws-sidebar-name">
            {workspace ? workspace.workspace_name : 'Loading...'}
          </h2>
        </div>
      </div>

      <div className="ws-sidebar-divider" />

      {/* ── Navigation Items ── */}
      <nav className="ws-sidebar-nav">
        <ul className="ws-sidebar-nav-list">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <li key={to} className="ws-sidebar-nav-item">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `ws-sidebar-nav-link ${isActive ? 'ws-sidebar-nav-link--active' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="ws-sidebar-active-pill"
                        className="ws-sidebar-active-bg"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="ws-sidebar-nav-icon">
                      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                    </span>
                    <span className="ws-sidebar-nav-label">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Bottom Section ── */}
      <div className="ws-sidebar-bottom">
        {/* Theme Toggle */}
        <button className="ws-sidebar-theme-toggle" onClick={toggleTheme} title="Toggle theme">
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

        <div className="ws-sidebar-divider" />

        {/* User profile */}
        <div className="ws-sidebar-user">
          <div className="ws-sidebar-user-avatar">{userInitials}</div>
          <div className="ws-sidebar-user-info">
            <span className="ws-sidebar-user-name">{displayName}</span>
            <span className="ws-sidebar-user-email">{user?.email ?? ''}</span>
          </div>
          <button className="ws-sidebar-logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default WorkspaceSidebar;
