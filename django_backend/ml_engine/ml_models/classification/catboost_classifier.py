from catboost import (
    CatBoostClassifier,
)


class CatBoostClassifierModel:
    """
    CatBoost Classifier Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return CatBoost Classifier model.
        """

        return CatBoostClassifier(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "CatBoost Classifier"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "catboost_classifier"

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
            "loss_function": "Logloss",
            "learning_rate": 0.1,
            "iterations": 100,
            "depth": 6,
            "l2_leaf_reg": 3.0,
            "subsample": 1.0,
            "random_seed": 42,
            "verbose": False,
        }
