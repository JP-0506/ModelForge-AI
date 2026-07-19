from ml_engine.services.training.metrics import (
    Metrics,
)


class Evaluator:
    """
    Evaluate trained Machine Learning models.
    """

    def __init__(
        self,
    ):
        self.metrics = Metrics()

    def evaluate(
        self,
        problem_type,
        y_true=None,
        predictions=None,
        X_test=None,
        trained_model=None,
    ):
        """
        Evaluate model according to problem type.

        Parameters
        ----------
        problem_type : str

        y_true : array-like, optional

        predictions : array-like, optional

        X_test : DataFrame, optional

        trained_model : object, optional

        Returns
        -------
        dict
        """

        # ======================================
        # Regression
        # ======================================

        if problem_type == "regression":

            return self.metrics.regression_metrics(
                y_true,
                predictions,
            )

        # ======================================
        # Classification
        # ======================================

        elif problem_type == "classification":

            return self.metrics.classification_metrics(
                y_true,
                predictions,
            )

        # ======================================
        # Clustering
        # ======================================

        elif problem_type == "clustering":

            return self.metrics.clustering_metrics(
                X_test,
                predictions,
            )

        # ======================================
        # Anomaly Detection
        # ======================================

        elif problem_type == "anomaly_detection":

            return self.metrics.anomaly_detection_metrics(
                predictions,
            )

        # ======================================
        # Time Series
        # ======================================

        elif problem_type == "time_series":

            return self.metrics.time_series_metrics(
                y_true,
                predictions,
            )

        # ======================================

        raise ValueError(f"Unsupported problem type: {problem_type}")
