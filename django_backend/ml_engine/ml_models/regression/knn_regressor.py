from sklearn.neighbors import KNeighborsRegressor


class KNNRegressorModel:
    """
    K-Nearest Neighbors (KNN) Regressor Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return KNN Regressor model.
        """

        return KNeighborsRegressor(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "K-Nearest Neighbors Regressor"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "knn_regressor"

    def get_problem_type(
        self,
    ):
        """
        Return supported problem type.
        """

        return "regression"

    def get_default_parameters(
        self,
    ):
        """
        Return default model parameters.
        """

        return {
            "n_neighbors": 5,
            "weights": "uniform",
            "algorithm": "auto",
            "leaf_size": 30,
            "p": 2,
            "metric": "minkowski",
            "metric_params": None,
            "n_jobs": -1,
        }