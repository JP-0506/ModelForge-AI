/* ============================================================
   404 Not Found Page
   ============================================================ */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Cpu } from 'lucide-react';
import Button from '../../components/common/Button/Button';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-page">
      <div className="notfound-bg">
        <div className="notfound-orb" />
      </div>

      <motion.div
        className="notfound-content"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="notfound-icon">
          <Cpu size={32} strokeWidth={1} />
        </div>
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page not found</h1>
        <p className="notfound-desc">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" size="lg" leftIcon={<Home size={18} />}>
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
