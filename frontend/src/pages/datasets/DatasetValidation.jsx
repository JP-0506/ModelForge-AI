/* ============================================================
   DatasetValidation — Complete Phase 6 Dataset Validation Page
   ============================================================ */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Database,
  Layers,
  Table,
  AlertTriangle,
  Copy,
  Activity,
  Calendar,
  Hash,
  Download,
  RotateCcw,
  Sparkles,
  HelpCircle,
  FileCheck,
  Search,
} from 'lucide-react';
import datasetService from '../../services/datasetService';
import Button from '../../components/common/Button/Button';
import './DatasetValidation.css';

// SVG Score Gauge Component
const ScoreGauge = ({ score = 100, badge = 'Excellent' }) => {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 90) return '#10b981'; // Emerald/Green
    if (s >= 75) return '#6366f1'; // Indigo/Blue
    if (s >= 50) return '#f59e0b'; // Amber/Warning
    return '#ef4444'; // Red/Error
  };

  const color = getColor(score);

  return (
    <div className="ds-val-gauge-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="14"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="ds-val-gauge-center">
        <span className="ds-val-score-num" style={{ color }}>{score}</span>
        <span className="ds-val-score-denom">/ 100</span>
      </div>
    </div>
  );
};

const DatasetValidation = () => {
  const { datasetId } = useParams();

  const [dataset, setDataset] = useState(null);
  const [validationData, setValidationData] = useState(null);
  const [status, setStatus] = useState('Running'); // 'Not Validated' | 'Running' | 'Completed' | 'Failed'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('statistics'); // 'statistics' | 'missing' | 'datatypes' | 'duplicates' | 'invalid' | 'quality_issues'
  const [searchQuery, setSearchQuery] = useState('');

  const isExecutingRef = useRef(false);

  // Auto-trigger Validation on Mount
  const runValidation = async () => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;
    setIsLoading(true);
    setStatus('Running');
    setError('');

    try {
      // Fetch Dataset Metadata
      const ds = await datasetService.getById(datasetId);
      setDataset(ds);

      // Trigger Validation API
      const result = await datasetService.validateDataset(datasetId, 'original');
      setValidationData(result);
      setStatus('Completed');
    } catch (err) {
      console.error('Validation Error:', err);
      setError(err.message || 'Failed to complete dataset validation.');
      setStatus('Failed');
    } finally {
      setIsLoading(false);
      isExecutingRef.current = false;
    }
  };

  useEffect(() => {
    runValidation();
  }, [datasetId]);

  const datasetName = dataset?.dataset_name || 'Dataset';
  const currentVersion = dataset?.current_version || 1;

  // Extract response structures
  const summary = validationData?.summary || {};
  const report = validationData?.report || {};
  const issues = validationData?.issues || [];
  const score = summary.validation_score ?? validationData?.validation_score ?? 100;
  const qualityBadge = summary.quality_badge || validationData?.quality_badge || 'Good';

  // Filtered Column Statistics
  const filteredStats = useMemo(() => {
    const statsList = report.column_statistics || [];
    if (!searchQuery.trim()) return statsList;
    const q = searchQuery.toLowerCase();
    return statsList.filter(
      (item) =>
        item.column.toLowerCase().includes(q) ||
        item.data_type.toLowerCase().includes(q)
    );
  }, [report.column_statistics, searchQuery]);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Export PDF Handler
  const handleExportPDF = async () => {
    if (!validationData) return;
    setIsExportingPdf(true);
    try {
      await datasetService.exportValidationReport(
        {
          dataset_name: datasetName || 'Dataset',
          total_rows: summary.total_rows || 0,
          total_columns: summary.total_columns || 0,
          status: status || 'Completed',
          passed_checks: summary.passed_checks || 0,
          warning_checks: summary.warning_checks || 0,
          error_checks: summary.error_checks || 0,
          issues: issues || [],
        },
        datasetName || 'dataset'
      );
    } catch (err) {
      alert('Failed to export PDF validation report: ' + (err.message || 'Unknown error'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="ds-val-page">
      {/* ── Page Header ── */}
      <motion.div
        className="ds-val-header glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="ds-val-header-left">
          <div className="ds-val-header-icon">
            <CheckSquare size={26} />
          </div>
          <div>
            <div className="ds-val-title-row">
              <h1 className="ds-val-title">{datasetName}</h1>
              <span className="ds-val-ver-badge">v{currentVersion}</span>
              <span className={`ds-val-status-badge ds-val-status--${status.toLowerCase().replace(' ', '-')}`}>
                {status === 'Running' && <Loader2 size={12} className="ds-val-spinner" />}
                {status === 'Completed' && <CheckCircle2 size={12} />}
                {status === 'Failed' && <AlertCircle size={12} />}
                {status === 'Not Validated' && <HelpCircle size={12} />}
                {status}
              </span>
            </div>
            <p className="ds-val-subtitle">
              Automated data quality analysis, structural health check, and schema validation
            </p>
          </div>
        </div>

        <div className="ds-val-header-right">
          <Button
            variant="secondary"
            size="md"
            leftIcon={isExportingPdf ? <Loader2 size={16} className="ds-val-spinner" /> : <Download size={16} />}
            onClick={handleExportPDF}
            disabled={isLoading || status !== 'Completed' || isExportingPdf}
          >
            {isExportingPdf ? 'Exporting PDF...' : 'Export Report (PDF)'}
          </Button>
        </div>
      </motion.div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="ds-val-error-banner glass">
          <div className="ds-val-error-text">
            <AlertCircle size={20} className="ds-val-error-icon" />
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '15px' }}>Validation Failed</h4>
              <p style={{ fontSize: '13px', opacity: 0.9 }}>{error}</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RotateCcw size={14} />}
            onClick={runValidation}
          >
            Retry Validation
          </Button>
        </div>
      )}

      {/* ── Initial Loading State (Skeleton Cards & Indicator) ── */}
      {isLoading && (
        <motion.div
          className="ds-val-loading-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="ds-val-loading-box glass">
            <Loader2 size={48} className="ds-val-spinner ds-val-spinner-lg" />
            <div className="ds-val-loading-text">
              <h2>Analyzing dataset...</h2>
              <p>Please wait while the dataset structure, data types, missing values, and duplicates are being validated.</p>
            </div>
            <div className="ds-val-progress-bar">
              <div className="ds-val-progress-fill" />
            </div>
          </div>

          {/* Skeleton Cards Grid */}
          <div className="ds-val-skeleton-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="ds-val-skeleton-card glass skeleton-pulse" />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Completed Validation Dashboard ── */}
      {!isLoading && status === 'Completed' && validationData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
        >
          {/* ── Top Dashboard Section: Health Check Overview ── */}
          <div className="ds-val-score-card glass">
            <div className="ds-val-score-right" style={{ width: '100%' }}>
              <h3 className="ds-val-health-title">Health Check Overview</h3>
              <div className="ds-val-health-stats">
                <div className="ds-val-health-item">
                  <span className="ds-val-health-num" style={{ color: '#10b981' }}>{summary.passed_checks ?? 0}</span>
                  <span className="ds-val-health-name">Passed Checks</span>
                </div>
                <div className="ds-val-health-item">
                  <span className="ds-val-health-num" style={{ color: '#f59e0b' }}>{summary.warning_checks ?? 0}</span>
                  <span className="ds-val-health-name">Warnings</span>
                </div>
                <div className="ds-val-health-item">
                  <span className="ds-val-health-num" style={{ color: '#ef4444' }}>{summary.error_checks ?? 0}</span>
                  <span className="ds-val-health-name">Critical Errors</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Summary Cards (10 Cards Grid) ── */}
          <div>
            <div className="ds-val-section-header">
              <h2 className="ds-val-section-title">
                <Database size={18} /> Dataset Summary
              </h2>
            </div>
            <div className="ds-val-summary-grid">
              {/* Card 1: Total Rows */}
              <div className="ds-val-stat-card glass">
                <div className="ds-val-stat-icon" style={{ color: '#6366f1' }}><Layers size={20} /></div>
                <div className="ds-val-stat-info">
                  <span className="ds-val-stat-val">{summary.total_rows?.toLocaleString() ?? 0}</span>
                  <span className="ds-val-stat-label">Total Rows</span>
                </div>
              </div>

              {/* Card 2: Total Columns */}
              <div className="ds-val-stat-card glass">
                <div className="ds-val-stat-icon" style={{ color: '#3b82f6' }}><Table size={20} /></div>
                <div className="ds-val-stat-info">
                  <span className="ds-val-stat-val">{summary.total_columns ?? 0}</span>
                  <span className="ds-val-stat-label">Total Columns</span>
                </div>
              </div>

              {/* Card 3: Missing Values */}
              <div className="ds-val-stat-card glass">
                <div className="ds-val-stat-icon" style={{ color: summary.missing_values > 0 ? '#ef4444' : '#10b981' }}>
                  <AlertTriangle size={20} />
                </div>
                <div className="ds-val-stat-info">
                  <span className="ds-val-stat-val">{summary.missing_values?.toLocaleString() ?? 0}</span>
                  <span className="ds-val-stat-label">Missing Values</span>
                </div>
              </div>

              {/* Card 4: Duplicate Rows */}
              <div className="ds-val-stat-card glass">
                <div className="ds-val-stat-icon" style={{ color: summary.duplicate_rows > 0 ? '#f59e0b' : '#10b981' }}>
                  <Copy size={20} />
                </div>
                <div className="ds-val-stat-info">
                  <span className="ds-val-stat-val">{summary.duplicate_rows?.toLocaleString() ?? 0}</span>
                  <span className="ds-val-stat-label">Duplicate Rows</span>
                </div>
              </div>

              {/* Card 5: Duplicate Columns */}
              <div className="ds-val-stat-card glass">
                <div className="ds-val-stat-icon" style={{ color: summary.duplicate_columns > 0 ? '#ec4899' : '#10b981' }}>
                  <Copy size={20} />
                </div>
                <div className="ds-val-stat-info">
                  <span className="ds-val-stat-val">{summary.duplicate_columns ?? 0}</span>
                  <span className="ds-val-stat-label">Duplicate Columns</span>
                </div>
              </div>

              {/* Card 6: Numeric Columns */}
              <div className="ds-val-stat-card glass">
                <div className="ds-val-stat-icon" style={{ color: '#06b6d4' }}><Hash size={20} /></div>
                <div className="ds-val-stat-info">
                  <span className="ds-val-stat-val">{summary.numeric_columns ?? 0}</span>
                  <span className="ds-val-stat-label">Numeric Columns</span>
                </div>
              </div>

              {/* Card 7: Categorical Columns */}
              <div className="ds-val-stat-card glass">
                <div className="ds-val-stat-icon" style={{ color: '#a855f7' }}><Activity size={20} /></div>
                <div className="ds-val-stat-info">
                  <span className="ds-val-stat-val">{summary.categorical_columns ?? 0}</span>
                  <span className="ds-val-stat-label">Categorical Columns</span>
                </div>
              </div>

              {/* Card 8: Date Columns */}
              <div className="ds-val-stat-card glass">
                <div className="ds-val-stat-icon" style={{ color: '#f59e0b' }}><Calendar size={20} /></div>
                <div className="ds-val-stat-info">
                  <span className="ds-val-stat-val">{summary.date_columns ?? 0}</span>
                  <span className="ds-val-stat-label">Date Columns</span>
                </div>
              </div>

              {/* Card 9: Boolean Columns */}
              <div className="ds-val-stat-card glass">
                <div className="ds-val-stat-icon" style={{ color: '#10b981' }}><FileCheck size={20} /></div>
                <div className="ds-val-stat-info">
                  <span className="ds-val-stat-val">{summary.boolean_columns ?? 0}</span>
                  <span className="ds-val-stat-label">Boolean Columns</span>
                </div>
              </div>

              {/* Card 10: Validation Score */}
              <div className="ds-val-stat-card glass">
                <div className="ds-val-stat-icon" style={{ color: '#8b5cf6' }}><Sparkles size={20} /></div>
                <div className="ds-val-stat-info">
                  <span className="ds-val-stat-val">{score} / 100</span>
                  <span className="ds-val-stat-label">Validation Score</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Validation Report Tabs ── */}
          <div className="ds-val-report-section">
            <div className="ds-val-tabs-header glass">
              <button
                className={`ds-val-tab-btn ${activeTab === 'statistics' ? 'ds-val-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('statistics')}
              >
                <Table size={15} /> Column Statistics ({report.column_statistics?.length ?? 0})
              </button>
              <button
                className={`ds-val-tab-btn ${activeTab === 'missing' ? 'ds-val-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('missing')}
              >
                <AlertTriangle size={15} /> Missing Values ({report.missing_values?.length ?? 0})
              </button>
              <button
                className={`ds-val-tab-btn ${activeTab === 'datatypes' ? 'ds-val-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('datatypes')}
              >
                <Activity size={15} /> Data Types ({report.data_types?.length ?? 0})
              </button>
              <button
                className={`ds-val-tab-btn ${activeTab === 'duplicates' ? 'ds-val-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('duplicates')}
              >
                <Copy size={15} /> Duplicate Records
              </button>
              <button
                className={`ds-val-tab-btn ${activeTab === 'invalid' ? 'ds-val-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('invalid')}
              >
                <AlertCircle size={15} /> Invalid Values
              </button>
              <button
                className={`ds-val-tab-btn ${activeTab === 'quality_issues' ? 'ds-val-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('quality_issues')}
              >
                <FileCheck size={15} /> Detected Issues ({issues.length})
              </button>
            </div>

            <div className="ds-val-tab-content glass">
              {/* Tab 1: Column Statistics */}
              {activeTab === 'statistics' && (
                <div>
                  <div className="ds-val-search-box">
                    <Search size={16} className="ds-val-search-icon" />
                    <input
                      type="text"
                      placeholder="Filter column statistics by name or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ds-val-search-input"
                    />
                  </div>

                  <div className="ds-val-table-wrap">
                    <table className="ds-val-table">
                      <thead>
                        <tr>
                          <th>Column Name</th>
                          <th>Data Type</th>
                          <th>Unique Values</th>
                          <th>Missing Values</th>
                          <th>Missing %</th>
                          <th>Min</th>
                          <th>Max</th>
                          <th>Mean</th>
                          <th>Median</th>
                          <th>Std Dev</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStats.length === 0 ? (
                          <tr>
                            <td colSpan="10" style={{ textAlign: 'center', py: 4, color: 'var(--text-secondary)' }}>
                              No columns match the search query.
                            </td>
                          </tr>
                        ) : (
                          filteredStats.map((item) => (
                            <tr key={item.column}>
                              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.column}</td>
                              <td>
                                <span className={`ds-val-type-tag ds-type--${item.data_type.toLowerCase()}`}>
                                  {item.data_type}
                                </span>
                              </td>
                              <td>{item.unique_values?.toLocaleString() ?? 0}</td>
                              <td style={{ color: item.missing_values > 0 ? '#ef4444' : 'inherit' }}>
                                {item.missing_values?.toLocaleString() ?? 0}
                              </td>
                              <td style={{ color: item.missing_percentage > 0 ? '#ef4444' : 'inherit' }}>
                                {item.missing_percentage}%
                              </td>
                              <td>{item.min !== null ? item.min : '—'}</td>
                              <td>{item.max !== null ? item.max : '—'}</td>
                              <td>{item.mean !== null ? item.mean : '—'}</td>
                              <td>{item.median !== null ? item.median : '—'}</td>
                              <td>{item.std_dev !== null ? item.std_dev : '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Missing Values */}
              {activeTab === 'missing' && (
                <div>
                  {(!report.missing_values || report.missing_values.length === 0) ? (
                    <div className="ds-val-empty-tab">
                      <CheckCircle2 size={36} style={{ color: '#10b981' }} />
                      <h3>No Missing Values Detected</h3>
                      <p>All dataset columns contain 100% complete data entries.</p>
                    </div>
                  ) : (
                    <div className="ds-val-table-wrap">
                      <table className="ds-val-table">
                        <thead>
                          <tr>
                            <th>Column Name</th>
                            <th>Missing Count</th>
                            <th>Missing Percentage</th>
                            <th>Impact Visual</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.missing_values.map((item) => (
                            <tr key={item.column}>
                              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.column}</td>
                              <td style={{ color: '#ef4444', fontWeight: 600 }}>{item.missing_count?.toLocaleString()}</td>
                              <td style={{ color: '#ef4444', fontWeight: 600 }}>{item.missing_percentage}%</td>
                              <td style={{ width: '40%' }}>
                                <div className="ds-val-bar-track">
                                  <div
                                    className="ds-val-bar-fill"
                                    style={{
                                      width: `${Math.min(100, item.missing_percentage)}%`,
                                      background: item.missing_percentage > 20 ? '#ef4444' : '#f59e0b',
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Data Types */}
              {activeTab === 'datatypes' && (
                <div>
                  <div className="ds-val-table-wrap">
                    <table className="ds-val-table">
                      <thead>
                        <tr>
                          <th>Column Name</th>
                          <th>Detected Type</th>
                          <th>Expected Type</th>
                          <th>Consistency Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.data_types?.map((item) => (
                          <tr key={item.column}>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.column}</td>
                            <td>
                              <span className={`ds-val-type-tag ds-type--${item.detected_type.toLowerCase()}`}>
                                {item.detected_type}
                              </span>
                            </td>
                            <td>{item.expected_type}</td>
                            <td>
                              <span className={`ds-val-status-chip ds-chip--${item.status.toLowerCase()}`}>
                                {item.status === 'Valid' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: Duplicate Records */}
              {activeTab === 'duplicates' && (
                <div className="ds-val-duplicates-layout">
                  <div className="ds-val-dup-card glass">
                    <h4>Duplicate Rows Overview</h4>
                    <div className="ds-val-dup-val">{report.duplicate_rows?.total_duplicate_rows ?? 0}</div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Total exact duplicate rows ({report.duplicate_rows?.duplicate_percentage ?? 0}% of dataset)
                    </p>
                  </div>

                  <div className="ds-val-dup-card glass">
                    <h4>Duplicate Columns Overview</h4>
                    {(!report.duplicate_columns || report.duplicate_columns.length === 0) ? (
                      <p style={{ fontSize: '14px', color: '#10b981', marginTop: '8px' }}>
                        No duplicate columns found.
                      </p>
                    ) : (
                      <ul className="ds-val-dup-list">
                        {report.duplicate_columns.map((col) => (
                          <li key={col} className="ds-val-dup-item">
                            <Copy size={14} style={{ color: '#ec4899' }} /> {col}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 5: Invalid Values */}
              {activeTab === 'invalid' && (
                <div>
                  <div className="ds-val-invalid-summary">
                    <div className="ds-val-invalid-box">
                      <span>Empty Strings</span>
                      <strong>{report.invalid_values?.empty_strings_count ?? 0}</strong>
                    </div>
                    <div className="ds-val-invalid-box">
                      <span>Null / NaN Values</span>
                      <strong>{report.invalid_values?.null_values_count ?? 0}</strong>
                    </div>
                    <div className="ds-val-invalid-box">
                      <span>Infinite Values (±inf)</span>
                      <strong>{report.invalid_values?.infinite_values_count ?? 0}</strong>
                    </div>
                  </div>

                  {report.invalid_values?.details_by_column && report.invalid_values.details_by_column.length > 0 && (
                    <div className="ds-val-table-wrap" style={{ marginTop: 'var(--space-4)' }}>
                      <table className="ds-val-table">
                        <thead>
                          <tr>
                            <th>Column Name</th>
                            <th>Empty Strings</th>
                            <th>Null Values</th>
                            <th>Infinite Values</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.invalid_values.details_by_column.map((item) => (
                            <tr key={item.column}>
                              <td style={{ fontWeight: 600 }}>{item.column}</td>
                              <td style={{ color: item.empty_strings > 0 ? '#f59e0b' : 'inherit' }}>{item.empty_strings}</td>
                              <td style={{ color: item.null_values > 0 ? '#ef4444' : 'inherit' }}>{item.null_values}</td>
                              <td style={{ color: item.infinite_values > 0 ? '#ef4444' : 'inherit' }}>{item.infinite_values}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 6: Detected Issues & Quality Warnings */}
              {activeTab === 'quality_issues' && (
                <div>
                  {issues.length === 0 ? (
                    <div className="ds-val-empty-tab">
                      <CheckCircle2 size={36} style={{ color: '#10b981' }} />
                      <h3>Zero Validation Issues Found</h3>
                      <p>Your dataset passed all structure, null, duplicate, and cardinality checks clean!</p>
                    </div>
                  ) : (
                    <div className="ds-val-issues-list">
                      {issues.map((issue, idx) => (
                        <div key={idx} className={`ds-val-issue-item ds-issue--${issue.severity}`}>
                          <div className="ds-val-issue-header">
                            <span className="ds-val-issue-type">{issue.type.replace('_', ' ').toUpperCase()}</span>
                            <span className="ds-val-issue-severity">{issue.severity}</span>
                          </div>
                          <p className="ds-val-issue-msg">{issue.message}</p>
                          <div className="ds-val-issue-rec">
                            <strong>Recommendation:</strong> {issue.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DatasetValidation;
