from sklearn.cluster import (
    KMeans,
)


class KMeansModel:
    """
    K-Means Clustering Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return K-Means model.
        """

        return KMeans(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "K-Means"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "kmeans"

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
            "n_clusters": 8,
            "init": "k-means++",
            "n_init": "auto",
            "max_iter": 300,
            "tol": 1e-4,
            "verbose": 0,
            "random_state": 42,
            "copy_x": True,
            "algorithm": "lloyd",
        }