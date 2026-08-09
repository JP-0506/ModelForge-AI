/* ============================================================
  Register Page — fields aligned with Node.js backend
  fullName, email, phone, password, confirmPassword, bio (optional)
  ============================================================ */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, FileText, Cpu } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { validationRules } from '../../utils/validators';
import './Auth.css';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  const onSubmit = async (data) => {
    setServerError('');
    setIsLoading(true);
    try {
      await registerUser(data);
      navigate('/login', {
        state: { message: 'Account created successfully! Please sign in.' },
      });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
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
            <Cpu size={24} strokeWidth={1.5} />
          </div>
          <div className="auth-logo-text">
            <span className="auth-logo-name">ModelForge AI</span>
            <span className="auth-logo-tag">No-Code ML Platform</span>
          </div>
        </div>

        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start building AI models for free — no credit card required</p>
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

          {/* Full Name */}
          <Input
            label="Full name"
            type="text"
            leftIcon={<User size={18} strokeWidth={1.5} />}
            error={errors.fullName?.message}
            {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />

          {/* Email */}
          <Input
            label="Email address"
            type="email"
            leftIcon={<Mail size={18} strokeWidth={1.5} />}
            error={errors.email?.message}
            {...register('email', validationRules.email)}
          />

          {/* Phone */}
          <Input
            label="Phone number"
            type="tel"
            leftIcon={<Phone size={18} strokeWidth={1.5} />}
            hint="e.g. +91 98765 43210"
            error={errors.phone?.message}
            {...register('phone', {
              required: 'Phone number is required',
              minLength: { value: 7, message: 'Enter a valid phone number' },
            })}
          />

          {/* Password */}
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            leftIcon={<Lock size={18} strokeWidth={1.5} />}
            rightIcon={showPassword
              ? <EyeOff size={18} strokeWidth={1.5} />
              : <Eye size={18} strokeWidth={1.5} />}
            onRightIconClick={() => setShowPassword((p) => !p)}
            hint="Min. 8 characters"
            error={errors.password?.message}
            {...register('password', validationRules.password)}
          />

          {/* Confirm Password */}
          <Input
            label="Confirm password"
            type={showConfirm ? 'text' : 'password'}
            leftIcon={<Lock size={18} strokeWidth={1.5} />}
            rightIcon={showConfirm
              ? <EyeOff size={18} strokeWidth={1.5} />
              : <Eye size={18} strokeWidth={1.5} />}
            onRightIconClick={() => setShowConfirm((p) => !p)}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', validationRules.confirmPassword(getValues))}
          />

          {/* Bio (optional) */}
          <Input
            label="Bio (optional)"
            type="text"
            leftIcon={<FileText size={18} strokeWidth={1.5} />}
            hint="Tell us a bit about yourself"
            {...register('bio')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-switch-link">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
