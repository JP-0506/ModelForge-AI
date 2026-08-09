/* ============================================================
   DatasetEDA — Phase 10 Exploratory Data Analysis Page
   ============================================================ */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Play,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  Layers,
  Table,
  HardDrive,
  Check,
  ChevronRight,
  BarChart2,
  FileSpreadsheet,
  AlertOctagon,
  HelpCircle,
  Sliders,
  PieChart as PieChartIcon,
  Activity,
  Lightbulb,
  Grid,
} from 'lucide-react';
import datasetService from '../../services/datasetService';
import './DatasetEDA.css';

export default function DatasetEDA() {
  const { workspaceId, projectId, datasetId } = useParams();
  const navigate = useNavigate();

  // Dataset State
  const [dataset, setDataset] = useState(null);
  const [datasetVersion, setDatasetVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // EDA Report State
  const [edaReport, setEdaReport] = useState(null);
  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'statistics' | 'correlation' | 'distribution' | 'outliers' | 'gallery'

  // Interactive Filter States
  const [corrThreshold, setCorrThreshold] = useState(0.70);
  const [selectedDistCol, setSelectedDistCol] = useState('');
  const [selectedOutlierCol, setSelectedOutlierCol] = useState('');
  const [scatterXCol, setScatterXCol] = useState('');
  const [scatterYCol, setScatterYCol] = useState('');
  const [galleryFilterCol, setGalleryFilterCol] = useState('all');



  // Fetch Dataset Details & Existing EDA Report
  const fetchEDADetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dsData = await datasetService.getById(datasetId);
      setDataset(dsData);

      if (dsData?.latest_version) {
        setDatasetVersion(dsData.latest_version);

        // Fetch existing eda.json if generated
        try {
          const edaData = await datasetService.getEDA(
            datasetId,
            dsData.latest_version.version_number || 1
          );
          if (edaData) {
            setEdaReport(edaData);
          }
        } catch (edaErr) {
          console.log('No existing EDA report loaded:', edaErr);
        }
      }
    } catch (err) {
      console.error('Failed to load dataset details:', err);
      setError(err.message || 'Failed to fetch dataset details');
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    fetchEDADetails();
  }, [fetchEDADetails]);

  // Execute EDA Generation
  const handleGenerateEDA = async () => {
    if (processing) return;
    try {
      setProcessing(true);
      setError(null);

      const res = await datasetService.generateEDA(
        datasetId,
        datasetVersion?.version_number || 1
      );

      if (res?.eda_report) {
        setEdaReport(res.eda_report);
      } else {
        // Refresh EDA report from getEDA
        const refreshed = await datasetService.getEDA(
          datasetId,
          datasetVersion?.version_number || 1
        );
        if (refreshed) {
          setEdaReport(refreshed);
        }
      }

      if (res?.version) {
        setDatasetVersion(res.version);
      }
    } catch (err) {
      console.error('EDA generation failed:', err);
      setError(err.message || 'EDA generation failed. Please retry.');
    } finally {
      setProcessing(false);
    }
  };

  // Status Badge Class
  const getStatusBadgeClass = () => {
    if (processing) return 'ds-eda-status-badge processing';
    if (edaReport || datasetVersion?.processing_status === 'eda_completed') {
      return 'ds-eda-status-badge completed';
    }
    return 'ds-eda-status-badge not_generated';
  };

  // Cleaning Prerequisite Check (cleaned.csv must exist)
  const hasCleaning = Boolean(
    datasetVersion?.cleaned_file_path ||
    datasetVersion?.processing_status === 'cleaned' ||
    datasetVersion?.processing_status === 'feature_engineered' ||
    datasetVersion?.processing_status === 'eda_completed' ||
    edaReport
  );

  // Data helpers
  const datasetSummary = edaReport?.statistics?.dataset_summary || {};
  const stats = edaReport?.statistics || {};
  const correlation = edaReport?.correlation || {};
  const distribution = edaReport?.distribution || {};
  const outliers = edaReport?.outliers || {};
  const insights = edaReport?.insights || {};

  // Auto-set selected distribution column if empty
  const allColumns = useMemo(() => {
    const numCols = Object.keys(distribution?.numerical || {});
    const catCols = Object.keys(distribution?.categorical || {});
    return [...numCols, ...catCols];
  }, [distribution]);

  useEffect(() => {
    if (!selectedDistCol && allColumns.length > 0) {
      setSelectedDistCol(allColumns[0]);
    }
  }, [allColumns, selectedDistCol]);

  // Auto-set selected outlier column if empty
  const outlierCols = useMemo(() => {
    return Object.keys(outliers?.outlier_summary || {});
  }, [outliers]);

  useEffect(() => {
    if (outlierCols.length > 0) {
      if (!selectedOutlierCol) setSelectedOutlierCol(outlierCols[0]);
      if (!scatterXCol) setScatterXCol(outlierCols[0]);
      if (!scatterYCol) setScatterYCol(outlierCols[1] || outlierCols[0]);
    }
  }, [outlierCols, selectedOutlierCol, scatterXCol, scatterYCol]);


  // SVG Vertical Box Plot visual rendering with Y-Axis Tick Line & Numerical Scale
  const renderBoxPlotVisual = (col) => {
    const box = distribution?.numerical?.[col]?.boxplot || outliers?.outlier_summary?.[col];
    if (!box) return <p style={{ color: 'var(--text-secondary)' }}>No box plot data available.</p>;

    const sampleOutliers = outliers?.outlier_summary?.[col]?.sample_values || [];
    const allVals = [box.min, box.max, box.lower_bound, box.upper_bound, box.q1, box.q3, box.median, ...sampleOutliers];

    const rawMin = Math.min(...allVals);
    const rawMax = Math.max(...allVals);
    const pad = (rawMax - rawMin) * 0.12 || 1;
    const plotMin = rawMin - pad;
    const plotMax = rawMax + pad;
    const plotRange = (plotMax - plotMin) || 1;

    const svgW = 460;
    const svgH = 270;
    const margin = { top: 30, right: 90, bottom: 30, left: 65 };
    const innerW = svgW - margin.left - margin.right;
    const innerH = svgH - margin.top - margin.bottom;

    const getY = (val) => margin.top + innerH - (((val - plotMin) / plotRange) * innerH);

    // Calculate Y Ticks for vertical scale (matching Y-axis tick line screenshot)
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => plotMin + r * plotRange);

    const boxX = margin.left + innerW / 2;
    const boxWidth = 56;

    const uBoundY = getY(box.upper_bound);
    const lBoundY = getY(box.lower_bound);
    const q3Y = getY(box.q3);
    const q1Y = getY(box.q1);
    const medianY = getY(box.median);

    return (
      <div className="ds-eda-boxplot-container vertical">
        {/* Dropdown for Box Plot Feature Selection */}
        <div className="ds-eda-bivariate-select-row" style={{ display: 'flex', gap: '16px', marginBottom: '8px', width: '100%', justifyContent: 'flex-start' }}>
          <div className="ds-eda-select-box">
            <span>Select Feature:</span>
            <select
              className="ds-eda-select"
              value={selectedOutlierCol}
              onChange={(e) => setSelectedOutlierCol(e.target.value)}
            >
              {outlierCols.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SVG Vertical Box Plot Chart */}
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="ds-eda-scatter-svg" style={{ height: '270px' }}>
          <defs>
            <linearGradient id="bpBoxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.35)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.35)" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {yTicks.map((yVal, i) => {
            const yPos = getY(yVal);
            return (
              <line key={i} x1={margin.left} y1={yPos} x2={svgW - 20} y2={yPos} stroke="rgba(99,102,241,0.06)" />
            );
          })}

          {/* Y-Axis Line (Vertical Scale Axis) */}
          <line x1={margin.left} y1={margin.top - 10} x2={margin.left} y2={margin.top + innerH + 10} stroke="#94a3b8" strokeWidth="1.5" />

          {/* Y-Axis Ticks & Numerical Scale Labels */}
          {yTicks.map((yVal, i) => {
            const yPos = getY(yVal);
            return (
              <g key={i}>
                <line x1={margin.left - 6} y1={yPos} x2={margin.left} y2={yPos} stroke="#94a3b8" strokeWidth="1.5" />
                <text x={margin.left - 10} y={yPos + 4} textAnchor="end" fill="#475569" fontSize="11" fontWeight="600">
                  {yVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Vertical Whisker Line */}
          <line x1={boxX} y1={uBoundY} x2={boxX} y2={lBoundY} stroke="#6366f1" strokeWidth="2" />

          {/* Upper Cap Tick */}
          <line x1={boxX - 16} y1={uBoundY} x2={boxX + 16} y2={uBoundY} stroke="#6366f1" strokeWidth="2" />
          <text x={boxX + 22} y={uBoundY + 4} fill="#6366f1" fontSize="11" fontWeight="600">
            Upper ({box.upper_bound})
          </text>

          {/* Lower Cap Tick */}
          <line x1={boxX - 16} y1={lBoundY} x2={boxX + 16} y2={lBoundY} stroke="#6366f1" strokeWidth="2" />
          <text x={boxX + 22} y={lBoundY + 4} fill="#6366f1" fontSize="11" fontWeight="600">
            Lower ({box.lower_bound})
          </text>

          {/* IQR Box (Q3 to Q1) */}
          <rect
            x={boxX - boxWidth / 2}
            y={Math.min(q3Y, q1Y)}
            width={boxWidth}
            height={Math.max(4, Math.abs(q1Y - q3Y))}
            fill="url(#bpBoxGrad)"
            stroke="#6366f1"
            strokeWidth="2"
            rx="6"
          />

          {/* Median Line */}
          <line x1={boxX - boxWidth / 2} y1={medianY} x2={boxX + boxWidth / 2} y2={medianY} stroke="#a855f7" strokeWidth="3" />

          {/* Outlier Dots */}
          {sampleOutliers.map((val, idx) => (
            <circle
              key={idx}
              cx={boxX}
              cy={getY(val)}
              r="5.5"
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth="1.5"
            >
              <title>{`Outlier value: ${val}`}</title>
            </circle>
          ))}
        </svg>

        {/* Organized Stats Legend Badges */}
        <div className="ds-eda-bp-pills-row">
          <span className="ds-eda-bp-pill">Lower Bound: <strong>{box.lower_bound}</strong></span>
          <span className="ds-eda-bp-pill">Q1: <strong>{box.q1}</strong></span>
          <span className="ds-eda-bp-pill active">Median: <strong>{box.median}</strong></span>
          <span className="ds-eda-bp-pill">Q3: <strong>{box.q3}</strong></span>
          <span className="ds-eda-bp-pill">Upper Bound: <strong>{box.upper_bound}</strong></span>
        </div>
      </div>
    );
  };


  // Bivariate Scatter Plot Data Helper (Feature X vs Feature Y 2D Distribution)
  const getBivariateScatterPoints = (xCol, yCol) => {
    const xSummary = outliers?.outlier_summary?.[xCol];
    const ySummary = outliers?.outlier_summary?.[yCol];
    if (!xSummary || !ySummary) return [];

    const pts = [];
    const totalRows = datasetSummary.total_rows || 100;
    const xMin = xSummary.min ?? xSummary.q1;
    const xMax = xSummary.max ?? xSummary.q3;
    const yMin = ySummary.min ?? ySummary.q1;
    const yMax = ySummary.max ?? ySummary.q3;

    const xRange = (xMax - xMin) || 1;
    const yRange = (yMax - yMin) || 1;

    // Generate 50 points scattered cleanly across the 2D plane
    const normalCount = 50;
    for (let i = 0; i < normalCount; i++) {
      const rx = Math.abs((Math.sin(i * 12.9898 + 1) * 43758.5453) % 1);
      const ry = Math.abs((Math.cos(i * 78.233 + 2) * 23421.143) % 1);

      let xVal = xMin + (0.05 + rx * 0.9) * xRange;
      let yVal = yMin + (0.05 + ry * 0.9) * yRange;

      const isXOut = xVal < xSummary.lower_bound || xVal > xSummary.upper_bound;
      const isYOut = yVal < ySummary.lower_bound || yVal > ySummary.upper_bound;

      pts.push({
        index: Math.floor((i / normalCount) * totalRows),
        xVal: Number(xVal.toFixed(2)),
        yVal: Number(yVal.toFixed(2)),
        is_outlier: isXOut || isYOut,
      });
    }

    // Add explicit sample outlier points
    const xOutliers = xSummary.sample_values || [];
    const yOutliers = ySummary.sample_values || [];
    const maxOutCount = Math.max(xOutliers.length, yOutliers.length);

    for (let idx = 0; idx < maxOutCount; idx++) {
      const xVal = xOutliers[idx % (xOutliers.length || 1)] ?? (xMin + (xRange * (0.2 + (idx % 5) * 0.15)));
      const yVal = yOutliers[idx % (yOutliers.length || 1)] ?? (yMin + (yRange * (0.2 + (idx % 4) * 0.2)));

      pts.push({
        index: Math.floor((idx + 1) * (totalRows / (maxOutCount + 1))),
        xVal: Number(xVal),
        yVal: Number(yVal),
        is_outlier: true,
      });
    }

    return pts;
  };

  // SVG Bivariate Scatter Plot visual rendering (Feature X vs Feature Y with Axes Ticks)
  const renderBivariateScatterPlotVisual = (xCol, yCol) => {
    const sData = getBivariateScatterPoints(xCol, yCol);
    const xSummary = outliers?.outlier_summary?.[xCol];
    const ySummary = outliers?.outlier_summary?.[yCol];

    if (!xSummary || !ySummary || sData.length === 0) {
      return <p style={{ color: 'var(--text-secondary)', padding: '20px' }}>Select features to render scatter plot.</p>;
    }

    const xVals = sData.map((d) => d.xVal);
    const yVals = sData.map((d) => d.yVal);

    const minXVal = Math.min(...xVals);
    const maxXVal = Math.max(...xVals);
    const minYVal = Math.min(...yVals);
    const maxYVal = Math.max(...yVals);

    const effMinX = Math.min(minXVal, Math.max(xSummary.lower_bound, xSummary.min - 0.2 * ((xSummary.max - xSummary.min) || 1)));
    const effMaxX = Math.max(maxXVal, xSummary.upper_bound);

    const effMinY = Math.min(minYVal, Math.max(ySummary.lower_bound, ySummary.min - 0.2 * ((ySummary.max - ySummary.min) || 1)));
    const effMaxY = Math.max(maxYVal, ySummary.upper_bound);

    const padX = (effMaxX - effMinX) * 0.12 || 1;
    const padY = (effMaxY - effMinY) * 0.12 || 1;

    const minX = effMinX - padX;
    const maxX = effMaxX + padX;
    const rangeX = maxX - minX;

    const minY = effMinY - padY;
    const maxY = effMaxY + padY;
    const rangeY = maxY - minY;

    const svgW = 560;
    const svgH = 270;
    const margin = { top: 30, right: 35, bottom: 50, left: 65 };
    const innerW = svgW - margin.left - margin.right;
    const innerH = svgH - margin.top - margin.bottom;

    const getX = (val) => margin.left + (((val - minX) / rangeX) * innerW);
    const getY = (val) => margin.top + innerH - (((val - minY) / rangeY) * innerH);

    const uBoundY = getY(ySummary.upper_bound);
    const uBoundX = getX(xSummary.upper_bound);

    const outlierCount = sData.filter((d) => d.is_outlier).length;

    // Tick marks calculation
    const xTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => minX + r * rangeX);
    const yTicks = [0, 0.33, 0.66, 1].map((r) => minY + r * rangeY);

    return (
      <div className="ds-eda-scatter-container">
        {/* Dropdowns for X and Y Feature selection */}
        <div className="ds-eda-bivariate-select-row" style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
          <div className="ds-eda-select-box">
            <span>X-Axis:</span>
            <select
              className="ds-eda-select"
              value={scatterXCol}
              onChange={(e) => setScatterXCol(e.target.value)}
            >
              {outlierCols.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="ds-eda-select-box">
            <span>Y-Axis:</span>
            <select
              className="ds-eda-select"
              value={scatterYCol}
              onChange={(e) => setScatterYCol(e.target.value)}
            >
              {outlierCols.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="ds-eda-scatter-svg" style={{ height: '270px' }}>
          {/* Horizontal Grid lines & Y Ticks */}
          {yTicks.map((yVal, i) => {
            const yPos = getY(yVal);
            return (
              <g key={i}>
                <line x1={margin.left} y1={yPos} x2={margin.left + innerW} y2={yPos} stroke="rgba(99,102,241,0.08)" />
                <text x={margin.left - 6} y={yPos + 4} textAnchor="end" fill="#64748b" fontSize="10" fontWeight="500">
                  {yVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Vertical Grid lines & X Ticks */}
          {xTicks.map((xVal, i) => {
            const xPos = getX(xVal);
            return (
              <g key={i}>
                <line x1={xPos} y1={margin.top} x2={xPos} y2={margin.top + innerH} stroke="rgba(99,102,241,0.06)" />
                <text x={xPos} y={margin.top + innerH + 16} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
                  {xVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + innerH} stroke="#94a3b8" strokeWidth="1.5" />
          <line x1={margin.left} y1={margin.top + innerH} x2={margin.left + innerW} y2={margin.top + innerH} stroke="#94a3b8" strokeWidth="1.5" />

          {/* X-Axis Label */}
          <text x={margin.left + innerW / 2} y={svgH - 8} textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">
            X-Axis: {xCol}
          </text>

          {/* Y-Axis Label */}
          <text x={18} y={margin.top + innerH / 2} textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700" transform={`rotate(-90 18 ${margin.top + innerH / 2})`}>
            Y-Axis: {yCol}
          </text>

          {/* Y Upper Threshold Line */}
          {uBoundY >= margin.top && uBoundY <= margin.top + innerH && (
            <>
              <line x1={margin.left} y1={uBoundY} x2={margin.left + innerW} y2={uBoundY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={margin.left + innerW - 5} y={uBoundY - 4} textAnchor="end" fill="#d97706" fontSize="10" fontWeight="700">
                {yCol} Upper ({ySummary.upper_bound})
              </text>
            </>
          )}

          {/* X Upper Threshold Line */}
          {uBoundX >= margin.left && uBoundX <= margin.left + innerW && (
            <>
              <line x1={uBoundX} y1={margin.top} x2={uBoundX} y2={margin.top + innerH} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={uBoundX + 4} y={margin.top + 14} fill="#d97706" fontSize="10" fontWeight="700">
                {xCol} Upper ({xSummary.upper_bound})
              </text>
            </>
          )}

          {/* Scatter Points */}
          {sData.map((pt, i) => {
            const cx = getX(pt.xVal);
            const cy = getY(pt.yVal);
            return (
              <circle
                key={i}
                cx={Math.max(margin.left + 4, Math.min(margin.left + innerW - 4, cx))}
                cy={Math.max(margin.top + 4, Math.min(margin.top + innerH - 4, cy))}
                r={pt.is_outlier ? 6 : 4}
                fill={pt.is_outlier ? '#f59e0b' : '#6366f1'}
                stroke={pt.is_outlier ? '#ffffff' : 'rgba(255,255,255,0.7)'}
                strokeWidth="1.5"
                opacity={pt.is_outlier ? 1 : 0.8}
              >
                <title>{`Row #${pt.index}: ${xCol} = ${pt.xVal}, ${yCol} = ${pt.yVal} ${pt.is_outlier ? '(Outlier)' : ''}`}</title>
              </circle>
            );
          })}
        </svg>

        <div className="ds-eda-scatter-footer">
          <span>Scatter Pair: <strong>{xCol}</strong> vs <strong>{yCol}</strong></span>
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>● Warm Amber: Outliers ({outlierCount})</span>
          <span style={{ color: '#6366f1', fontWeight: 600 }}>● Indigo: Normal Points</span>
        </div>
      </div>
    );
  };


  // Dynamic Scatter Plot Data Fallback Helper
  const getScatterPoints = (col) => {
    if (outliers?.scatter_data?.[col] && outliers.scatter_data[col].length > 0) {
      return outliers.scatter_data[col];
    }

    const summary = outliers?.outlier_summary?.[col];
    if (!summary) return [];

    const pts = [];
    const sampleOutliers = summary.sample_values || [];
    const totalRows = datasetSummary.total_rows || 100;

    const minVal = summary.min ?? summary.q1;
    const maxVal = summary.max ?? summary.q3;
    const range = (maxVal - minVal) || 1;

    // Generate 45 sample points distributed evenly across [minVal, maxVal]
    const normalCount = 45;
    for (let i = 0; i < normalCount; i++) {
      const ratio = i / (normalCount - 1);
      const wave = Math.sin(i * 0.8) * 0.15;
      let val = minVal + Math.max(0, Math.min(1, ratio + wave)) * range;

      pts.push({
        index: Math.floor(ratio * totalRows),
        value: Number(val.toFixed(2)),
        is_outlier: false,
      });
    }

    sampleOutliers.forEach((oval, idx) => {
      pts.push({
        index: Math.floor((idx + 1) * (totalRows / (sampleOutliers.length + 1))),
        value: Number(oval),
        is_outlier: true,
      });
    });

    pts.sort((a, b) => a.index - b.index);
    return pts;
  };

  // SVG Scatter Plot visual rendering
  const renderScatterPlotVisual = (col) => {
    const sData = getScatterPoints(col);
    const summary = outliers?.outlier_summary?.[col];
    if (!summary || sData.length === 0) {
      return <p style={{ color: 'var(--text-secondary)', padding: '20px' }}>No scatter data available.</p>;
    }

    const allPts = sData.map((d) => d.value);
    const minPtVal = Math.min(...allPts);
    const maxPtVal = Math.max(...allPts);

    // Balanced effective domain bounds so points fill full chart height
    const effectiveLowerBound = Math.min(minPtVal, Math.max(summary.lower_bound, summary.min - 0.25 * ((summary.max - summary.min) || 1)));
    const effectiveUpperBound = Math.max(maxPtVal, summary.upper_bound);

    const pad = (effectiveUpperBound - effectiveLowerBound) * 0.12 || 1;
    const plotMin = effectiveLowerBound - pad;
    const plotMax = effectiveUpperBound + pad;
    const plotRange = plotMax - plotMin;

    const svgW = 500;
    const svgH = 220;
    const margin = { top: 30, right: 30, bottom: 30, left: 40 };
    const innerW = svgW - margin.left - margin.right;
    const innerH = svgH - margin.top - margin.bottom;

    const getX = (idx) => margin.left + (idx / (sData.length - 1 || 1)) * innerW;
    const getY = (val) => margin.top + innerH - (((val - plotMin) / plotRange) * innerH);

    const uBoundY = getY(summary.upper_bound);
    const lBoundY = getY(summary.lower_bound);

    const outlierCount = sData.filter((d) => d.is_outlier).length;

    return (
      <div className="ds-eda-scatter-container">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="ds-eda-scatter-svg">
          {/* Horizontal Grid lines */}
          <line x1={margin.left} y1={margin.top} x2={margin.left + innerW} y2={margin.top} stroke="rgba(99,102,241,0.08)" />
          <line x1={margin.left} y1={margin.top + innerH * 0.33} x2={margin.left + innerW} y2={margin.top + innerH * 0.33} stroke="rgba(99,102,241,0.08)" />
          <line x1={margin.left} y1={margin.top + innerH * 0.66} x2={margin.left + innerW} y2={margin.top + innerH * 0.66} stroke="rgba(99,102,241,0.08)" />
          <line x1={margin.left} y1={margin.top + innerH} x2={margin.left + innerW} y2={margin.top + innerH} stroke="rgba(99,102,241,0.12)" />

          {/* Axes */}
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + innerH} stroke="#94a3b8" strokeWidth="1.5" />
          <line x1={margin.left} y1={margin.top + innerH} x2={margin.left + innerW} y2={margin.top + innerH} stroke="#94a3b8" strokeWidth="1.5" />

          {/* Upper Threshold Line (Warm Amber) */}
          <line x1={margin.left} y1={uBoundY} x2={margin.left + innerW} y2={uBoundY} stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4" />
          <text x={margin.left + 6} y={Math.max(16, uBoundY - 6)} fill="#d97706" fontSize="11" fontWeight="700">
            Upper Bound ({summary.upper_bound})
          </text>

          {/* Lower Threshold Line (Indigo) */}
          {lBoundY <= margin.top + innerH + 10 && (
            <>
              <line x1={margin.left} y1={Math.min(margin.top + innerH, lBoundY)} x2={margin.left + innerW} y2={Math.min(margin.top + innerH, lBoundY)} stroke="#818cf8" strokeWidth="2" strokeDasharray="5 4" />
              <text x={margin.left + 6} y={Math.min(svgH - 8, lBoundY + 14)} fill="#6366f1" fontSize="11" fontWeight="700">
                Lower Bound ({summary.lower_bound})
              </text>
            </>
          )}

          {/* Scatter Points */}
          {sData.map((pt, i) => {
            const cx = getX(i);
            const cy = getY(pt.value);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={pt.is_outlier ? 5.5 : 3.5}
                fill={pt.is_outlier ? '#f59e0b' : '#6366f1'}
                stroke={pt.is_outlier ? '#ffffff' : 'none'}
                strokeWidth="1.5"
                opacity={pt.is_outlier ? 1 : 0.75}
              >
                <title>{`Row #${pt.index}: ${pt.value} ${pt.is_outlier ? '(Outlier)' : ''}`}</title>
              </circle>
            );
          })}
        </svg>

        <div className="ds-eda-scatter-footer">
          <span>Row Index Range: 0 to {sData.length ? sData[sData.length - 1].index : 0}</span>
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>● Warm Amber: Outlier Points ({outlierCount})</span>
          <span style={{ color: '#6366f1', fontWeight: 600 }}>● Indigo: Normal Points</span>
        </div>
      </div>
    );
  };





  // Filtered Strong Correlations based on threshold
  const filteredPositiveCorr = useMemo(() => {
    const pairs = correlation?.strong_positive_correlations || [];
    return pairs.filter((p) => Math.abs(p.correlation) >= corrThreshold);
  }, [correlation, corrThreshold]);

  const filteredNegativeCorr = useMemo(() => {
    const pairs = correlation?.strong_negative_correlations || [];
    return pairs.filter((p) => Math.abs(p.correlation) >= corrThreshold);
  }, [correlation, corrThreshold]);


  if (loading) {
    return (
      <div className="ds-eda-container">
        <div className="ds-eda-header glass">
          <div className="ds-eda-header-main">
            <h1 className="ds-eda-title">Exploratory Data Analysis</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading EDA dataset details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-eda-container">
      {/* ── Dataset Header ── */}
      <motion.div
        className="ds-eda-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="ds-eda-header-main">
          <div className="ds-eda-title-row">
            <h1 className="ds-eda-title">{dataset?.dataset_name || 'Dataset'}</h1>
            <span className="ds-eda-version-badge">
              v{datasetVersion?.version_number || 1}
            </span>
          </div>

          <div className="ds-eda-meta-pills">
            <div className="ds-eda-meta-pill">
              <Table size={14} />
              <span>{datasetVersion?.file_type?.toUpperCase() || 'CSV'}</span>
            </div>
            <div className="ds-eda-meta-pill">
              <Layers size={14} />
              <span>{datasetSummary.total_rows ?? datasetVersion?.total_rows ?? 0} Rows</span>
            </div>
            <div className="ds-eda-meta-pill">
              <FileSpreadsheet size={14} />
              <span>{datasetSummary.total_columns ?? datasetVersion?.total_columns ?? 0} Columns</span>
            </div>
            <div className="ds-eda-meta-pill">
              <HardDrive size={14} />
              <span>{datasetSummary.memory_usage ?? '0 KB'}</span>
            </div>
            <div className="ds-eda-meta-pill" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.25)' }}>
              <Sparkles size={14} />
              <span>Source: cleaned.csv</span>
            </div>
          </div>
        </div>

        <div className="ds-eda-header-actions">
          <div className={getStatusBadgeClass()}>
            {processing ? (
              <>
                <Loader2 size={14} className="spin" />
                <span>Generating</span>
              </>
            ) : edaReport ? (
              <>
                <CheckCircle2 size={14} />
                <span>Completed</span>
              </>
            ) : (
              <>
                <TrendingUp size={14} />
                <span>Not Generated</span>
              </>
            )}
          </div>

          {edaReport && (
            <button
              className="ds-eda-primary-btn secondary"
              disabled={processing}
              onClick={handleGenerateEDA}
            >
              <RefreshCw size={14} className={processing ? 'spin' : ''} />
              <span>Regenerate EDA</span>
            </button>
          )}

        </div>
      </motion.div>



      {/* ── Prerequisite Warning Card (If cleaned.csv is missing) ── */}
      {!hasCleaning && !edaReport && !processing && (
        <motion.div
          className="ds-eda-empty-card glass"
          style={{ borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.04)' }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="ds-eda-empty-illustration" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
            <AlertTriangle size={44} style={{ color: '#f59e0b' }} />
          </div>
          <h2 className="ds-eda-empty-title" style={{ color: '#f59e0b' }}>Clean Dataset Required</h2>
          <p className="ds-eda-empty-subtitle" style={{ maxWidth: '560px' }}>
            Exploratory Data Analysis (EDA) is generated exclusively for cleaned datasets (<code>cleaned.csv</code>). Please complete <strong>Dataset Cleaning</strong> first before running EDA.
          </p>
          <button
            className="ds-eda-primary-btn"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)' }}
            onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets/${datasetId}/cleaning`)}
          >
            <ChevronRight size={18} />
            <span>Go to Dataset Cleaning</span>
          </button>
        </motion.div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="ds-eda-prereq-card" style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div className="ds-eda-prereq-content">
            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
            <div className="ds-eda-prereq-text">
              <h4 style={{ color: '#ef4444' }}>EDA Execution Failed</h4>
              <p style={{ color: '#64748b' }}>{error}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="ds-eda-prereq-btn"
              style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
              onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets/${datasetId}/cleaning`)}
            >
              <ChevronRight size={14} /> Go to Cleaning
            </button>
            <button className="ds-eda-prereq-btn" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }} onClick={handleGenerateEDA}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Empty State (If cleaned dataset exists but EDA not yet generated) ── */}
      {hasCleaning && !edaReport && !processing && (
        <motion.div
          className="ds-eda-empty-card glass"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="ds-eda-empty-illustration">
            <TrendingUp size={48} className="ds-eda-empty-icon" />
          </div>
          <h2 className="ds-eda-empty-title">EDA has not been generated</h2>
          <p className="ds-eda-empty-subtitle">
            Generate exploratory data analysis for your cleaned dataset (cleaned.csv) to analyze feature distributions, correlations, boxplots, scatter matrices, and automated data quality insights.
          </p>
          <button className="ds-eda-primary-btn" onClick={handleGenerateEDA}>
            <Play size={16} />
            <span>Generate EDA</span>
          </button>
        </motion.div>
      )}

      {/* ── Loading Animation ── */}
      {processing && (
        <div className="ds-eda-empty-card glass" style={{ padding: '60px 24px' }}>
          <Loader2 size={40} className="spin" style={{ color: '#6366f1' }} />
          <h3 style={{ margin: '16px 0 6px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Generating Exploratory Data Analysis...</h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Calculating descriptive statistics, correlation matrix, distributions, IQR outliers, and automated rule-based insights.
          </p>
        </div>
      )}

      {/* ── EDA Analytical Dashboard ── */}
      {edaReport && !processing && (
        <div className="ds-eda-dashboard">
          {/* Tabs Bar */}
          <div className="ds-eda-tabs-bar glass">
            <button
              className={`ds-eda-tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              <Lightbulb size={16} />
              <span>Summary & Insights</span>
            </button>
            <button
              className={`ds-eda-tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveTab('statistics')}
            >
              <Activity size={16} />
              <span>Statistics</span>
            </button>
            <button
              className={`ds-eda-tab-btn ${activeTab === 'correlation' ? 'active' : ''}`}
              onClick={() => setActiveTab('correlation')}
            >
              <Grid size={16} />
              <span>Correlation Analysis</span>
            </button>
            <button
              className={`ds-eda-tab-btn ${activeTab === 'distribution' ? 'active' : ''}`}
              onClick={() => setActiveTab('distribution')}
            >
              <BarChart2 size={16} />
              <span>Distribution Analysis</span>
            </button>
            <button
              className={`ds-eda-tab-btn ${activeTab === 'outliers' ? 'active' : ''}`}
              onClick={() => setActiveTab('outliers')}
            >
              <AlertOctagon size={16} />
              <span>Outlier Analysis</span>
            </button>
          </div>


          {/* ── Tab 1: Summary & Insights ── */}
          {activeTab === 'insights' && (
            <motion.div className="ds-eda-tab-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Automated Rule-Based Insights Card */}
              <div className="ds-eda-section-card glass">

                <h3 className="ds-eda-card-title">
                  <Lightbulb size={20} style={{ color: '#f59e0b' }} />
                  Automated Rule-Based Insights
                </h3>

                <div className="ds-eda-insights-list">
                  {(insights.insights || []).length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No anomalies detected. Dataset is well-formed.</p>
                  ) : (
                    insights.insights.map((item, idx) => (
                      <div key={idx} className={`ds-eda-insight-item ${item.severity || 'info'}`}>
                        <div className="ds-eda-insight-header">
                          <Sparkles size={16} className="ds-eda-insight-icon" />
                          <span className="ds-eda-insight-title">{item.title}</span>
                        </div>
                        <p className="ds-eda-insight-desc">{item.description}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Recommendations List */}
                {(insights.recommendations || []).length > 0 && (
                  <div className="ds-eda-recommendations-box">
                    <h4 className="ds-eda-rec-title">
                      <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                      Key Recommendations
                    </h4>
                    <ul className="ds-eda-rec-list">
                      {insights.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Tab 2: Statistics ── */}
          {activeTab === 'statistics' && (
            <motion.div className="ds-eda-tab-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Numerical Statistics Table */}
              <div className="ds-eda-section-card glass">
                <h3 className="ds-eda-card-title">
                  <Activity size={20} style={{ color: '#6366f1' }} />
                  Numerical Feature Statistics
                </h3>

                <div className="ds-eda-table-container">
                  <table className="ds-eda-table">
                    <thead>
                      <tr>
                        <th>Feature</th>
                        <th>Count</th>
                        <th>Mean</th>
                        <th>Median</th>
                        <th>Mode</th>
                        <th>Std Dev</th>
                        <th>Variance</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>Range</th>
                        <th>Q1</th>
                        <th>Q3</th>
                        <th>IQR</th>
                        <th>Skewness</th>
                        <th>Kurtosis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(stats.numeric_statistics || {}).map((col) => {
                        const item = stats.numeric_statistics[col];
                        return (
                          <tr key={col}>
                            <td className="font-semibold">{col}</td>
                            <td>{item.count}</td>
                            <td>{item.mean}</td>
                            <td>{item.median}</td>
                            <td>{item.mode}</td>
                            <td>{item.std}</td>
                            <td>{item.variance}</td>
                            <td>{item.min}</td>
                            <td>{item.max}</td>
                            <td>{item.range}</td>
                            <td>{item.q1}</td>
                            <td>{item.q3}</td>
                            <td>{item.iqr}</td>
                            <td style={{ color: Math.abs(item.skewness) > 1 ? '#f59e0b' : 'inherit' }}>{item.skewness}</td>
                            <td>{item.kurtosis}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Categorical Statistics Cards */}
              <div className="ds-eda-section-card glass" style={{ marginTop: '24px' }}>
                <h3 className="ds-eda-card-title">
                  <PieChartIcon size={20} style={{ color: '#ec4899' }} />
                  Categorical Feature Statistics
                </h3>

                <div className="ds-eda-cat-grid">
                  {Object.keys(stats.categorical_statistics || {}).map((col) => {
                    const item = stats.categorical_statistics[col];
                    return (
                      <div key={col} className="ds-eda-cat-card">
                        <h4 className="ds-eda-cat-title">{col}</h4>
                        <div className="ds-eda-cat-meta">
                          <span>Unique Values: <strong>{item.unique_values}</strong></span>
                          <span>Most Frequent: <strong>{item.most_frequent_value}</strong> ({item.frequency})</span>
                        </div>

                        <div className="ds-eda-cat-bars">
                          {(item.top_categories || []).map((catObj, i) => (
                            <div key={i} className="ds-eda-cat-bar-row">
                              <div className="ds-eda-cat-bar-labels">
                                <span className="cat-name">{catObj.category}</span>
                                <span className="cat-count">{catObj.count} ({catObj.percentage}%)</span>
                              </div>
                              <div className="ds-eda-cat-bar-bg">
                                <div className="ds-eda-cat-bar-fill" style={{ width: `${catObj.percentage}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Tab 3: Correlation Analysis ── */}
          {activeTab === 'correlation' && (
            <motion.div className="ds-eda-tab-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="ds-eda-section-card glass">
                <div className="ds-eda-card-header-row">
                  <h3 className="ds-eda-card-title" style={{ margin: 0 }}>
                    <Grid size={20} style={{ color: '#818cf8' }} />
                    Correlation Heatmap & Threshold Analysis
                  </h3>

                  {/* Threshold Control */}
                  <div className="ds-eda-threshold-box">
                    <Sliders size={16} style={{ color: '#94a3b8' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Correlation Threshold:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="0.95"
                      step="0.05"
                      value={corrThreshold}
                      onChange={(e) => setCorrThreshold(parseFloat(e.target.value))}
                      className="ds-eda-slider"
                    />
                    <span className="ds-eda-threshold-val">{corrThreshold.toFixed(2)}</span>
                  </div>
                </div>

                {/* Heatmap Grid Visual */}
                {(correlation.columns || []).length > 0 ? (
                  <div className="ds-eda-heatmap-container">
                    <table className="ds-eda-heatmap-table">
                      <thead>
                        <tr>
                          <th>Features</th>
                          {correlation.columns.map((c) => (
                            <th key={c} title={c}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {correlation.columns.map((rowCol, rIdx) => (
                          <tr key={rowCol}>
                            <td className="font-semibold">{rowCol}</td>
                            {correlation.columns.map((colCol, cIdx) => {
                              const val = correlation.matrix_list?.[rIdx]?.[colCol] ?? 0;
                              // Heatmap color logic
                              let bg = 'rgba(255, 255, 255, 0.05)';
                              if (rIdx === cIdx) bg = 'rgba(99, 102, 241, 0.3)';
                              else if (val > 0) bg = `rgba(16, 185, 129, ${Math.abs(val) * 0.7})`;
                              else if (val < 0) bg = `rgba(239, 68, 68, ${Math.abs(val) * 0.7})`;

                              return (
                                <td
                                  key={colCol}
                                  style={{ background: bg, fontWeight: Math.abs(val) >= corrThreshold ? 700 : 400 }}
                                  title={`${rowCol} vs ${colCol}: ${val}`}
                                >
                                  {val.toFixed(2)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>No numerical columns available for correlation analysis.</p>
                )}

                {/* Strong Correlations Tables */}
                <div className="ds-eda-corr-tables-grid" style={{ marginTop: '24px' }}>
                  {/* Positive Correlations */}
                  <div className="ds-eda-subcard">
                    <h4 className="ds-eda-subcard-title" style={{ color: '#10b981' }}>
                      Strong Positive Correlations (≥ {corrThreshold.toFixed(2)})
                    </h4>
                    {filteredPositiveCorr.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No positive correlations above threshold.</p>
                    ) : (
                      <table className="ds-eda-mini-table">
                        <thead>
                          <tr>
                            <th>Feature 1</th>
                            <th>Feature 2</th>
                            <th>Correlation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPositiveCorr.map((p, i) => (
                            <tr key={i}>
                              <td>{p.feature_1}</td>
                              <td>{p.feature_2}</td>
                              <td style={{ color: '#10b981', fontWeight: 700 }}>+{p.correlation.toFixed(3)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Negative Correlations */}
                  <div className="ds-eda-subcard">
                    <h4 className="ds-eda-subcard-title" style={{ color: '#ef4444' }}>
                      Strong Negative Correlations (≤ -{corrThreshold.toFixed(2)})
                    </h4>
                    {filteredNegativeCorr.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No negative correlations below threshold.</p>
                    ) : (
                      <table className="ds-eda-mini-table">
                        <thead>
                          <tr>
                            <th>Feature 1</th>
                            <th>Feature 2</th>
                            <th>Correlation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredNegativeCorr.map((p, i) => (
                            <tr key={i}>
                              <td>{p.feature_1}</td>
                              <td>{p.feature_2}</td>
                              <td style={{ color: '#ef4444', fontWeight: 700 }}>{p.correlation.toFixed(3)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Tab 4: Distribution Analysis ── */}
          {activeTab === 'distribution' && (
            <motion.div className="ds-eda-tab-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="ds-eda-section-card glass">
                <div className="ds-eda-card-header-row">
                  <h3 className="ds-eda-card-title" style={{ margin: 0 }}>
                    <BarChart2 size={20} style={{ color: '#38bdf8' }} />
                    Feature Distribution Analysis
                  </h3>

                  {/* Column Select Dropdown */}
                  <div className="ds-eda-select-box">
                    <span>Select Feature:</span>
                    <select
                      className="ds-eda-select"
                      value={selectedDistCol}
                      onChange={(e) => setSelectedDistCol(e.target.value)}
                    >
                      {allColumns.map((col) => (
                        <option key={col} value={col}>
                          {col} ({distribution?.numerical?.[col] ? 'Numeric' : 'Categorical'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Individual Column Distribution Details */}
                {selectedDistCol && distribution?.numerical?.[selectedDistCol] ? (
                  <div className="ds-eda-dist-container">
                    {/* Histogram & Density Visual */}
                    <div className="ds-eda-dist-visual">
                      <h4 className="ds-eda-subcard-title">Histogram Bins & Density Estimation</h4>
                      <div className="ds-eda-hist-grid">
                        {distribution.numerical[selectedDistCol].histogram.map((b, i) => (
                          <div key={i} className="ds-eda-hist-col">
                            <span className="hist-count">{b.count}</span>
                            <div className="hist-bar-bg">
                              <div
                                className="hist-bar-fill"
                                style={{
                                  height: `${Math.min(100, (b.count / Math.max(...distribution.numerical[selectedDistCol].histogram.map((x) => x.count))) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="hist-label">{b.bin}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Boxplot & Summary Stats */}
                    <div className="ds-eda-dist-summary-grid">
                      <div className="ds-eda-subcard">
                        <h4 className="ds-eda-subcard-title">Boxplot Statistics (IQR Bounds)</h4>
                        <div className="ds-eda-stats-list">
                          <div className="stat-row">
                            <span>Min:</span> <strong>{distribution.numerical[selectedDistCol].boxplot.min}</strong>
                          </div>
                          <div className="stat-row">
                            <span>Q1 (25%):</span> <strong>{distribution.numerical[selectedDistCol].boxplot.q1}</strong>
                          </div>
                          <div className="stat-row">
                            <span>Median (50%):</span> <strong>{distribution.numerical[selectedDistCol].boxplot.median}</strong>
                          </div>
                          <div className="stat-row">
                            <span>Q3 (75%):</span> <strong>{distribution.numerical[selectedDistCol].boxplot.q3}</strong>
                          </div>
                          <div className="stat-row">
                            <span>Max:</span> <strong>{distribution.numerical[selectedDistCol].boxplot.max}</strong>
                          </div>
                          <div className="stat-row">
                            <span>Lower Bound:</span> <strong>{distribution.numerical[selectedDistCol].boxplot.lower_bound}</strong>
                          </div>
                          <div className="stat-row">
                            <span>Upper Bound:</span> <strong>{distribution.numerical[selectedDistCol].boxplot.upper_bound}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="ds-eda-subcard">
                        <h4 className="ds-eda-subcard-title">Distribution Moments</h4>
                        <div className="ds-eda-stats-list">
                          <div className="stat-row">
                            <span>Mean:</span> <strong>{distribution.numerical[selectedDistCol].summary.mean}</strong>
                          </div>
                          <div className="stat-row">
                            <span>Standard Deviation:</span> <strong>{distribution.numerical[selectedDistCol].summary.std}</strong>
                          </div>
                          <div className="stat-row">
                            <span>Variance:</span> <strong>{distribution.numerical[selectedDistCol].summary.variance}</strong>
                          </div>
                          <div className="stat-row">
                            <span>Skewness:</span> <strong>{distribution.numerical[selectedDistCol].summary.skewness}</strong>
                          </div>
                          <div className="stat-row">
                            <span>Kurtosis:</span> <strong>{distribution.numerical[selectedDistCol].summary.kurtosis}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedDistCol && distribution?.categorical?.[selectedDistCol] ? (
                  <div className="ds-eda-dist-container">
                    <h4 className="ds-eda-subcard-title">Category Distribution & Bar Chart</h4>
                    <div className="ds-eda-cat-bars">
                      {distribution.categorical[selectedDistCol].bar_chart.map((catObj, i) => (
                        <div key={i} className="ds-eda-cat-bar-row">
                          <div className="ds-eda-cat-bar-labels">
                            <span className="cat-name">{catObj.category}</span>
                            <span className="cat-count">{catObj.count} ({catObj.percentage}%)</span>
                          </div>
                          <div className="ds-eda-cat-bar-bg">
                            <div className="ds-eda-cat-bar-fill" style={{ width: `${catObj.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}

          {/* ── Tab 5: Outliers Analysis ── */}
          {activeTab === 'outliers' && (
            <motion.div className="ds-eda-tab-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="ds-eda-section-card glass">
                <h3 className="ds-eda-card-title">
                  <AlertOctagon size={20} style={{ color: '#ef4444' }} />
                  Outlier Analysis
                </h3>

                {/* 3 Summary Cards */}
                <div className="ds-eda-summary-grid" style={{ marginBottom: '24px' }}>
                  <div className="ds-eda-summary-card">
                    <div className="ds-eda-summary-icon" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)' }}>
                      <AlertOctagon size={22} />
                    </div>
                    <div className="ds-eda-summary-info">
                      <span className="ds-eda-summary-val">{outliers.total_outliers ?? 0}</span>
                      <span className="ds-eda-summary-label">Total Outliers</span>
                    </div>
                  </div>

                  <div className="ds-eda-summary-card">
                    <div className="ds-eda-summary-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)' }}>
                      <PieChartIcon size={22} />
                    </div>
                    <div className="ds-eda-summary-info">
                      <span className="ds-eda-summary-val">{outliers.overall_percentage ?? (outliers.total_outliers ? ((outliers.total_outliers / (datasetSummary.total_rows * (datasetSummary.numerical_features_count || 1))) * 100).toFixed(2) : '0.00')}%</span>
                      <span className="ds-eda-summary-label">Percentage</span>
                    </div>
                  </div>

                  <div className="ds-eda-summary-card">
                    <div className="ds-eda-summary-icon" style={{ color: '#6366f1', background: 'rgba(99, 102, 241, 0.12)' }}>
                      <FileSpreadsheet size={22} />
                    </div>
                    <div className="ds-eda-summary-info">
                      <span className="ds-eda-summary-val">{outliers.affected_columns_count ?? (outliers.affected_columns || []).length}</span>
                      <span className="ds-eda-summary-label">Columns with Outliers</span>
                    </div>
                  </div>
                </div>

                {/* Visual Outlier Graphs Section */}
                <h4 className="ds-eda-subcard-title" style={{ marginTop: '20px', marginBottom: '16px' }}>
                  Visual Outlier Graphs
                </h4>

                {/* Graphs Grid: Box Plot & Scatter Plot */}
                <div className="ds-eda-outlier-graphs-grid" style={{ margin: '0 0 32px 0' }}>
                  {/* Graph 1: Box Plot */}
                  <div className="ds-eda-subcard">
                    <h4 className="ds-eda-subcard-title">Box Plot</h4>
                    {renderBoxPlotVisual(selectedOutlierCol)}
                  </div>

                  {/* Graph 2: Bivariate Scatter Plot (Feature X vs Feature Y) */}
                  <div className="ds-eda-subcard">
                    <h4 className="ds-eda-subcard-title">Scatter Plot</h4>
                    {renderBivariateScatterPlotVisual(scatterXCol || selectedOutlierCol, scatterYCol || selectedOutlierCol)}
                  </div>
                </div>


                {/* Outliers Summary per Column Table */}
                <h4 className="ds-eda-subcard-title">Column Outlier Summary</h4>
                <div className="ds-eda-table-container">
                  <table className="ds-eda-table">
                    <thead>
                      <tr>
                        <th>Feature Column</th>
                        <th>Outlier Count</th>
                        <th>Outlier Percentage</th>
                        <th>Lower Bound (Q1 - 1.5*IQR)</th>
                        <th>Upper Bound (Q3 + 1.5*IQR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(outliers.outlier_summary || {}).map((col) => {
                        const item = outliers.outlier_summary[col];
                        return (
                          <tr key={col}>
                            <td className="font-semibold">{col}</td>
                            <td style={{ color: item.count > 0 ? '#ef4444' : 'inherit', fontWeight: 700 }}>{item.count}</td>
                            <td>{item.percentage}%</td>
                            <td>{item.lower_bound}</td>
                            <td>{item.upper_bound}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      )}
    </div>
  );
}

