/* ============================================================
   ActivityCard — recent workspace/project activity row
   ============================================================ */

import { motion } from 'framer-motion';
import { Folders, FolderOpen, Database, Clock } from 'lucide-react';
import './ActivityCard.css';

const TYPE_CONFIG = {
  workspace: { icon: Folders,    color: 'primary', label: 'Workspace' },
  project:   { icon: FolderOpen, color: 'accent',  label: 'Project' },
  dataset:   { icon: Database,   color: 'success', label: 'Dataset' },
};

// Formats a MongoDB created_at date to relative time
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'Just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const ActivityCard = ({ items = [], isLoading = false, title = 'Recent Activity' }) => {
  const skeletons = Array.from({ length: 5 });

  return (
    <div className="activity-card glass">
      <div className="activity-card-header">
        <h2 className="activity-card-title">{title}</h2>
        {!isLoading && (
          <span className="activity-card-count">{items.length} items</span>
        )}
      </div>

      <div className="activity-card-list">
        {isLoading
          ? skeletons.map((_, i) => (
              <div key={i} className="activity-item activity-item--skeleton">
                <div className="activity-item-icon-sk" />
                <div className="activity-item-body-sk">
                  <div className="activity-item-name-sk" />
                  <div className="activity-item-meta-sk" />
                </div>
              </div>
            ))
          : items.length === 0
            ? (
              <div className="activity-empty">
                <Clock size={28} strokeWidth={1} />
                <p>No recent activity yet</p>
              </div>
            )
            : items.map((item, i) => {
                const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.workspace;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={item._id || i}
                    className="activity-item"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
                    <div className={`activity-item-icon activity-item-icon--${cfg.color}`}>
                      <Icon size={15} strokeWidth={1.5} />
                    </div>
                    <div className="activity-item-body">
                      <span className="activity-item-name">{item.name}</span>
                      <div className="activity-item-meta">
                        <span className="activity-item-type">{cfg.label}</span>
                        {item.sub && (
                          <span className="activity-item-sub">· {item.sub}</span>
                        )}
                      </div>
                    </div>
                    <span className="activity-item-time">{timeAgo(item.created_at)}</span>
                  </motion.div>
                );
              })
        }
      </div>
    </div>
  );
};

export default ActivityCard;
