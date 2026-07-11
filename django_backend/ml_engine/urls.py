from django.urls import path
from ml_engine.api.dataset_views import DatasetUploadView
from ml_engine.api.profiling_views import DatasetProfilingView
from ml_engine.api.cleaning_views import DatasetCleaningView
from ml_engine.api.feature_engineering_views import FeatureEngineeringView
from ml_engine.api.eda_views import EDAView

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
]
