/* ============================================================
   ConfirmDialog — delete/danger confirmation dialog
   ============================================================ */
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../Button/Button';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isLoading = false,
  variant = 'danger',   // danger | warning
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="confirm-wrapper">
          <motion.div
            className="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="confirm-panel glass"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
            role="alertdialog"
            aria-modal="true"
          >
            {/* Close */}
            <button className="confirm-close" onClick={onClose}>
              <X size={16} strokeWidth={2} />
            </button>

            {/* Icon */}
            <div className={`confirm-icon confirm-icon--${variant}`}>
              <AlertTriangle size={22} strokeWidth={1.5} />
            </div>

            {/* Text */}
            <h2 className="confirm-title">{title}</h2>
            {message && <p className="confirm-message">{message}</p>}

            {/* Actions */}
            <div className="confirm-actions">
              <Button variant="ghost" size="md" onClick={onClose} disabled={isLoading}>
                {cancelLabel}
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'warning'}
                size="md"
                onClick={onConfirm}
                isLoading={isLoading}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
