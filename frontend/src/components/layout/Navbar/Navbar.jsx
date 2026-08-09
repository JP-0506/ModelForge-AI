/* ============================================================
   Navbar Component — Single-row floating glass bar
   Left: Breadcrumbs (clickable & resolved)
   Right: Notifications + User Avatar
   ============================================================ */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import useBreadcrumb from '../../../hooks/useBreadcrumb';
import './Navbar.css';

const Navbar = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user } = useAuth();
  const crumbs = useBreadcrumb();

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const userInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.header
      className="navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* ── Left: Mobile Menu + Clickable Breadcrumbs ── */}
      <div className="navbar-left">
        <button
          className="navbar-menu-btn hidden-desktop"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {crumbs.length > 0 && (
          <nav className="navbar-breadcrumb" aria-label="Breadcrumb">
            {crumbs.map((crumb, i) => (
              <span key={crumb.path} className="navbar-breadcrumb-item">
                {i > 0 && <ChevronRight size={14} className="navbar-breadcrumb-sep" />}
                {crumb.isLink ? (
                  <Link to={crumb.path} className="navbar-breadcrumb-link">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="navbar-breadcrumb-current">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* ── Right: User Avatar ── */}
      <div className="navbar-right">
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <div className="navbar-avatar" title={`Profile: ${displayName}`}>
            {userInitials}
          </div>
        </Link>
      </div>
    </motion.header>
  );
};

export default Navbar;
