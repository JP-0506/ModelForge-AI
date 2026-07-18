from sklearn.ensemble import (
    GradientBoostingRegressor,
)


class GradientBoostingRegressorModel:
    """
    Gradient Boosting Regressor Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Gradient Boosting Regressor model.
        """

        return GradientBoostingRegressor(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Gradient Boosting Regressor"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "gradient_boosting_regressor"

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
            "loss": "squared_error",
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
            "alpha": 0.9,
            "verbose": 0,
            "max_leaf_nodes": None,
            "warm_start": False,
            "validation_fraction": 0.1,
            "n_iter_no_change": None,
            "tol": 1e-4,
            "ccp_alpha": 0.0,
        }
