/* ============================================================
   App Routes — All routes registered here
   ============================================================ */

import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import WorkspaceLayout from '../layouts/WorkspaceLayout';
import ProjectLayout from '../layouts/ProjectLayout';
import DatasetLayout from '../layouts/DatasetLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Pages
import LandingPage from '../pages/landing/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import WorkspacesPage from '../pages/workspaces/WorkspacesPage';
import WorkspaceOverview from '../pages/workspaces/WorkspaceOverview';
import WorkspaceSettings from '../pages/workspaces/WorkspaceSettings';
import ProjectsPage from '../pages/projects/ProjectsPage';
import ProjectOverview from '../pages/projects/ProjectOverview';
import ProjectSettings from '../pages/projects/ProjectSettings';
import DatasetsPage from '../pages/datasets/DatasetsPage';
import DatasetOverview from '../pages/datasets/DatasetOverview';
import DatasetValidation from '../pages/datasets/DatasetValidation';
import DatasetProfiling from '../pages/datasets/DatasetProfiling';
import DatasetCleaning from '../pages/datasets/DatasetCleaning';
import DatasetFeatureEngineering from '../pages/datasets/DatasetFeatureEngineering';
import DatasetEDA from '../pages/datasets/DatasetEDA';
import DatasetModelTraining from '../pages/datasets/DatasetModelTraining';
import DatasetCompareModels from '../pages/datasets/DatasetCompareModels';
import DatasetModelDeployment from '../pages/datasets/DatasetModelDeployment';
import DatasetPrediction from '../pages/datasets/DatasetPrediction';
import DatasetSettings from '../pages/datasets/DatasetSettings';
import UserProfile from '../pages/profile/UserProfile';
import NotFound from '../pages/error/NotFound';

// Placeholder stubs for future phases (prevent 404 crashes)
const ComingSoon = ({ name }) => (
  <div style={{ padding: 40, textAlign: 'center' }}>
    <h2>{name} Module</h2>
    <p style={{ color: 'var(--text-secondary)' }}>This module will be built in an upcoming phase.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Public Routes ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      </Route>

      {/* ── Level 1 Protected Routes (Main Sidebar) ── */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workspaces" element={<WorkspacesPage />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      {/* ── Level 2 Protected Workspace Routes (Workspace Sidebar) ── */}
      <Route element={<ProtectedRoute><WorkspaceLayout /></ProtectedRoute>}>
        <Route path="/workspaces/:workspaceId" element={<WorkspaceOverview />} />
        <Route path="/workspaces/:workspaceId/projects" element={<ProjectsPage />} />
        <Route path="/workspaces/:workspaceId/settings" element={<WorkspaceSettings />} />
      </Route>

      {/* ── Level 3 Protected Project Routes (Project Sidebar) ── */}
      <Route element={<ProtectedRoute><ProjectLayout /></ProtectedRoute>}>
        <Route path="/workspaces/:workspaceId/projects/:projectId" element={<ProjectOverview />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId/datasets" element={<DatasetsPage />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId/settings" element={<ProjectSettings />} />
      </Route>

      {/* ── Level 4 Protected Dataset Routes (Dataset Sidebar) ── */}
      <Route element={<ProtectedRoute><DatasetLayout /></ProtectedRoute>}>
        <Route path="/workspaces/:workspaceId/projects/:projectId/datasets/:datasetId" element={<DatasetOverview />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId/datasets/:datasetId/validation" element={<DatasetValidation />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId/datasets/:datasetId/profiling" element={<DatasetProfiling />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId/datasets/:datasetId/cleaning" element={<DatasetCleaning />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId/datasets/:datasetId/feature-engineering" element={<DatasetFeatureEngineering />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId/datasets/:datasetId/eda" element={<DatasetEDA />} />

        <Route path="/workspaces/:workspaceId/projects/:projectId/datasets/:datasetId/train" element={<DatasetModelTraining />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId/datasets/:datasetId/compare" element={<DatasetCompareModels />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId/datasets/:datasetId/deployment" element={<DatasetModelDeployment />} />

        <Route path="/workspaces/:workspaceId/projects/:projectId/datasets/:datasetId/prediction" element={<DatasetPrediction />} />

        <Route path="/workspaces/:workspaceId/projects/:projectId/datasets/:datasetId/settings" element={<DatasetSettings />} />
      </Route>


      {/* ── Fallbacks ── */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
