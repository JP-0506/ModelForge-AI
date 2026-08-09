/* ============================================================
   StatCard — numeric KPI card with icon, trend, and label
   ============================================================ */

import { motion } from 'framer-motion';
import './StatCard.css';

const StatCard = ({
  icon: Icon,
  label,
  value,
  subLabel,
  color = 'primary',   // primary | accent | success | warning | error
  trend,               // e.g. '+2 this week'
  isLoading = false,
  delay = 0,
  onClick,
}) => {
  return (
    <motion.div
      className={`stat-card glass hover-lift ${onClick ? 'stat-card--clickable' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={`stat-card-icon stat-card-icon--${color}`}>
        {isLoading
          ? <div className="stat-card-icon-skeleton" />
          : <Icon size={20} strokeWidth={1.5} />
        }
      </div>

      {/* Content */}
      <div className="stat-card-body">
        {isLoading ? (
          <div className="stat-card-skeleton">
            <div className="stat-card-skeleton-value" />
            <div className="stat-card-skeleton-label" />
          </div>
        ) : (
          <>
            <div className="stat-card-value">
              <span className={`stat-card-number ${typeof value === 'string' && value.length > 6 ? 'stat-card-number--long' : ''}`}>
                {value ?? 0}
              </span>
              {subLabel && <span className="stat-card-sub">{subLabel}</span>}
            </div>
            <div className="stat-card-footer">
              <span className="stat-card-label">{label}</span>
              {trend && <span className="stat-card-trend">{trend}</span>}
            </div>
          </>
        )}
      </div>

      {/* Subtle gradient accent line */}
      <div className={`stat-card-accent stat-card-accent--${color}`} />
    </motion.div>
  );
};

export default StatCard;
