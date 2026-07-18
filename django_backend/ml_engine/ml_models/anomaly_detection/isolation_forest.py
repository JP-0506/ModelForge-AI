from sklearn.ensemble import IsolationForest


class IsolationForestModel:
    """
    Isolation Forest Model Wrapper
    """

    def create_model(self, **parameters):
        """
        Create and return Isolation Forest model.
        """

        return IsolationForest(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Isolation Forest"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "isolation_forest"

    def get_problem_type(
        self,
    ):
        """
        Return supported problem type.
        """

        return "anomaly_detection"

    def get_default_parameters(
        self,
    ):
        """
        Return default model parameters.
        """

        return {
            "n_estimators": 100,
            "max_samples": "auto",
            "contamination": "auto",
            "max_features": 1.0,
            "bootstrap": False,
            "n_jobs": -1,
            "random_state": 42,
            "verbose": 0,
            "warm_start": False,
        }
