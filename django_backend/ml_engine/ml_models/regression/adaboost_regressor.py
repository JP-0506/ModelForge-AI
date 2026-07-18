from sklearn.ensemble import (
    AdaBoostRegressor,
)


class AdaBoostRegressorModel:
    """
    AdaBoost Regressor Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return AdaBoost Regressor model.
        """

        return AdaBoostRegressor(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "AdaBoost Regressor"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "adaboost_regressor"

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
            "estimator": None,
            "n_estimators": 50,
            "learning_rate": 1.0,
            "loss": "linear",
            "random_state": 42,
        }