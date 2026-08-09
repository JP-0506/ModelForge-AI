/* ============================================================
   DatasetProfiling — Complete Phase 7 Dataset Profiling Page
   ============================================================ */

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Play,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Database,
  Layers,
  Copy,
  AlertTriangle,
  Activity,
  Table,
  Check,
} from 'lucide-react';
import datasetService from '../../services/datasetService';
import Button from '../../components/common/Button/Button';
import './DatasetProfiling.css';

// SVG Donut Chart Component
const DonutChart = ({ percentage = 0 }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="ds-prof-donut-wrap">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="16"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="transparent"
          stroke={percentage > 20 ? '#ef4444' : percentage > 5 ? '#f59e0b' : '#6366f1'}
          strokeWidth="16"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="ds-prof-donut-center">
        <span className="ds-prof-donut-pct">{percentage}%</span>
        <span className="ds-prof-donut-sub">Missing</span>
      </div>
    </div>
  );
};



const DatasetProfiling = () => {
  const { datasetId } = useParams();

  const [dataset, setDataset] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [status, setStatus] = useState('not_generated'); // 'not_generated' | 'generating' | 'completed' | 'failed'
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Load Dataset & Existing Profile
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    Promise.all([
      datasetService.getById(datasetId),
      datasetService.getProfile(datasetId).catch(() => null),
    ])
      .then(([ds, profRes]) => {
        if (!isMounted) return;
        setDataset(ds);

        if (profRes && profRes.status === 'completed' && profRes.profile) {
          setProfileData(profRes.profile);
          setStatus('completed');
        } else {
          setStatus('not_generated');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load profiling page data:', err);
        setError(err.message || 'Failed to load dataset details');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [datasetId]);

  // Generate Profile Handler
  const handleGenerateProfile = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setStatus('generating');
    setError('');

    try {
      const res = await datasetService.generateProfile(datasetId, dataset?.current_version || 1);
      if (res && res.profile) {
        setProfileData(res.profile);
        setStatus('completed');
      } else {
        throw new Error('Profiling output was empty');
      }
    } catch (err) {
      console.error('Profiling error:', err);
      setError(err.message || 'Failed to generate dataset profile.');
      setStatus('failed');
    } finally {
      setIsGenerating(false);
    }
  };



  if (isLoading) {
    return (
      <div className="ds-prof-page">
        <div className="ds-prof-loading-box glass">
          <Loader2 size={36} className="ds-prof-spinner" />
          <p>Loading dataset profiling status...</p>
        </div>
      </div>
    );
  }

  const datasetName = dataset?.dataset_name || 'Dataset Profile';
  const currentVersion = dataset?.current_version || 1;

  // Extract Profile Sub-objects
  const summary = profileData?.dataset_summary || {};
  const stats = profileData?.dataset_statistics || {};
  const quality = profileData?.dataset_quality || {};
  const missing = profileData?.missing_value_analysis || {};
  const distribution = profileData?.data_type_distribution || {};
  const colStats = profileData?.column_statistics || [];
  const correlation = profileData?.correlation_overview || {};
  const sampleData = profileData?.sample_data_preview || [];

  return (
    <div className="ds-prof-page">
      {/* ── Header ── */}
      <motion.div
        className="ds-prof-header glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="ds-prof-header-left">
          <div className="ds-prof-header-icon">
            <BarChart3 size={26} />
          </div>
          <div>
            <div className="ds-prof-title-row">
              <h1 className="ds-prof-title">{datasetName}</h1>
              <span className="ds-prof-ver-badge">v{currentVersion}</span>
              <span className={`ds-prof-status-badge ds-prof-status--${status}`}>
                {status === 'generating' && <Loader2 size={12} className="ds-prof-spinner" />}
                {status === 'completed' && <CheckCircle2 size={12} />}
                {status === 'failed' && <AlertCircle size={12} />}
                {status === 'not_generated' && 'Not Generated'}
                {status === 'generating' && 'Generating Profile...'}
                {status === 'completed' && 'Completed'}
                {status === 'failed' && 'Failed'}
              </span>
            </div>
            <p className="ds-prof-subtitle" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Detailed statistical profile, distributions, and column analytics
            </p>
          </div>
        </div>

        <div className="ds-prof-header-right">
          <Button
            variant="primary"
            size="md"
            leftIcon={isGenerating ? <Loader2 size={16} className="ds-prof-spinner" /> : <Play size={16} />}
            onClick={handleGenerateProfile}
            disabled={isGenerating}
          >
            {status === 'completed' ? 'Re-Generate Profile' : 'Generate Profile'}
          </Button>
        </div>
      </motion.div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="ds-page-error glass" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <AlertCircle size={18} style={{ color: '#ef4444' }} />
          <span>{error}</span>
          <button onClick={handleGenerateProfile} className="ds-error-retry">Retry</button>
        </div>
      )}

      {/* ── Empty State ── */}
      {status === 'not_generated' && !isGenerating && (
        <motion.div
          className="ds-prof-empty glass"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="ds-prof-empty-icon-wrap">
            <BarChart3 size={40} />
          </div>
          <h2 className="ds-prof-empty-title">Dataset profile has not been generated</h2>
          <p className="ds-prof-empty-subtitle">
            Generate a comprehensive statistical profile to inspect descriptive statistics, column distributions, missing values, and data quality metrics before feature engineering.
          </p>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Play size={18} />}
            onClick={handleGenerateProfile}
          >
            Generate Profile Now
          </Button>
        </motion.div>
      )}

      {/* ── Generating Loading State ── */}
      {isGenerating && (
        <div className="ds-prof-loading-box glass">
          <Loader2 size={48} className="ds-prof-spinner" />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Profiling Dataset...
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px' }}>
            Calculating column statistics, distributions, missing values, duplicates, and correlation matrices.
          </p>
        </div>
      )}

      {/* ── Profiling Completed Content ── */}
      {status === 'completed' && profileData && !isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
        >
          {/* ── Section 1: Dataset Quality ── */}
          <div className="ds-prof-quality-card glass">
            <div className="ds-prof-quality-score-box">
              <div className="ds-prof-quality-ring">
                <span className="ds-prof-quality-val">{quality.quality_score ?? 100}%</span>
              </div>
              <span className={`ds-prof-quality-badge ds-badge--${(quality.quality_badge || 'Good').toLowerCase()}`}>
                {quality.quality_badge || 'Good'} Quality
              </span>
            </div>

            <div className="ds-prof-quality-factors">
              <span className="ds-prof-factors-title">Quality Score Factors</span>
              <div className="ds-prof-factor-list">
                <div className="ds-prof-factor-item">
                  <div className="ds-prof-factor-label">Missing Values</div>
                  <div className="ds-prof-factor-val">{quality.factors?.missing_cell_pct ?? 0}%</div>
                </div>
                <div className="ds-prof-factor-item">
                  <div className="ds-prof-factor-label">Duplicate Rows</div>
                  <div className="ds-prof-factor-val">{quality.factors?.duplicate_row_pct ?? 0}%</div>
                </div>
                <div className="ds-prof-factor-item">
                  <div className="ds-prof-factor-label">Empty Cells</div>
                  <div className="ds-prof-factor-val">{quality.factors?.empty_cells_count ?? 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 2: Dataset Summary Cards (9 Cards) ── */}
          <div>
            <div className="ds-prof-section-header">
              <h2 className="ds-prof-section-title">
                <Database size={18} /> Dataset Summary
              </h2>
            </div>
            <div className="ds-prof-summary-grid">
              <div className="ds-prof-stat-card glass">
                <div className="ds-prof-stat-icon"><Layers size={20} /></div>
                <div className="ds-prof-stat-info">
                  <span className="ds-prof-stat-val">{summary.total_rows?.toLocaleString() ?? 0}</span>
                  <span className="ds-prof-stat-label">Total Rows</span>
                </div>
              </div>

              <div className="ds-prof-stat-card glass">
                <div className="ds-prof-stat-icon"><Table size={20} /></div>
                <div className="ds-prof-stat-info">
                  <span className="ds-prof-stat-val">{summary.total_columns ?? 0}</span>
                  <span className="ds-prof-stat-label">Total Columns</span>
                </div>
              </div>



              <div className="ds-prof-stat-card glass">
                <div className="ds-prof-stat-icon" style={{ color: '#ef4444' }}><AlertTriangle size={20} /></div>
                <div className="ds-prof-stat-info">
                  <span className="ds-prof-stat-val">{summary.missing_values?.toLocaleString() ?? 0}</span>
                  <span className="ds-prof-stat-label">Missing Values</span>
                </div>
              </div>

              <div className="ds-prof-stat-card glass">
                <div className="ds-prof-stat-icon" style={{ color: '#ec4899' }}><Copy size={20} /></div>
                <div className="ds-prof-stat-info">
                  <span className="ds-prof-stat-val">{summary.duplicate_rows?.toLocaleString() ?? 0}</span>
                  <span className="ds-prof-stat-label">Duplicate Rows</span>
                </div>
              </div>


            </div>
          </div>

          {/* ── Section 3: Data Type Distribution Cards ── */}
          <div>
            <div className="ds-prof-section-header">
              <h2 className="ds-prof-section-title">
                <Activity size={18} /> Data Type Distribution
              </h2>
            </div>
            <div className="ds-prof-types-grid">
              <div className="ds-prof-type-card glass">
                <span className="ds-prof-type-count" style={{ color: '#3b82f6' }}>{distribution.numeric ?? 0}</span>
                <span className="ds-prof-type-name">Numeric</span>
              </div>
              <div className="ds-prof-type-card glass">
                <span className="ds-prof-type-count" style={{ color: '#a855f7' }}>{distribution.categorical ?? 0}</span>
                <span className="ds-prof-type-name">Categorical</span>
              </div>
              <div className="ds-prof-type-card glass">
                <span className="ds-prof-type-count" style={{ color: '#10b981' }}>{distribution.boolean ?? 0}</span>
                <span className="ds-prof-type-name">Boolean</span>
              </div>
              <div className="ds-prof-type-card glass">
                <span className="ds-prof-type-count" style={{ color: '#f59e0b' }}>{distribution.date ?? 0}</span>
                <span className="ds-prof-type-name">Date</span>
              </div>
              <div className="ds-prof-type-card glass">
                <span className="ds-prof-type-count" style={{ color: '#94a3b8' }}>{distribution.text ?? 0}</span>
                <span className="ds-prof-type-name">Text</span>
              </div>
            </div>
          </div>

          {/* ── Section 4: Missing Value Analysis (Donut + Progress Bars) ── */}
          <div>
            <div className="ds-prof-section-header">
              <h2 className="ds-prof-section-title">
                <AlertTriangle size={18} /> Missing Value Analysis
              </h2>
            </div>
            <div className="ds-prof-missing-layout">
              {/* Donut Chart */}
              <div className="ds-prof-donut-card glass">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Total Missing Overview
                </h3>
                <DonutChart percentage={missing.missing_percentage ?? 0} />
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {missing.total_missing_values?.toLocaleString() ?? 0} missing cells out of {stats.total_cells?.toLocaleString() ?? 0} total cells
                </p>
              </div>

              {/* Progress Bar Charts */}
              <div className="ds-prof-missing-bars-card glass">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
                  Top Missing Columns
                </h3>
                {(!missing.missing_by_column || missing.missing_by_column.length === 0) ? (
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No missing values found in dataset.</p>
                ) : (
                  missing.missing_by_column.slice(0, 6).map((item) => (
                    <div key={item.column} className="ds-prof-bar-item">
                      <div className="ds-prof-bar-header">
                        <span>{item.column}</span>
                        <span>{item.missing_count} ({item.missing_percentage}%)</span>
                      </div>
                      <div className="ds-prof-progress-track">
                        <div
                          className="ds-prof-progress-fill"
                          style={{
                            width: `${item.missing_percentage}%`,
                            background: item.missing_percentage > 20 ? '#ef4444' : item.missing_percentage > 5 ? '#f59e0b' : '#6366f1',
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>





          {/* ── Section 7: Sample Data Preview ── */}
          {sampleData && sampleData.length > 0 && (
            <div>
              <div className="ds-prof-section-header">
                <h2 className="ds-prof-section-title">
                  <Table size={18} /> Sample Data Preview (First 10 Rows)
                </h2>
              </div>
              <div className="ds-prof-table-card glass">
                <div className="ds-prof-table-wrap">
                  <table className="ds-prof-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        {Object.keys(sampleData[0]).map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ color: 'var(--text-tertiary)' }}>{idx + 1}</td>
                          {Object.keys(row).map((col) => (
                            <td key={col}>{row[col] ?? '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default DatasetProfiling;
