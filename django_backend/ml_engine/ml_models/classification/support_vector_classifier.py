from sklearn.svm import (
    SVC,
)


class SupportVectorClassifierModel:
    """
    Support Vector Classifier (SVC) Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Support Vector Classifier model.
        """

        return SVC(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Support Vector Classifier"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "support_vector_classifier"

    def get_problem_type(
        self,
    ):
        """
        Return supported problem type.
        """

        return "classification"

    def get_default_parameters(
        self,
    ):
        """
        Return default model parameters.
        """

        return {
            "C": 1.0,
            "kernel": "rbf",
            "degree": 3,
            "gamma": "scale",
            "coef0": 0.0,
            "shrinking": True,
            "probability": True,
            "tol": 1e-3,
            "cache_size": 200,
            "class_weight": None,
            "verbose": False,
            "max_iter": -1,
            "decision_function_shape": "ovr",
            "break_ties": False,
            "random_state": 42,
        }