from sklearn.tree import (
    DecisionTreeClassifier,
)


class DecisionTreeClassifierModel:
    """
    Decision Tree Classifier Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Decision Tree Classifier model.
        """

        return DecisionTreeClassifier(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Decision Tree Classifier"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "decision_tree_classifier"

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
            "criterion": "gini",
            "splitter": "best",
            "max_depth": None,
            "min_samples_split": 2,
            "min_samples_leaf": 1,
            "min_weight_fraction_leaf": 0.0,
            "max_features": None,
            "random_state": 42,
            "max_leaf_nodes": None,
            "min_impurity_decrease": 0.0,
            "class_weight": None,
            "ccp_alpha": 0.0,
        }
