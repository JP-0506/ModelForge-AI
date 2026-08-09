/* ============================================================
   Landing Page
   ============================================================ */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cpu, ArrowRight, Zap, Shield, BarChart3,
  Brain, Database, Layers,
  Check, Star,
} from 'lucide-react';
import Button from '../../components/common/Button/Button';
import './Landing.css';

// ── Animation variants ──
const fadeUp  = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const features = [
  {
    icon: Database,
    title: 'Smart Data Processing',
    desc: 'Upload, validate, profile, and clean your datasets with automated AI-powered insights.',
    color: 'primary',
  },
  {
    icon: Brain,
    title: 'No-Code ML Training',
    desc: 'Train production-grade models without writing a single line of code.',
    color: 'accent',
  },
  {
    icon: BarChart3,
    title: 'Deep EDA & Analytics',
    desc: 'Automatically generate correlation heatmaps, distributions, and outlier analysis.',
    color: 'success',
  },
  {
    icon: Zap,
    title: 'One-Click Deployment',
    desc: 'Deploy trained models as REST APIs instantly and start making predictions.',
    color: 'warning',
  },
  {
    icon: Layers,
    title: 'Experiment Tracking',
    desc: 'Compare models across experiments with leaderboards and visual metrics.',
    color: 'primary',
  },
  {
    icon: Shield,
    title: 'Enterprise Ready',
    desc: 'Role-based access, audit logs, and workspace isolation built in from day one.',
    color: 'accent',
  },
];

const workflow = [
  { step: '01', title: 'Upload Dataset',     desc: 'Drag & drop CSV, Excel, or JSON files.' },
  { step: '02', title: 'Validate & Profile', desc: 'Automatic quality checks and statistical summaries.' },
  { step: '03', title: 'Clean & Engineer',   desc: 'Fix missing values, encode features, transform data.' },
  { step: '04', title: 'Train Model',        desc: 'Choose algorithm, tune parameters, start training.' },
  { step: '05', title: 'Compare & Deploy',   desc: 'Pick the best model and deploy with one click.' },
];

const LandingPage = () => {
  return (
    <div className="landing">
      {/* ── Nav ── */}
      <motion.header
        className="landing-nav"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="landing-nav-inner">
          <div className="landing-nav-logo">
            <div className="landing-nav-logo-icon">
              <Cpu size={18} strokeWidth={1.5} />
            </div>
            <span className="landing-nav-logo-text">ModelForge AI</span>
          </div>
          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#about">About</a>
          </nav>
          <div className="landing-nav-actions">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-bg" aria-hidden="true">
          <div className="landing-hero-orb landing-hero-orb--1" />
          <div className="landing-hero-orb landing-hero-orb--2" />
          <div className="landing-hero-orb landing-hero-orb--3" />
          <div className="landing-hero-grid" />
        </div>

        <motion.div
          className="landing-hero-content"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div className="landing-hero-badge" variants={fadeUp}>
            <Star size={12} />
            <span>No-Code ML Platform</span>
          </motion.div>

          <motion.h1 className="landing-hero-title" variants={fadeUp}>
            Build AI Models
            <span className="landing-hero-gradient"> Without Code.</span>
          </motion.h1>

          <motion.p className="landing-hero-subtitle" variants={fadeUp}>
            ModelForge AI lets you upload data, run automated EDA, train machine learning models,
            and deploy APIs — all through an elegant, intelligent interface.
          </motion.p>

          <motion.div className="landing-hero-actions" variants={fadeUp}>
            <Link to="/register">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                Start Building Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg">
                Sign In
              </Button>
            </Link>
          </motion.div>

          <motion.div className="landing-hero-stats" variants={fadeUp}>
            {[
              { value: '10+', label: 'ML Algorithms' },
              { value: '5min', label: 'To First Model' },
              { value: '100%', label: 'No-Code' },
            ].map(({ value, label }) => (
              <div key={label} className="landing-stat">
                <span className="landing-stat-value">{value}</span>
                <span className="landing-stat-label">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero Card Preview */}
        <motion.div
          className="landing-hero-preview"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="landing-preview-card glass">
            <div className="landing-preview-header">
              <div className="landing-preview-dots">
                <span /><span /><span />
              </div>
              <span className="landing-preview-title">Training Progress</span>
            </div>
            <div className="landing-preview-body">
              <div className="landing-preview-metric">
                <span className="landing-preview-metric-label">Accuracy</span>
                <span className="landing-preview-metric-value text-gradient-primary">94.7%</span>
              </div>
              <div className="landing-preview-bar-wrapper">
                <div className="landing-preview-bar">
                  <motion.div
                    className="landing-preview-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: '94.7%' }}
                    transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div className="landing-preview-metrics-grid">
                {[
                  { label: 'F1 Score',  val: '0.943' },
                  { label: 'Precision', val: '0.961' },
                  { label: 'Recall',    val: '0.926' },
                  { label: 'AUC-ROC',   val: '0.987' },
                ].map(({ label, val }) => (
                  <div key={label} className="landing-preview-mini-metric">
                    <span className="landing-preview-mini-label">{label}</span>
                    <span className="landing-preview-mini-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="landing-section">
        <motion.div
          className="landing-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-overline">Platform Features</p>
          <h2 className="landing-section-title">
            Everything you need to build ML pipelines
          </h2>
          <p className="landing-section-subtitle">
            From raw data to deployed API — ModelForge handles the entire machine learning workflow.
          </p>
        </motion.div>

        <motion.div
          className="landing-features-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map(({ icon: Icon, title, desc, color }) => (
            <motion.div
              key={title}
              className="landing-feature-card glass hover-lift"
              variants={fadeUp}
            >
              <div className={`landing-feature-icon landing-feature-icon--${color}`}>
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <h3 className="landing-feature-title">{title}</h3>
              <p className="landing-feature-desc">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Workflow ── */}
      <section id="workflow" className="landing-section landing-section--alt">
        <motion.div
          className="landing-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-overline">How It Works</p>
          <h2 className="landing-section-title">From Data to Deployment in 5 Steps</h2>
        </motion.div>

        <div className="landing-workflow">
          {workflow.map(({ step, title, desc }, i) => (
            <motion.div
              key={step}
              className="landing-workflow-step"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className="landing-workflow-step-num">{step}</div>
              <div className="landing-workflow-step-line" />
              <div className="landing-workflow-step-content glass">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="about" className="landing-cta">
        <motion.div
          className="landing-cta-card glass"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="landing-cta-orb" aria-hidden="true" />
          <p className="text-overline">Get Started Today</p>
          <h2 className="landing-cta-title">
            Ready to build your first model?
          </h2>
          <p className="landing-cta-subtitle">
            Join thousands of data scientists and developers building smarter with ModelForge AI.
          </p>
          <div className="landing-cta-checks">
            {['Free to get started', 'No credit card required', 'No code needed'].map((item) => (
              <div key={item} className="landing-cta-check">
                <Check size={14} />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <Link to="/register">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
              Create Free Account
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-logo">
            <Cpu size={16} strokeWidth={1.5} />
            <span>ModelForge AI</span>
          </div>
          <p className="landing-footer-copy">
            © {new Date().getFullYear()} ModelForge AI. Built with intelligence.
          </p>
          <div className="landing-footer-links">
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
