from sklearn.ensemble import (
    AdaBoostClassifier,
)


class AdaBoostClassifierModel:
    """
    AdaBoost Classifier Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return AdaBoost Classifier model.
        """

        return AdaBoostClassifier(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "AdaBoost Classifier"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "adaboost_classifier"

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
            "estimator": None,
            "n_estimators": 50,
            "learning_rate": 1.0,
            "algorithm": "SAMME",
            "random_state": 42,
        }