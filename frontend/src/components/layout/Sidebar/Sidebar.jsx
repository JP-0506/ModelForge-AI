/* ============================================================
   Main App Sidebar (Level 1) — Dashboard, Workspaces, Profile, Logout
   ============================================================ */

import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Folders,
  User,
  LogOut,
  Cpu,
  Sun,
  Moon,
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import { storage } from '../../../utils/storage';
import { useState, useEffect } from 'react';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/workspaces',  icon: Folders,          label: 'Workspaces' },
  { to: '/profile',     icon: User,             label: 'Profile' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(storage.getTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Graceful fallback — fullName may be undefined for older accounts
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const userInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Cpu size={20} strokeWidth={1.5} />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">ModelForge</span>
          <span className="sidebar-logo-tag">AI Platform</span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        <ul className="sidebar-nav-list">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to} className="sidebar-nav-item">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? 'sidebar-nav-link--active' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="sidebar-active-bg"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="sidebar-nav-icon">
                      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                    </span>
                    <span className="sidebar-nav-label">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Bottom Section ── */}
      <div className="sidebar-bottom">
        {/* Theme toggle */}
        <button className="sidebar-theme-toggle" onClick={toggleTheme} title="Toggle theme">
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

        {/* Divider */}
        <div className="sidebar-divider" />

        {/* User + Logout */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{userInitials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">
              {displayName}
            </span>
            <span className="sidebar-user-email">{user?.email ?? ''}</span>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
