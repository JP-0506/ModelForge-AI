from xgboost import (
    XGBRegressor,
)


class XGBoostRegressorModel:
    """
    XGBoost Regressor Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return XGBoost Regressor model.
        """

        return XGBRegressor(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "XGBoost Regressor"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "xgboost_regressor"

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
            "objective": "reg:squarederror",
            "n_estimators": 100,
            "learning_rate": 0.1,
            "max_depth": 6,
            "min_child_weight": 1,
            "subsample": 1.0,
            "colsample_bytree": 1.0,
            "gamma": 0,
            "reg_alpha": 0,
            "reg_lambda": 1,
            "random_state": 42,
            "n_jobs": -1,
            "verbosity": 0,
        }
