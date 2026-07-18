from sklearn.naive_bayes import (
    GaussianNB,
)


class GaussianNaiveBayesModel:
    """
    Gaussian Naive Bayes Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Gaussian Naive Bayes model.
        """

        return GaussianNB(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Gaussian Naive Bayes"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "gaussian_naive_bayes"

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
            "priors": None,
            "var_smoothing": 1e-9,
        }