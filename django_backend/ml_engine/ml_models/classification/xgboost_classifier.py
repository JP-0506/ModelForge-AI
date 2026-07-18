from xgboost import (
    XGBClassifier,
)


class XGBoostClassifierModel:
    """
    XGBoost Classifier Model Wrapper
    """

    def create_model(
        self,
        **parameters,
    ):
        """
        Create and return XGBoost Classifier model.
        """

        return XGBClassifier(
            **parameters,
        )

    def get_name(
        self,
    ):
        """
        Return display name.
        """

        return "XGBoost Classifier"

    def get_algorithm(
        self,
    ):
        """
        Return algorithm identifier.
        """

        return "xgboost_classifier"

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
            "objective": "binary:logistic",
            "n_estimators": 100,
            "learning_rate": 0.1,
            "max_depth": 6,
            "min_child_weight": 1,
            "subsample": 1.0,
            "colsample_bytree": 1.0,
            "gamma": 0,
            "reg_alpha": 0,
            "reg_lambda": 1,
            "random_state": 42,
            "n_jobs": -1,
            "verbosity": 0,
            "eval_metric": "logloss",
            "use_label_encoder": False,
        }