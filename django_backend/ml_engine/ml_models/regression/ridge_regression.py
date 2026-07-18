from sklearn.linear_model import Ridge


class RidgeRegressionModel:
    """
    Ridge Regression Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Ridge Regression model.
        """

        return Ridge(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Ridge Regression"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "ridge"

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
            "alpha": 1.0,
            "fit_intercept": True,
            "copy_X": True,
            "max_iter": None,
            "tol": 1e-4,
            "random_state": 42,
        }
