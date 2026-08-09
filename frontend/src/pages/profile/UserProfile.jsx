/* ============================================================
   UserProfile.jsx — User Profile & Account Management Module
   ============================================================ */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  FileText,
  Shield,
  Key,
  Calendar,
  Clock,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Award,
} from 'lucide-react';

import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import './UserProfile.css';


const UserProfile = () => {
  const { user, updateUser, logout } = useAuth();

  // State
  const [profileData, setProfileData] = useState(user || null);
  const [loading, setLoading] = useState(!user);
  const [profileError, setProfileError] = useState(null);

  // Edit Profile Inline State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    bio: '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Change Password Inline State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState(null);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState(null);

  // Fetch Latest Profile Data on mount
  useEffect(() => {
    let isMounted = true;
    userService
      .getProfile()
      .then((data) => {
        if (!isMounted) return;
        setProfileData(data);
        updateUser(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to fetch profile:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize edit form when profileData changes
  useEffect(() => {
    if (profileData) {
      setEditForm({
        fullName: profileData.fullName || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
      });
    }
  }, [profileData]);

  // Live Password Requirements Rule Evaluator
  const newPw = passwordForm.newPassword;
  const passwordRules = useMemo(() => {
    return [
      { id: 'min_length', label: 'Minimum 8 characters', met: newPw.length >= 8 },
      { id: 'uppercase', label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(newPw) },
    ];
  }, [newPw]);

  const allPasswordRulesMet = passwordRules.every((r) => r.met);

  // User Display Info
  const displayName = profileData?.fullName || user?.fullName || user?.email?.split('@')[0] || 'User';
  const displayEmail = profileData?.email || user?.email || 'N/A';
  const displayPhone = profileData?.phone || 'Not provided';
  const displayBio = profileData?.bio || 'No bio added yet.';
  const userId = profileData?._id || profileData?.id || user?._id || user?.id || 'N/A';

  const userInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) {
      setProfileError('Full Name is required.');
      return;
    }

    setUpdatingProfile(true);
    setProfileError(null);
    setProfileSuccessMsg('');

    try {
      const updated = await userService.updateProfile({
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        bio: editForm.bio.trim(),
      });

      setProfileData(updated);
      updateUser(updated);
      setIsEditing(false);
      setProfileSuccessMsg('Profile updated successfully.');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setProfileError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Handle Change Password Submit
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg('');

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordErrorMsg('All password fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (!allPasswordRulesMet) {
      setPasswordErrorMsg('New password does not meet all security requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('Confirm password does not match new password.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordErrorMsg('New password cannot be the same as your current password.');
      return;
    }

    setUpdatingPassword(true);

    try {
      const res = await userService.changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccessMsg(res.message || 'Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      setTimeout(() => setPasswordSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to change password:', err);
      setPasswordErrorMsg(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteErrorMsg('Please type DELETE to confirm.');
      return;
    }
    setIsDeletingAccount(true);
    setDeleteErrorMsg(null);
    try {
      await userService.deleteAccount();
      logout();
    } catch (err) {
      console.error('Failed to delete account:', err);
      setDeleteErrorMsg(err.response?.data?.message || err.message || 'Failed to delete account.');
      setIsDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="usr-prof-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <RefreshCw className="spin-icon" size={32} style={{ color: '#6366f1' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading User Profile...</p>
      </div>
    );
  }

  return (
    <div className="usr-prof-container">
      {/* ── Profile Header Card ── */}
      <motion.div
        className="usr-prof-card usr-prof-header-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="usr-prof-avatar-box">
          {profileData?.profile_image ? (
            <img src={profileData.profile_image} alt={displayName} className="usr-prof-avatar-img" />
          ) : (
            <div className="usr-prof-avatar-initials">{userInitials}</div>
          )}
        </div>

        <div className="usr-prof-header-details">
          <h1 className="usr-prof-name">{displayName}</h1>
          <p className="usr-prof-email">
            <Mail size={15} /> {displayEmail}
          </p>
          <div className="usr-prof-meta-pills">
            <span className="usr-prof-pill">
              <Clock size={13} /> Last Updated: {formatDate(profileData?.updated_at || profileData?.updatedAt)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Global Success / Error Banners */}
      <AnimatePresence>
        {profileSuccessMsg && (
          <motion.div
            className="usr-prof-banner success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CheckCircle2 size={18} /> {profileSuccessMsg}
          </motion.div>
        )}

        {passwordSuccessMsg && (
          <motion.div
            className="usr-prof-banner success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CheckCircle2 size={18} /> {passwordSuccessMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="usr-prof-grid">
        {/* ── Left Column: Personal Information ── */}
        <motion.div
          className="usr-prof-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="usr-prof-card-header">
            <h2 className="usr-prof-card-title">
              <User size={20} style={{ color: '#6366f1' }} /> Personal Information
            </h2>
            {!isEditing && (
              <button
                className="usr-prof-btn-secondary"
                onClick={() => {
                  setIsEditing(true);
                  setProfileError(null);
                }}
              >
                <Edit2 size={15} /> Edit Profile
              </button>
            )}
          </div>

          {profileError && (
            <div className="usr-prof-banner error" style={{ marginBottom: '16px' }}>
              <AlertCircle size={16} /> {profileError}
            </div>
          )}

          {!isEditing ? (
            <div className="usr-prof-info-list">
              <div className="usr-prof-info-row">
                <span className="usr-prof-info-label">Full Name</span>
                <span className="usr-prof-info-val">{displayName}</span>
              </div>

              <div className="usr-prof-info-row">
                <span className="usr-prof-info-label">Email Address</span>
                <span className="usr-prof-info-val">{displayEmail}</span>
              </div>

              <div className="usr-prof-info-row">
                <span className="usr-prof-info-label">Phone Number</span>
                <span className="usr-prof-info-val">{displayPhone}</span>
              </div>

              <div className="usr-prof-info-row">
                <span className="usr-prof-info-label">Bio</span>
                <span className="usr-prof-info-val" style={{ whiteSpace: 'pre-wrap' }}>
                  {displayBio}
                </span>
              </div>
            </div>
          ) : (
            /* Inline Edit Profile Form (NO MODAL) */
            <form onSubmit={handleSaveProfile} className="usr-prof-form">
              <div className="usr-prof-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="usr-prof-input"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  disabled={updatingProfile}
                  required
                />
              </div>

              <div className="usr-prof-form-group">
                <label>Email Address (Read-only)</label>
                <input type="email" className="usr-prof-input usr-prof-input--readonly" value={displayEmail} readOnly disabled />
              </div>

              <div className="usr-prof-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="usr-prof-input"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="e.g. +1 (555) 000-1234"
                  disabled={updatingProfile}
                />
              </div>

              <div className="usr-prof-form-group">
                <label>Bio</label>
                <textarea
                  className="usr-prof-textarea"
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us a bit about your AI & data engineering background..."
                  disabled={updatingProfile}
                />
              </div>

              <div className="usr-prof-form-actions">
                <button
                  type="button"
                  className="usr-prof-btn-cancel"
                  onClick={() => {
                    setIsEditing(false);
                    setProfileError(null);
                  }}
                  disabled={updatingProfile}
                >
                  Cancel
                </button>
                <button type="submit" className="usr-prof-btn-primary" disabled={updatingProfile}>
                  {updatingProfile ? <RefreshCw className="spin-icon" size={16} /> : <Save size={16} />}
                  <span>{updatingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* ── Right Column: Account Information & Change Password ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Account Information Card (Read-only) */}
          <motion.div
            className="usr-prof-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <div className="usr-prof-card-header">
              <h2 className="usr-prof-card-title">
                <Shield size={20} style={{ color: '#6366f1' }} /> Account Information
              </h2>
            </div>

            <div className="usr-prof-info-list">
              <div className="usr-prof-info-row">
                <span className="usr-prof-info-label">User ID</span>
                <span className="usr-prof-info-val mono">{userId}</span>
              </div>

              <div className="usr-prof-info-row">
                <span className="usr-prof-info-label">Account Created</span>
                <span className="usr-prof-info-val">{formatDate(profileData?.created_at || profileData?.createdAt)}</span>
              </div>

              <div className="usr-prof-info-row">
                <span className="usr-prof-info-label">Last Profile Update</span>
                <span className="usr-prof-info-val">{formatDate(profileData?.updated_at || profileData?.updatedAt)}</span>
              </div>
            </div>
          </motion.div>

          {/* Change Password Card (Inline Form - NO MODAL) */}
          <motion.div
            className="usr-prof-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="usr-prof-card-header">
              <h2 className="usr-prof-card-title">
                <Key size={20} style={{ color: '#6366f1' }} /> Security & Password
              </h2>
              {!isChangingPassword && (
                <button
                  className="usr-prof-btn-secondary"
                  onClick={() => {
                    setIsChangingPassword(true);
                    setPasswordErrorMsg(null);
                  }}
                >
                  <Lock size={15} /> Change Password
                </button>
              )}
            </div>

            {!isChangingPassword ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                Ensure your account uses a strong password with at least 8 characters, numbers, and special symbols.
              </p>
            ) : (
              /* Inline Change Password Form */
              <form onSubmit={handleChangePasswordSubmit} className="usr-prof-form">
                {passwordErrorMsg && (
                  <div className="usr-prof-banner error" style={{ marginBottom: '16px' }}>
                    <AlertCircle size={16} /> {passwordErrorMsg}
                  </div>
                )}

                <div className="usr-prof-form-group">
                  <label>Current Password *</label>
                  <div className="usr-prof-input-wrap">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      className="usr-prof-input"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      disabled={updatingPassword}
                      required
                    />
                    <button
                      type="button"
                      className="usr-prof-eye-btn"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      tabIndex={-1}
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="usr-prof-form-group">
                  <label>New Password *</label>
                  <div className="usr-prof-input-wrap">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      className="usr-prof-input"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password (min 8 chars)"
                      disabled={updatingPassword}
                      required
                    />
                    <button
                      type="button"
                      className="usr-prof-eye-btn"
                      onClick={() => setShowNewPw(!showNewPw)}
                      tabIndex={-1}
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Live Password Requirements Checklist */}
                {passwordForm.newPassword && (
                  <div className="usr-prof-rules-box">
                    <span className="usr-prof-rules-title">Password Requirements:</span>
                    <ul className="usr-prof-rules-list">
                      {passwordRules.map((rule) => (
                        <li key={rule.id} className={`usr-prof-rule-item ${rule.met ? 'met' : 'unmet'}`}>
                          {rule.met ? <CheckCircle2 size={13} /> : <X size={13} />}
                          <span>{rule.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="usr-prof-form-group">
                  <label>Confirm New Password *</label>
                  <div className="usr-prof-input-wrap">
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      className="usr-prof-input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      disabled={updatingPassword}
                      required
                    />
                    <button
                      type="button"
                      className="usr-prof-eye-btn"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      tabIndex={-1}
                    >
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="usr-prof-form-actions">
                  <button
                    type="button"
                    className="usr-prof-btn-cancel"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordErrorMsg(null);
                    }}
                    disabled={updatingPassword}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="usr-prof-btn-primary" disabled={updatingPassword}>
                    {updatingPassword ? <RefreshCw className="spin-icon" size={16} /> : <Lock size={16} />}
                    <span>{updatingPassword ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Danger Zone: Delete Account ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        style={{
          marginTop: '32px',
          borderRadius: '18px',
          border: '1px solid rgba(239,68,68,0.22)',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(239,68,68,0.08), 0 1px 0 rgba(255,255,255,0.05) inset',
        }}
      >
        {/* Header stripe */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)',
          borderBottom: '1px solid rgba(239,68,68,0.12)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#f87171', flexShrink: 0,
          }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f87171', letterSpacing: '-0.01em' }}>
              Danger Zone
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(248,113,113,0.6)', marginTop: '2px' }}>
              Irreversible and destructive actions
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px 24px' }}>
          {/* Delete account row */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: '24px', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#f1f5f9', marginBottom: '6px' }}>
                Delete Account
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
                Once deleted, your account, profile data, and access credentials will be permanently removed.
                This action <strong style={{ color: '#fca5a5' }}>cannot be undone</strong>.
              </p>
            </div>

            {!showDeleteConfirm && (
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(true); setDeleteErrorMsg(null); setDeleteConfirmText(''); }}
                style={{
                  flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '9px 18px', borderRadius: '9px', whiteSpace: 'nowrap',
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
                  color: '#f87171', fontWeight: 600, fontSize: '13px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.22)';
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.color = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                  e.currentTarget.style.color = '#f87171';
                }}
              >
                <X size={14} />
                Delete Account
              </button>
            )}
          </div>

          {/* Confirmation panel */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '20px' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '12px', padding: '18px 20px',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    marginBottom: '16px',
                    padding: '10px 14px',
                    background: 'rgba(239,68,68,0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}>
                    <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0 }} />
                    <p style={{ margin: 0, color: '#fca5a5', fontSize: '13px', fontWeight: 500 }}>
                      To confirm, type <strong style={{ color: '#fff', fontFamily: 'monospace', background: 'rgba(239,68,68,0.2)', padding: '1px 6px', borderRadius: '4px' }}>DELETE</strong> in the box below.
                    </p>
                  </div>

                  {deleteErrorMsg && (
                    <p style={{
                      margin: '0 0 14px', color: '#f87171', fontSize: '13px',
                      fontWeight: 500, padding: '8px 12px',
                      background: 'rgba(239,68,68,0.1)', borderRadius: '6px',
                      border: '1px solid rgba(239,68,68,0.2)',
                    }}>
                      {deleteErrorMsg}
                    </p>
                  )}

                  <input
                    type="text"
                    className="usr-prof-input"
                    placeholder="Type DELETE to confirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    disabled={isDeletingAccount}
                    style={{
                      marginBottom: '16px',
                      borderColor: deleteConfirmText === 'DELETE' ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.25)',
                      background: 'rgba(239,68,68,0.05)',
                      fontFamily: 'monospace',
                      letterSpacing: deleteConfirmText ? '0.08em' : 'normal',
                    }}
                  />

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="usr-prof-btn-cancel"
                      onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteErrorMsg(null); }}
                      disabled={isDeletingAccount}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
                      onClick={handleDeleteAccount}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                        padding: '10px 20px', borderRadius: '9px',
                        background: deleteConfirmText === 'DELETE'
                          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                          : 'rgba(239,68,68,0.2)',
                        border: `1px solid ${deleteConfirmText === 'DELETE' ? '#dc2626' : 'rgba(239,68,68,0.2)'}`,
                        color: deleteConfirmText === 'DELETE' ? '#fff' : 'rgba(248,113,113,0.4)',
                        fontWeight: 600, fontSize: '13px',
                        cursor: deleteConfirmText === 'DELETE' && !isDeletingAccount ? 'pointer' : 'not-allowed',
                        opacity: isDeletingAccount ? 0.7 : 1,
                        transition: 'all 0.2s',
                        boxShadow: deleteConfirmText === 'DELETE' ? '0 4px 12px rgba(220,38,38,0.35)' : 'none',
                      }}
                    >
                      {isDeletingAccount
                        ? <RefreshCw className="spin-icon" size={14} />
                        : <X size={14} />
                      }
                      <span>{isDeletingAccount ? 'Deleting Account...' : 'Permanently Delete'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>


    </div>

  );
};

export default UserProfile;
