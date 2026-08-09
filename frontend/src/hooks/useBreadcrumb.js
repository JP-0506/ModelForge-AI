/* ============================================================
   useBreadcrumb — hook to generate clickable, human-readable breadcrumbs
   Resolves MongoDB IDs (workspaces, projects, datasets) to actual names
   ============================================================ */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import workspaceService from '../services/workspaceService';
import projectService from '../services/projectService';
import datasetService from '../services/datasetService';

// In-memory name cache by entity ID
const nameCache = {};

export const setBreadcrumbCache = (id, name) => {
  if (id && name) {
    nameCache[id] = name;
  }
};

const useBreadcrumb = () => {
  const location = useLocation();
  const [crumbs, setCrumbs] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const parts = location.pathname.split('/').filter(Boolean);

    const resolveCrumbs = async () => {
      const result = [];

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const path = '/' + parts.slice(0, i + 1).join('/');
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(part);
        const isLast = i === parts.length - 1;

        if (isMongoId) {
          const prevPart = parts[i - 1];

          if (nameCache[part]) {
            result.push({
              label: nameCache[part],
              path,
              isLink: !isLast,
            });
          } else if (prevPart === 'workspaces') {
            try {
              const ws = await workspaceService.getById(part);
              const name = ws?.workspace_name || 'Workspace';
              nameCache[part] = name;
              result.push({ label: name, path, isLink: !isLast });
            } catch {
              result.push({ label: 'Workspace', path, isLink: !isLast });
            }
          } else if (prevPart === 'projects') {
            try {
              const proj = await projectService.getById(part);
              const name = proj?.project_name || 'Project';
              nameCache[part] = name;
              result.push({ label: name, path, isLink: !isLast });
            } catch {
              result.push({ label: 'Project', path, isLink: !isLast });
            }
          } else if (prevPart === 'datasets') {
            try {
              const ds = await datasetService.getById(part);
              const name = ds?.dataset_name || 'Dataset';
              nameCache[part] = name;
              result.push({ label: name, path, isLink: !isLast });
            } catch {
              result.push({ label: 'Dataset', path, isLink: !isLast });
            }
          } else {
            result.push({ label: 'Details', path, isLink: !isLast });
          }
        } else {
          // Standard path section (e.g. "workspaces", "projects", "datasets", "settings")
          const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
          result.push({
            label,
            path,
            isLink: !isLast,
          });
        }
      }

      if (isMounted) {
        setCrumbs(result);
      }
    };

    resolveCrumbs();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  return crumbs;
};

export default useBreadcrumb;
