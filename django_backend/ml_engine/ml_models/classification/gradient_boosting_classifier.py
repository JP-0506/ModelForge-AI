from sklearn.ensemble import (
    GradientBoostingClassifier,
)


class GradientBoostingClassifierModel:
    """
    Gradient Boosting Classifier Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Gradient Boosting Classifier model.
        """

        return GradientBoostingClassifier(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Gradient Boosting Classifier"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "gradient_boosting_classifier"

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
            "loss": "log_loss",
            "learning_rate": 0.1,
            "n_estimators": 100,
            "subsample": 1.0,
            "criterion": "friedman_mse",
            "min_samples_split": 2,
            "min_samples_leaf": 1,
            "min_weight_fraction_leaf": 0.0,
            "max_depth": 3,
            "min_impurity_decrease": 0.0,
            "random_state": 42,
            "max_features": None,
            "verbose": 0,
            "max_leaf_nodes": None,
            "warm_start": False,
            "validation_fraction": 0.1,
            "n_iter_no_change": None,
            "tol": 1e-4,
            "ccp_alpha": 0.0,
        }
