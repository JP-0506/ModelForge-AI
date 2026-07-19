# ==========================================
# Regression Models
# ==========================================

from ml_engine.ml_models.regression.linear_regression import (
    LinearRegressionModel,
)

from ml_engine.ml_models.regression.ridge_regression import (
    RidgeRegressionModel,
)

from ml_engine.ml_models.regression.lasso_regression import (
    LassoRegressionModel,
)

from ml_engine.ml_models.regression.decision_tree_regressor import (
    DecisionTreeRegressorModel,
)

from ml_engine.ml_models.regression.random_forest_regressor import (
    RandomForestRegressorModel,
)

from ml_engine.ml_models.regression.support_vector_regressor import (
    SupportVectorRegressorModel,
)

from ml_engine.ml_models.regression.knn_regressor import (
    KNNRegressorModel,
)

from ml_engine.ml_models.regression.gradient_boosting_regressor import (
    GradientBoostingRegressorModel,
)

from ml_engine.ml_models.regression.adaboost_regressor import (
    AdaBoostRegressorModel,
)

from ml_engine.ml_models.regression.xgboost_regressor import (
    XGBoostRegressorModel,
)

from ml_engine.ml_models.regression.lightgbm_regressor import (
    LightGBMRegressorModel,
)

from ml_engine.ml_models.regression.catboost_regressor import (
    CatBoostRegressorModel,
)

# ==========================================
# Classification Models
# ==========================================

from ml_engine.ml_models.classification.logistic_regression import (
    LogisticRegressionModel,
)

from ml_engine.ml_models.classification.decision_tree_classifier import (
    DecisionTreeClassifierModel,
)

from ml_engine.ml_models.classification.random_forest_classifier import (
    RandomForestClassifierModel,
)

from ml_engine.ml_models.classification.support_vector_classifier import (
    SupportVectorClassifierModel,
)

from ml_engine.ml_models.classification.knn_classifier import (
    KNNClassifierModel,
)

from ml_engine.ml_models.classification.gaussian_naive_bayes import (
    GaussianNaiveBayesModel,
)

from ml_engine.ml_models.classification.gradient_boosting_classifier import (
    GradientBoostingClassifierModel,
)

from ml_engine.ml_models.classification.adaboost_classifier import (
    AdaBoostClassifierModel,
)

from ml_engine.ml_models.classification.xgboost_classifier import (
    XGBoostClassifierModel,
)

from ml_engine.ml_models.classification.lightgbm_classifier import (
    LightGBMClassifierModel,
)

from ml_engine.ml_models.classification.catboost_classifier import (
    CatBoostClassifierModel,
)

# ==========================================
# Clustering Models
# ==========================================

from ml_engine.ml_models.clustering.kmeans import (
    KMeansModel,
)

from ml_engine.ml_models.clustering.agglomerative import (
    AgglomerativeClusteringModel,
)

from ml_engine.ml_models.clustering.dbscan import (
    DBSCANModel,
)

# ==========================================
# Anomaly Detection Models
# ==========================================

from ml_engine.ml_models.anomaly_detection.isolation_forest import (
    IsolationForestModel,
)

from ml_engine.ml_models.anomaly_detection.local_outlier_factor import (
    LocalOutlierFactorModel,
)

from ml_engine.ml_models.anomaly_detection.one_class_svm import (
    OneClassSVMModel,
)

# ==========================================
# Time Series Models
# ==========================================

from ml_engine.ml_models.time_series.arima import (
    ARIMAModel,
)

from ml_engine.ml_models.time_series.sarima import (
    SARIMAModel,
)

from ml_engine.ml_models.time_series.prophet import (
    ProphetModel,
)


class ModelFactory:

    MODEL_REGISTRY = {
        # ==================================
        # Regression
        # ==================================
        "regression": {
            "linear_regression": LinearRegressionModel,
            "ridge_regression": RidgeRegressionModel,
            "lasso_regression": LassoRegressionModel,
            "decision_tree_regressor": DecisionTreeRegressorModel,
            "random_forest_regressor": RandomForestRegressorModel,
            "support_vector_regressor": SupportVectorRegressorModel,
            "knn_regressor": KNNRegressorModel,
            "gradient_boosting_regressor": GradientBoostingRegressorModel,
            "adaboost_regressor": AdaBoostRegressorModel,
            "xgboost_regressor": XGBoostRegressorModel,
            "lightgbm_regressor": LightGBMRegressorModel,
            "catboost_regressor": CatBoostRegressorModel,
        },
        # ==================================
        # Classification
        # ==================================
        "classification": {
            "logistic_regression": LogisticRegressionModel,
            "decision_tree_classifier": DecisionTreeClassifierModel,
            "random_forest_classifier": RandomForestClassifierModel,
            "support_vector_classifier": SupportVectorClassifierModel,
            "knn_classifier": KNNClassifierModel,
            "gaussian_naive_bayes": GaussianNaiveBayesModel,
            "gradient_boosting_classifier": GradientBoostingClassifierModel,
            "adaboost_classifier": AdaBoostClassifierModel,
            "xgboost_classifier": XGBoostClassifierModel,
            "lightgbm_classifier": LightGBMClassifierModel,
            "catboost_classifier": CatBoostClassifierModel,
        },
        # ==================================
        # Clustering
        # ==================================
        "clustering": {
            "kmeans": KMeansModel,
            "agglomerative": AgglomerativeClusteringModel,
            "dbscan": DBSCANModel,
        },
        # ==================================
        # Anomaly Detection
        # ==================================
        "anomaly_detection": {
            "isolation_forest": IsolationForestModel,
            "local_outlier_factor": LocalOutlierFactorModel,
            "one_class_svm": OneClassSVMModel,
        },
        # ==================================
        # Time Series
        # ==================================
        "time_series": {
            "arima": ARIMAModel,
            "sarima": SARIMAModel,
            "prophet": ProphetModel,
        },
    }

    def create(
        self,
        problem_type,
        algorithm,
    ):
        """
        Return the requested model wrapper.
        """

        try:

            model_class = self.MODEL_REGISTRY[problem_type][algorithm]

            return model_class()

        except KeyError:

            raise ValueError(
                f"Unsupported algorithm '{algorithm}' "
                f"for problem type '{problem_type}'."
            )
