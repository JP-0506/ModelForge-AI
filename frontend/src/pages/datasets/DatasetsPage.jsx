/* ============================================================
   DatasetsPage — Dataset list for a specific Project
   Features: Search, File Type filter, Sort, Upload, Rename, Delete
   ============================================================ */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Search,
  Database,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import useDatasets from '../../hooks/useDatasets';
import datasetService from '../../services/datasetService';
import DatasetCard from './components/DatasetCard/DatasetCard';
import DatasetUploadModal from './components/DatasetUploadModal/DatasetUploadModal';
import DatasetUpdateModal from './components/DatasetUpdateModal/DatasetUpdateModal';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import Button from '../../components/common/Button/Button';
import './DatasetsPage.css';

const FILE_TYPE_FILTERS = [
  { label: 'All',  value: 'all'  },
  { label: 'CSV',  value: 'csv'  },
  { label: 'XLSX', value: 'xlsx' },
  { label: 'XLS',  value: 'xls'  },
  { label: 'JSON', value: 'json' },
];

const SORT_OPTIONS = [
  { label: 'Newest First',            value: 'newest'     },
  { label: 'Oldest First',            value: 'oldest'     },
  { label: 'Dataset Name (A–Z)',       value: 'name_asc'   },
  { label: 'Dataset Name (Z–A)',       value: 'name_desc'  },
  { label: 'File Size (Largest First)',value: 'size_desc'  },
  { label: 'File Size (Smallest First)',value: 'size_asc'  },
];

const sortDatasets = (datasets, sortKey) => {
  const arr = [...datasets];
  switch (sortKey) {
    case 'newest':    return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    case 'oldest':    return arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    case 'name_asc':  return arr.sort((a, b) => (a.dataset_name || '').localeCompare(b.dataset_name || ''));
    case 'name_desc': return arr.sort((a, b) => (b.dataset_name || '').localeCompare(a.dataset_name || ''));
    case 'size_desc': return arr.sort((a, b) => ((b.file_size ?? b.latest_version?.file_size ?? 0) - (a.file_size ?? a.latest_version?.file_size ?? 0)));
    case 'size_asc':  return arr.sort((a, b) => ((a.file_size ?? a.latest_version?.file_size ?? 0) - (b.file_size ?? b.latest_version?.file_size ?? 0)));
    default:          return arr;
  }
};

