from sklearn.cluster import (
    AgglomerativeClustering,
)


class AgglomerativeClusteringModel:
    """
    Agglomerative Clustering Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Agglomerative Clustering model.
        """

        return AgglomerativeClustering(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Agglomerative Clustering"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "agglomerative"

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
            "n_clusters": 2,
            "metric": "euclidean",
            "memory": None,
            "connectivity": None,
            "compute_full_tree": "auto",
            "linkage": "ward",
            "distance_threshold": None,
            "compute_distances": False,
        }