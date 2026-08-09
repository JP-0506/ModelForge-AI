/* ============================================================
   ProjectLayout — Layout wrapping project routes with ProjectSidebar
   ============================================================ */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectSidebar from '../components/layout/Sidebar/ProjectSidebar';
import Navbar from '../components/layout/Navbar/Navbar';
import './DashboardLayout.css';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const ProjectLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu  = () => setIsMobileMenuOpen(false);

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="dashboard-mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Project-scoped Sidebar */}
      <ProjectSidebar />

      {/* Main content area */}
      <div className="dashboard-main">
        <Navbar
          onMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <motion.main
          className="dashboard-content"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default ProjectLayout;
