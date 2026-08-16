/* ============================================================
   Login Page
   ============================================================ */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Cpu } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { validationRules } from '../../utils/validators';
import logo from '../../assets/logo.png';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  const onSubmit = async (data) => {
    setServerError('');
    setIsLoading(true);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password. Please try again.');
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

        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {serverError && (
            <motion.div
              className="auth-server-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {serverError}
            </motion.div>
          )}

          <Input
            label="Email address"
            type="email"
            leftIcon={<Mail size={18} strokeWidth={1.5} />}
            error={errors.email?.message}
            {...register('email', validationRules.email)}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            leftIcon={<Lock size={18} strokeWidth={1.5} />}
            rightIcon={showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
            onRightIconClick={() => setShowPassword((p) => !p)}
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />

          <div className="auth-form-row">
            <label className="auth-remember">
              <input type="checkbox" className="auth-checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-forgot">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="auth-switch-link">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
