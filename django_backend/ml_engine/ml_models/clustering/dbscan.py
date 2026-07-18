from sklearn.cluster import (
    DBSCAN,
)


class DBSCANModel:
    """
    DBSCAN Clustering Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return DBSCAN model.
        """

        return DBSCAN(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "DBSCAN"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "dbscan"

    def get_problem_type(
        self,
    ):
        """
        Return supported problem type.
        """

        return "clustering"

    def get_default_parameters(
        self,
    ):
        """
        Return default model parameters.
        """

        return {
            "eps": 0.5,
            "min_samples": 5,
            "metric": "euclidean",
            "metric_params": None,
            "algorithm": "auto",
            "leaf_size": 30,
            "p": None,
            "n_jobs": -1,
        }