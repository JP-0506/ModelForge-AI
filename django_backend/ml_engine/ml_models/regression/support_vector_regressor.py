from sklearn.svm import SVR


class SupportVectorRegressorModel:
    """
    Support Vector Regressor (SVR) Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Support Vector Regressor model.
        """

        return SVR(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Support Vector Regressor"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "support_vector_regressor"

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
            "kernel": "rbf",
            "degree": 3,
            "gamma": "scale",
            "coef0": 0.0,
            "tol": 1e-3,
            "C": 1.0,
            "epsilon": 0.1,
            "shrinking": True,
            "cache_size": 200,
            "verbose": False,
            "max_iter": -1,
        }