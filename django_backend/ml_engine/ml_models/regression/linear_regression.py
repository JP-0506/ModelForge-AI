# from sklearn.linear_model import (
#     LinearRegression,
# )


# class LinearRegressionModel:
#     """
#     Linear Regression Model
#     """

#     def __init__(self, **parameters):
#         self.model = LinearRegression(
#             **parameters,
#         )

#     def get_model(
#         self,
#     ):
#         """
#         Return sklearn model instance.
#         """

#         return self.model

#     def get_name(
#         self,
#     ):
#         """
#         Return model name.
#         """

#         return "Linear Regression"

#     def get_problem_type(
#         self,
#     ):
#         """
#         Return problem type.
#         """

#         return "regression"

from sklearn.linear_model import LinearRegression


class LinearRegressionModel:
    """
    Linear Regression Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Linear Regression model.
        """

        return LinearRegression(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Linear Regression"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "linear_regression"

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
            "fit_intercept": True,
            "copy_X": True,
            "positive": False,
        }
