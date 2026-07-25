from django.urls import path
from ml_engine.api.dataset_views import DatasetUploadView
from ml_engine.api.profiling_views import DatasetProfilingView
from ml_engine.api.cleaning_views import DatasetCleaningView
from ml_engine.api.feature_engineering_views import FeatureEngineeringView
from ml_engine.api.eda_views import EDAView
from ml_engine.api.training_views import TrainingAPIView
from ml_engine.api.comparison_views import ComparisonAPIView
from ml_engine.api.deployment_views import DeploymentAPIView
from ml_engine.api.prediction_views import PredictionAPIView
from ml_engine.api.report_views import ReportAPIView

urlpatterns = [
    
    path(
        "datasets/upload/",
        DatasetUploadView.as_view(),
        name="dataset-upload",
    ),
    path(
        "datasets/profile/",
        DatasetProfilingView.as_view(),
        name="dataset-profile",
    ),
    path(
        "datasets/clean/",
        DatasetCleaningView.as_view(),
        name="dataset-clean",
    ),
    path(
        "datasets/feature-engineering/",
        FeatureEngineeringView.as_view(),
        name="feature-engineering",
    ),
    path(
        "datasets/eda/",
        EDAView.as_view(),
        name="dataset-eda",
    ),

    # Model Training
    path(
        "train/",
        TrainingAPIView.as_view(),
        name="train-model",
    ),

    # Model Comparison
    path(
        "compare/",
        ComparisonAPIView.as_view(),
        name="compare-models",
    ),
    
    # Model Deploymen
    path(
        "deploy/",
        DeploymentAPIView.as_view(),
        name="deploy-model",
    ),
    
    # Machine Learning Prediction API
    path(
        "predict/",
        PredictionAPIView.as_view(),
        name="predict-model",
    ),

    # Report Generation
    path(
        "report/",
        ReportAPIView.as_view(),
        name="report",
    ),
]
