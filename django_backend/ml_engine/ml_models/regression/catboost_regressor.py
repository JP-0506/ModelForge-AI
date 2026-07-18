from catboost import (
    CatBoostRegressor,
)


class CatBoostRegressorModel:
    """
    CatBoost Regressor Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return CatBoost Regressor model.
        """

        return CatBoostRegressor(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "CatBoost Regressor"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "catboost_regressor"

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
            "loss_function": "RMSE",
            "learning_rate": 0.1,
            "iterations": 100,
            "depth": 6,
            "l2_leaf_reg": 3.0,
            "subsample": 1.0,
            "random_seed": 42,
            "verbose": False,
        }