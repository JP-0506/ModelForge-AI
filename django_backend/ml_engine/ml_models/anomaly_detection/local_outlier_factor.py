from sklearn.neighbors import LocalOutlierFactor


class LocalOutlierFactorModel:
    """
    Local Outlier Factor (LOF) Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Local Outlier Factor model.
        """

        return LocalOutlierFactor(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Local Outlier Factor"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "local_outlier_factor"

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
            "n_neighbors": 20,
            "algorithm": "auto",
            "leaf_size": 30,
            "metric": "minkowski",
            "p": 2,
            "metric_params": None,
            "contamination": "auto",
            "novelty": True,
            "n_jobs": -1,
        }
