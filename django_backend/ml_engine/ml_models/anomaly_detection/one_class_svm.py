from sklearn.svm import OneClassSVM

class OneClassSVMModel:
    """
    One-Class SVM Model Wrapper
    """

    def create_model(self, **parameters):
        """
        Create and return One-Class SVM model.
        """

        return OneClassSVM(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "One-Class SVM"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "one_class_svm"

    def get_problem_type(
        self,
    ):
        """
        Return supported problem type.
        """

        return "anomaly_detection"

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
            "nu": 0.5,
            "shrinking": True,
            "cache_size": 200,
            "verbose": False,
            "max_iter": -1,
        }
