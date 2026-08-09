import { Router } from "express";
import MLTrainingController from "../controllers/MLTrainingController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";

const router = Router();

/*
    Train Machine Learning Model & Fetch Experiments
*/
router.post(
    "/train",
    AuthMiddleware,
    MLTrainingController.trainModel,
);

router.get(
    "/experiments/project/:projectId",
    AuthMiddleware,
    MLTrainingController.getExperimentsByProject,
);

router.get(
    "/experiments/dataset/:datasetId",
    AuthMiddleware,
    MLTrainingController.getExperimentsByDataset,
);

router.get(
    "/experiments/:experimentId",
    AuthMiddleware,
    MLTrainingController.getExperimentById,
);

router.delete(
    "/models/:id",
    AuthMiddleware,
    MLTrainingController.deleteTrainedModel,
);

export default router;