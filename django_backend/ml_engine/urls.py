from django.urls import path
from ml_engine.api.dataset_views import DatasetUploadView
from ml_engine.api.validation_views import ValidationAPIView
from ml_engine.api.profiling_views import DatasetProfilingView
from ml_engine.api.cleaning_views import DatasetCleaningView, DatasetCleaningPreviewView
from ml_engine.api.feature_engineering_views import FeatureEngineeringView, FeatureEngineeringPreviewView
from ml_engine.api.eda_views import EDAView, EDAGetView
from ml_engine.api.training_views import TrainingAPIView
from ml_engine.api.comparison_views import ComparisonAPIView
from ml_engine.api.deployment_views import DeploymentAPIView
from ml_engine.api.prediction_views import PredictionAPIView
from ml_engine.api.report_views import ReportAPIView

urlpatterns = [
    # Dataset Upload
    path(
        "datasets/upload/",
        DatasetUploadView.as_view(),
        name="dataset-upload",
    ),
    # Dataset Validation
    path(
        "datasets/validation/",
        ValidationAPIView.as_view(),
        name="validate_dataset",
    ),
    # Dataset Profiling
    path(
        "datasets/profile/",
        DatasetProfilingView.as_view(),
        name="dataset-profile",
    ),
    # Data Cleaning
    path(
        "datasets/clean/",
        DatasetCleaningView.as_view(),
        name="dataset-clean",
    ),
    path(
        "datasets/clean/preview/",
        DatasetCleaningPreviewView.as_view(),
        name="dataset-clean-preview",
    ),
    # Feature Engineering
    path(
        "datasets/feature-engineering/",
        FeatureEngineeringView.as_view(),
        name="feature-engineering",
    ),
    path(
        "datasets/feature-engineering/preview/",
        FeatureEngineeringPreviewView.as_view(),
        name="feature-engineering-preview",
    ),

    # Exploratory Data Analysis
    path(
        "datasets/eda/",
        EDAView.as_view(),
        name="dataset-eda",
    ),
    path(
        "datasets/eda/get/",
        EDAGetView.as_view(),
        name="dataset-eda-get",
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
    # Model Deployment
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
