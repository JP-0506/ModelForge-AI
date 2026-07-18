from lightgbm import (
    LGBMClassifier,
)


class LightGBMClassifierModel:
    """
    LightGBM Classifier Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return LightGBM Classifier model.
        """

        return LGBMClassifier(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "LightGBM Classifier"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "lightgbm_classifier"

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
            "boosting_type": "gbdt",
            "objective": "binary",
            "learning_rate": 0.1,
            "n_estimators": 100,
            "num_leaves": 31,
            "max_depth": -1,
            "min_child_samples": 20,
            "subsample": 1.0,
            "colsample_bytree": 1.0,
            "reg_alpha": 0.0,
            "reg_lambda": 0.0,
            "random_state": 42,
            "n_jobs": -1,
            "verbosity": -1,
        }