const DatasetsPage = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  const { datasets, isLoading, error, refresh } = useDatasets(projectId);

  // UI State
  const [showUpload, setShowUpload]           = useState(false);
  const [updateTarget, setUpdateTarget]       = useState(null);
  const [isSavingUpdate, setIsSavingUpdate]   = useState(false);
  const [deleteTarget, setDeleteTarget]       = useState(null);
  const [isDeleting, setIsDeleting]           = useState(false);
  const [searchQuery, setSearchQuery]         = useState('');
  const [fileTypeFilter, setFileTypeFilter]   = useState('all');
  const [sortKey, setSortKey]                 = useState('newest');
  const [sortDropOpen, setSortDropOpen]       = useState(false);

  // ── Filtering & Sorting ──────────────────────────────────────
  const filtered = useMemo(() => {
    let list = datasets;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          (d.dataset_name || '').toLowerCase().includes(q) ||
          (d.original_file_name || d.latest_version?.original_file_name || '').toLowerCase().includes(q)
      );
    }

    // File type
    if (fileTypeFilter !== 'all') {
      list = list.filter((d) => {
        const rawType = d.file_type || d.latest_version?.file_type || '';
        const rawName = d.original_file_name || d.latest_version?.original_file_name || '';
        const ft = datasetService.parseFileType(rawType, rawName);
        return ft === fileTypeFilter;
      });
    }

    return sortDatasets(list, sortKey);
  }, [datasets, searchQuery, fileTypeFilter, sortKey]);

  // ── Handlers ────────────────────────────────────────────────
  const handleUploadSuccess = (created) => {
    refresh();
    navigate(`/workspaces/${workspaceId}/projects/${projectId}/datasets/${created._id}`);
  };

  const handleUpdate = async (body) => {
    if (!updateTarget) return;
    setIsSavingUpdate(true);
    try {
      await datasetService.update(updateTarget._id, body);
      refresh();
      setUpdateTarget(null);
    } catch (err) {
      console.error('Failed to update dataset:', err);
    } finally {
      setIsSavingUpdate(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await datasetService.delete(deleteTarget._id);
      refresh();
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete dataset:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)?.label || 'Sort';

  // ── Skeleton ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="ds-page">
        <div className="ds-page-toolbar">
          <div className="ds-page-toolbar-left">
            <div className="ds-skeleton ds-skeleton--title" />
            <div className="ds-skeleton ds-skeleton--subtitle" />
          </div>
        </div>
        <div className="ds-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ds-skeleton ds-skeleton--card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ds-page">
      {/* ── Toolbar ── */}
      <div className="ds-page-toolbar">
        <div className="ds-page-toolbar-left">
          <h1 className="ds-page-title">Datasets</h1>
          <p className="ds-page-subtitle">
            {datasets.length === 0
              ? 'No datasets yet. Upload your first file to get started.'
              : `${datasets.length} dataset${datasets.length !== 1 ? 's' : ''} in this project`}
          </p>
        </div>
        <div className="ds-page-toolbar-right">
          <button className="ds-icon-btn" onClick={refresh} title="Refresh">
            <RefreshCw size={16} strokeWidth={1.5} />
          </button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<UploadCloud size={16} />}
            onClick={() => setShowUpload(true)}
          >
            Upload Dataset
          </Button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="ds-page-error">
          <span>{error}</span>
          <button onClick={refresh} className="ds-error-retry">Retry</button>
        </div>
      )}

      {/* ── Controls: Search + Filter + Sort ── */}
      {datasets.length > 0 && (
        <div className="ds-controls">
          {/* Search */}
          <div className="ds-search-wrap">
            <Search size={15} strokeWidth={1.5} className="ds-search-icon" />
            <input
              type="text"
              className="ds-search"
              placeholder="Search datasets…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* File type tabs */}
          <div className="ds-filter-tabs">
            {FILE_TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`ds-filter-tab ${fileTypeFilter === f.value ? 'ds-filter-tab--active' : ''}`}
                onClick={() => setFileTypeFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="ds-sort-wrap">
            <button
              className="ds-sort-btn"
              onClick={() => setSortDropOpen((p) => !p)}
            >
              <SlidersHorizontal size={14} strokeWidth={1.5} />
              <span>{currentSortLabel}</span>
              <ChevronDown size={14} strokeWidth={2} className={`ds-sort-chevron ${sortDropOpen ? 'ds-sort-chevron--open' : ''}`} />
            </button>
            <AnimatePresence>
              {sortDropOpen && (
                <motion.div
                  className="ds-sort-menu glass"
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`ds-sort-option ${sortKey === opt.value ? 'ds-sort-option--active' : ''}`}
                      onClick={() => { setSortKey(opt.value); setSortDropOpen(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {datasets.length === 0 ? (
        /* Empty State */
        <motion.div
          className="ds-empty glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="ds-empty-icon">
            <Database size={32} strokeWidth={1.5} />
          </div>
          <h2 className="ds-empty-title">No datasets yet</h2>
          <p className="ds-empty-text">
            Upload your first CSV, Excel, or JSON dataset to begin profiling, cleaning, and training models.
          </p>
          <Button
            variant="primary"
            size="md"
            leftIcon={<UploadCloud size={16} />}
            onClick={() => setShowUpload(true)}
          >
            Upload Dataset
          </Button>
        </motion.div>
      ) : filtered.length === 0 ? (
        /* No search results */
        <div className="ds-no-results">
          <p>No datasets match your search or filter.</p>
          <button className="ds-clear-btn" onClick={() => { setSearchQuery(''); setFileTypeFilter('all'); }}>
            Clear filters
          </button>
        </div>
      ) : (
        /* Card Grid */
        <div className="ds-grid">
          <AnimatePresence>
            {filtered.map((dataset, idx) => (
              <motion.div
                key={dataset._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22, delay: idx * 0.04 }}
              >
                <DatasetCard
                  dataset={dataset}
                  onUpdate={(ds) => setUpdateTarget(ds)}
                  onDelete={(ds) => setDeleteTarget(ds)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Upload Modal ── */}
      <DatasetUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        projectId={projectId}
        onSuccess={handleUploadSuccess}
      />

      {/* ── Update (Rename) Modal ── */}
      <DatasetUpdateModal
        isOpen={!!updateTarget}
        onClose={() => setUpdateTarget(null)}
        dataset={updateTarget}
        onSave={handleUpdate}
        isSaving={isSavingUpdate}
      />

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete dataset?"
        message={`Are you sure you want to delete "${deleteTarget?.dataset_name}"? This action cannot be undone and will remove all associated data.`}
        confirmLabel="Delete Dataset"
      />
    </div>
  );
};

export default DatasetsPage;
