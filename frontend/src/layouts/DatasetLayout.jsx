/* ============================================================
   DatasetLayout — Layout wrapping dataset sub-routes with DatasetSidebar
   ============================================================ */

import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import DatasetSidebar from '../components/layout/Sidebar/DatasetSidebar';
import Navbar from '../components/layout/Navbar/Navbar';
import './DashboardLayout.css';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const DatasetLayout = () => {
  return (
    <div className="dashboard-layout">
      {/* Dataset-scoped Sidebar */}
      <DatasetSidebar />

      {/* Main content area */}
      <div className="dashboard-main">
        <Navbar />

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

export default DatasetLayout;
