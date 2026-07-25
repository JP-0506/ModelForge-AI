import { Router } from "express";

import ReportController from "../controllers/ReportController.js";

const router = Router();

// ===================================================
// Generate Report
// ===================================================

router.post(
    "/generate",
    ReportController.generateReport.bind(
        ReportController,
    ),
);

export default router;