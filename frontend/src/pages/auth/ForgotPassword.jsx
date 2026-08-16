/* ============================================================
   ForgotPassword Page — Step-by-Step OTP Reset Flow
   ============================================================ */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft, Cpu } from 'lucide-react';
import authService from '../../services/authService';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import logo from '../../assets/logo.png';
import './Auth.css';
const ForgotPassword = () => {
    const navigate = useNavigate();
    // Step state: 1 = Email, 2 = OTP, 3 = New Password, 4 = Success
    const [step, setStep] = useState(1);
    // Form Fields
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        if (!email || !email.includes('@')) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await authService.forgotPassword(email.trim());
            setSuccessMsg(res.message || 'OTP sent successfully to your email.');
            setStep(2);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || err.message || 'Failed to send OTP. Please check your email.');
        } finally {
            setIsLoading(false);
        }
    };
    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        if (!otp || otp.trim().length !== 6) {
            setErrorMsg('Please enter a valid 6-digit OTP code.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await authService.verifyOTP(email.trim(), otp.trim());
            setSuccessMsg(res.message || 'OTP verified successfully.');
            setStep(3);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || err.message || 'Invalid or expired OTP code.');
        } finally {
            setIsLoading(false);
        }
    };
    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        if (!newPassword || newPassword.length < 8) {
            setErrorMsg('Password must be at least 8 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg('Passwords do not match. Please try again.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await authService.resetPassword(email.trim(), otp.trim(), newPassword);
            setSuccessMsg(res.message || 'Password reset successfully.');
            setStep(4);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || err.message || 'Password reset failed.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="auth-page">
            {/* Background */}
            <div className="auth-bg">
                <div className="auth-bg-orb auth-bg-orb--1" />
                <div className="auth-bg-orb auth-bg-orb--2" />
                <div className="auth-bg-grid" />
            </div>
            {/* Card */}
            <motion.div
                className="auth-card glass"
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <img src={logo} alt="ModelForge AI Logo" className="auth-logo-img" />
                    </div>
                    <div className="auth-logo-text">
                        <span className="auth-logo-name">ModelForge AI</span>
                        <span className="auth-logo-tag">No-Code ML Platform</span>
                    </div>
                </div>
                {/* ── STEP 1: Enter Email ── */}
                {step === 1 && (
                    <>
                        <div className="auth-header">
                            <h1 className="auth-title">Forgot Password?</h1>
                            <p className="auth-subtitle">Enter your registered email to receive a 6-digit verification OTP.</p>
                        </div>
                        <form className="auth-form" onSubmit={handleRequestOTP} noValidate>
                            {errorMsg && (
                                <motion.div className="auth-server-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                                    {errorMsg}
                                </motion.div>
                            )}
                            <Input
                                label="Email address"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                leftIcon={<Mail size={18} strokeWidth={1.5} />}
                                required
                            />
                            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                                Send OTP
                            </Button>
                        </form>
                    </>
                )}
                {/* ── STEP 2: Enter OTP ── */}
                {step === 2 && (
                    <>
                        <div className="auth-header">
                            <h1 className="auth-title">Enter Security OTP</h1>
                            <p className="auth-subtitle">
                                We sent a 6-digit OTP code to <strong>{email}</strong>.
                            </p>
                        </div>
                        <form className="auth-form" onSubmit={handleVerifyOTP} noValidate>
                            {errorMsg && (
                                <motion.div className="auth-server-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                                    {errorMsg}
                                </motion.div>
                            )}
                            {successMsg && (
                                <div style={{ padding: '10px 14px', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', color: '#22c55e', fontSize: '13px', fontWeight: 500 }}>
                                    {successMsg}
                                </div>
                            )}
                            <Input
                                label="6-Digit OTP Code"
                                type="text"
                                placeholder="123456"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                leftIcon={<KeyRound size={18} strokeWidth={1.5} />}
                                required
                            />
                            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                                Verify OTP
                            </Button>
                            <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    onClick={handleRequestOTP}
                                    disabled={isLoading}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Didn't receive email? Resend OTP
                                </button>
                            </div>
                        </form>
                    </>
                )}
                {/* ── STEP 3: Set New Password ── */}
                {step === 3 && (
                    <>
                        <div className="auth-header">
                            <h1 className="auth-title">Set New Password</h1>
                            <p className="auth-subtitle">Please create a strong new password for your account.</p>
                        </div>
                        <form className="auth-form" onSubmit={handleResetPassword} noValidate>
                            {errorMsg && (
                                <motion.div className="auth-server-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                                    {errorMsg}
                                </motion.div>
                            )}
                            <Input
                                label="New Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="At least 8 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                leftIcon={<Lock size={18} strokeWidth={1.5} />}
                                rightIcon={showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                                onRightIconClick={() => setShowPassword((p) => !p)}
                                required
                            />
                            <Input
                                label="Confirm New Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                leftIcon={<Lock size={18} strokeWidth={1.5} />}
                                rightIcon={showConfirmPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                                onRightIconClick={() => setShowConfirmPassword((p) => !p)}
                                required
                            />
                            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                                Reset Password
                            </Button>
                        </form>
                    </>
                )}
                {/* ── STEP 4: Success ── */}
                {step === 4 && (
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '12px 0' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                            <CheckCircle2 size={36} />
                        </div>
                        <h1 className="auth-title" style={{ margin: 0 }}>Password Reset Complete</h1>
                        <p className="auth-subtitle" style={{ margin: 0 }}>
                            Your password has been successfully updated. You can now log in with your new credentials.
                        </p>
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={() => navigate('/login')}
                        >
                            Proceed to Sign In
                        </Button>
                    </div>
                )}
                {/* Footer Back Link */}
                {step !== 4 && (
                    <p className="auth-switch">
                        <Link to="/login" className="auth-switch-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <ArrowLeft size={16} /> Back to Sign In
                        </Link>
                    </p>
                )}
            </motion.div>
        </div>
    );
};
export default ForgotPassword;