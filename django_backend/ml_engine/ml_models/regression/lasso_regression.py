from sklearn.linear_model import Lasso


class LassoRegressionModel:
    """
    Lasso Regression Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Lasso Regression model.
        """

        return Lasso(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Lasso Regression"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "lasso"

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
            "max_iter": 1000,
            "tol": 1e-4,
            "random_state": 42,
            "selection": "cyclic",
        }
