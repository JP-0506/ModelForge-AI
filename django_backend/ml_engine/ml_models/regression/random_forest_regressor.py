from sklearn.ensemble import RandomForestRegressor


class RandomForestRegressorModel:
    """
    Random Forest Regressor Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return Random Forest Regressor model.
        """

        return RandomForestRegressor(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "Random Forest Regressor"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "random_forest"

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
            "n_estimators": 100,
            "criterion": "squared_error",
            "max_depth": None,
            "min_samples_split": 2,
            "min_samples_leaf": 1,
            "min_weight_fraction_leaf": 0.0,
            "max_features": 1.0,
            "max_leaf_nodes": None,
            "min_impurity_decrease": 0.0,
            "bootstrap": True,
            "oob_score": False,
            "n_jobs": -1,
            "random_state": 42,
            "verbose": 0,
            "warm_start": False,
            "ccp_alpha": 0.0,
            "max_samples": None,
        }