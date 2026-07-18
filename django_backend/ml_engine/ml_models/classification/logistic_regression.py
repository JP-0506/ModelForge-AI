from sklearn.linear_model import (
    LogisticRegression,
)


class LogisticRegressionModel:
    """
    Logistic Regression Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Logistic Regression model.
        """

        return LogisticRegression(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Logistic Regression"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "logistic_regression"

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
            "penalty": "l2",
            "dual": False,
            "tol": 1e-4,
            "C": 1.0,
            "fit_intercept": True,
            "intercept_scaling": 1,
            "class_weight": None,
            "random_state": 42,
            "solver": "lbfgs",
            "max_iter": 100,
            "multi_class": "auto",
            "verbose": 0,
            "warm_start": False,
            "n_jobs": None,
        }