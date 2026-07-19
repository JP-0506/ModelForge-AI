"""
Evaluation metrics used throughout
the ModelForge AI training pipeline.
"""

import numpy as np

from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    silhouette_score,
    davies_bouldin_score,
    calinski_harabasz_score,
)


class Metrics:
    """
    Collection of evaluation metrics for all
    supported Machine Learning problem types.
    """

    # =====================================
    # Regression Metrics
    # =====================================

    def regression_metrics(
        self,
        y_true,
        predictions,
    ):
        """
        Calculate regression metrics.
        """

        mse = mean_squared_error(
            y_true,
            predictions,
        )

        return {
            "mae": mean_absolute_error(
                y_true,
                predictions,
            ),
            "mse": mse,
            "rmse": np.sqrt(
                mse,
            ),
            "r2_score": r2_score(
                y_true,
                predictions,
            ),
        }

    # =====================================
    # Classification Metrics
    # =====================================

    def classification_metrics(
        self,
        y_true,
        predictions,
    ):
        """
        Calculate classification metrics.
        """

        cm = confusion_matrix(
            y_true,
            predictions,
        )

        tn = fp = fn = tp = 0

        if cm.shape == (2, 2):

            tn, fp, fn, tp = cm.ravel()

        specificity = 0

        if (tn + fp) > 0:

            specificity = tn / (tn + fp)

        accuracy = accuracy_score(
            y_true,
            predictions,
        )

        return {
            "accuracy": accuracy,
            "error_rate": 1 - accuracy,
            "precision": precision_score(
                y_true,
                predictions,
                average="weighted",
                zero_division=0,
            ),
            "recall": recall_score(
                y_true,
                predictions,
                average="weighted",
                zero_division=0,
            ),
            "specificity": specificity,
            "f1_score": f1_score(
                y_true,
                predictions,
                average="weighted",
                zero_division=0,
            ),
            "confusion_matrix": cm.tolist(),
        }

    # =====================================
    # Clustering Metrics
    # =====================================

    def clustering_metrics(
        self,
        X,
        labels,
    ):
        """
        Calculate clustering metrics.
        """

        return {
            "silhouette_score": silhouette_score(
                X,
                labels,
            ),
            "davies_bouldin_score": davies_bouldin_score(
                X,
                labels,
            ),
            "calinski_harabasz_score": calinski_harabasz_score(
                X,
                labels,
            ),
        }

    # =====================================
    # Anomaly Detection Metrics
    # =====================================

    def anomaly_detection_metrics(
        self,
        predictions,
    ):
        """
        Calculate anomaly detection metrics.

        (-1 = anomaly)
        (1 = normal)
        """

        total = len(
            predictions,
        )

        anomaly_count = np.sum(
            predictions == -1,
        )

        percentage = 0

        if total > 0:

            percentage = (anomaly_count / total) * 100

        return {
            "anomaly_count": int(
                anomaly_count,
            ),
            "anomaly_percentage": round(
                percentage,
                2,
            ),
        }

    # =====================================
    # Time Series Metrics
    # =====================================

    def time_series_metrics(
        self,
        y_true,
        predictions,
    ):
        """
        Calculate time series metrics.
        """

        mse = mean_squared_error(
            y_true,
            predictions,
        )

        mape = np.mean(np.abs((y_true - predictions) / y_true)) * 100

        return {
            "mae": mean_absolute_error(
                y_true,
                predictions,
            ),
            "mse": mse,
            "rmse": np.sqrt(
                mse,
            ),
            "mape": mape,
        }
