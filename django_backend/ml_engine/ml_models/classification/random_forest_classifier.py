from sklearn.ensemble import (
    RandomForestClassifier,
)


class RandomForestClassifierModel:
    """
    Random Forest Classifier Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Random Forest Classifier model.
        """

        return RandomForestClassifier(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Random Forest Classifier"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "random_forest_classifier"

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
            "n_estimators": 100,
            "criterion": "gini",
            "max_depth": None,
            "min_samples_split": 2,
            "min_samples_leaf": 1,
            "min_weight_fraction_leaf": 0.0,
            "max_features": "sqrt",
            "max_leaf_nodes": None,
            "min_impurity_decrease": 0.0,
            "bootstrap": True,
            "oob_score": False,
            "n_jobs": -1,
            "random_state": 42,
            "verbose": 0,
            "warm_start": False,
            "class_weight": None,
            "ccp_alpha": 0.0,
            "max_samples": None,
        }
