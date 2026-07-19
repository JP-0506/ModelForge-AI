from sklearn.model_selection import (
    KFold,
    StratifiedKFold,
    TimeSeriesSplit,
    cross_val_score,
)


class CrossValidator:
    """
    Perform cross-validation for different
    machine learning problem types.
    """

    def validate(
        self,
        model,
        X,
        y=None,
        problem_type=None,
        scoring=None,
        folds=5,
        random_state=42,
    ):
        """
        Perform cross-validation.
        """

        # -------------------------------------
        # Classification
        # -------------------------------------

        if problem_type == "classification":

            cv = StratifiedKFold(
                n_splits=folds,
                shuffle=True,
                random_state=random_state,
            )

        # -------------------------------------
        # Time Series
        # -------------------------------------

        elif problem_type == "time_series":

            cv = TimeSeriesSplit(
                n_splits=folds,
            )

        # -------------------------------------
        # Regression / Clustering /
        # Anomaly Detection
        # -------------------------------------

        else:

            cv = KFold(
                n_splits=folds,
                shuffle=True,
                random_state=random_state,
            )

        # -------------------------------------
        # Perform Cross Validation
        # -------------------------------------

        scores = cross_val_score(
            estimator=model,
            X=X,
            y=y,
            cv=cv,
            scoring=scoring,
        )

        return {
            "scores": scores.tolist(),
            "mean_score": float(scores.mean()),
            "std_score": float(scores.std()),
            "folds": folds,
        }
